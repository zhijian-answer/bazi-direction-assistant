import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { appLimits, trimToLimit } from "./limits";
import type {
  ActionCheckin,
  AppDb,
  BirthProfile,
  GuidanceQuestion,
  PublicUser,
  Session,
  User,
} from "./types";

const emptyDb: AppDb = {
  users: [],
  sessions: [],
  profiles: [],
  questions: [],
  checkins: [],
};

let writeQueue = Promise.resolve();

function getDataFile() {
  const dataDir = process.env.APP_DATA_DIR || path.join(process.cwd(), "data");
  return path.join(dataDir, "app-db.json");
}

async function ensureStore() {
  const file = getDataFile();
  await mkdir(path.dirname(file), { recursive: true });
  return file;
}

export function publicUser(user: User): PublicUser {
  const { passwordHash, salt, ...safeUser } = user;
  void passwordHash;
  void salt;
  return safeUser;
}

export async function readDb(): Promise<AppDb> {
  const file = await ensureStore();
  try {
    const raw = await readFile(file, "utf8");
    return { ...emptyDb, ...JSON.parse(raw) };
  } catch {
    await writeDb(emptyDb);
    return structuredClone(emptyDb);
  }
}

export async function writeDb(db: AppDb) {
  const file = await ensureStore();
  const tempFile = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempFile, JSON.stringify(db, null, 2), "utf8");
  await rename(tempFile, file);
}

async function mutateDb<T>(mutator: (db: AppDb) => T | Promise<T>) {
  const run = async () => {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  };
  const task = writeQueue.then(run, run);
  writeQueue = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

export function newId(prefix: string) {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 18)}`;
}

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { salt, passwordHash: hash };
}

export function verifyPassword(password: string, user: User) {
  const attempted = Buffer.from(hashPassword(password, user.salt).passwordHash, "hex");
  const actual = Buffer.from(user.passwordHash, "hex");
  return attempted.length === actual.length && timingSafeEqual(attempted, actual);
}

export async function createUser(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  if (password.length < 6) {
    throw new Error("密码至少需要 6 位");
  }
  const { salt, passwordHash } = hashPassword(password);
  return mutateDb((db) => {
    if (db.users.some((user) => user.email === email)) {
      throw new Error("这个邮箱已经注册");
    }
    const user: User = {
      id: newId("user"),
      name: trimToLimit(input.name || "新用户", appLimits.maxProfileNameChars) || "新用户",
      email,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
      dailyQuestionLimit: appLimits.dailyQuestionLimit,
    };
    db.users.push(user);
    return user;
  });
}

export async function createSession(userId: string): Promise<Session> {
  return mutateDb((db) => {
    const now = Date.now();
    db.sessions = db.sessions.filter((session) => new Date(session.expiresAt).getTime() > now);
    const session: Session = {
      token: randomBytes(32).toString("hex"),
      userId,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 30).toISOString(),
    };
    db.sessions.push(session);
    return session;
  });
}

export async function deleteSession(token: string) {
  await mutateDb((db) => {
    db.sessions = db.sessions.filter((session) => session.token !== token);
  });
}

export async function deleteUserData(userId: string) {
  return mutateDb((db) => {
    const deleted = {
      users: db.users.filter((user) => user.id === userId).length,
      sessions: db.sessions.filter((session) => session.userId === userId).length,
      profiles: db.profiles.filter((profile) => profile.userId === userId).length,
      questions: db.questions.filter((question) => question.userId === userId).length,
      checkins: db.checkins.filter((checkin) => checkin.userId === userId).length,
    };

    db.users = db.users.filter((user) => user.id !== userId);
    db.sessions = db.sessions.filter((session) => session.userId !== userId);
    db.profiles = db.profiles.filter((profile) => profile.userId !== userId);
    db.questions = db.questions.filter((question) => question.userId !== userId);
    db.checkins = db.checkins.filter((checkin) => checkin.userId !== userId);

    return deleted;
  });
}

export async function findUserBySession(token?: string) {
  if (!token) {
    return null;
  }
  const db = await readDb();
  const now = Date.now();
  const session = db.sessions.find(
    (item) => item.token === token && new Date(item.expiresAt).getTime() > now,
  );
  if (!session) {
    return null;
  }
  return db.users.find((user) => user.id === session.userId) || null;
}

export async function addProfile(profile: BirthProfile) {
  await mutateDb((db) => {
    db.profiles.push(profile);
  });
}

export async function addProfileWithLimit(profile: BirthProfile, maxProfilesPerUser: number) {
  await mutateDb((db) => {
    const existingProfileCount = db.profiles.filter((item) => item.userId === profile.userId).length;
    if (existingProfileCount >= maxProfilesPerUser) {
      throw new Error(`每个账号最多保存 ${maxProfilesPerUser} 个命盘档案`);
    }
    db.profiles.push(profile);
  });
}

export async function deleteProfileData(input: { userId: string; profileId: string }) {
  return mutateDb((db) => {
    const profile = db.profiles.find(
      (item) => item.id === input.profileId && item.userId === input.userId,
    );
    if (!profile) {
      throw new Error("命盘档案不存在");
    }

    const deleted = {
      profiles: 1,
      questions: db.questions.filter(
        (question) => question.userId === input.userId && question.profileId === input.profileId,
      ).length,
      checkins: db.checkins.filter(
        (checkin) => checkin.userId === input.userId && checkin.profileId === input.profileId,
      ).length,
    };

    db.profiles = db.profiles.filter((item) => item.id !== input.profileId);
    db.questions = db.questions.filter(
      (question) => !(question.userId === input.userId && question.profileId === input.profileId),
    );
    db.checkins = db.checkins.filter(
      (checkin) => !(checkin.userId === input.userId && checkin.profileId === input.profileId),
    );

    return deleted;
  });
}

export async function addQuestion(question: GuidanceQuestion) {
  await mutateDb((db) => {
    db.questions.push(question);
  });
}

export async function addQuestionWithDailyLimit(question: GuidanceQuestion, dailyQuestionLimit: number) {
  await mutateDb((db) => {
    const usedToday = questionsToday(db.questions, question.userId).length;
    if (usedToday >= dailyQuestionLimit) {
      throw new Error("今天的免费提问次数已用完，明天再来。");
    }
    db.questions.push(question);
  });
}

export async function upsertActionCheckin(checkin: ActionCheckin) {
  return mutateDb((db) => {
    const existingIndex = db.checkins.findIndex(
      (item) =>
        item.userId === checkin.userId &&
        item.profileId === checkin.profileId &&
        item.date === checkin.date,
    );

    if (existingIndex >= 0) {
      const existing = db.checkins[existingIndex];
      const updated: ActionCheckin = {
        ...existing,
        action: checkin.action,
        note: checkin.note,
        updatedAt: checkin.updatedAt,
      };
      db.checkins[existingIndex] = updated;
      return updated;
    }

    db.checkins.push(checkin);
    return checkin;
  });
}

export function questionsToday(questions: GuidanceQuestion[], userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  return questions.filter(
    (question) => question.userId === userId && question.createdAt.slice(0, 10) === today,
  );
}
