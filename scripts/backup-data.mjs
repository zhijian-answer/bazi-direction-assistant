import { copyFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const dataDir = path.resolve(process.env.APP_DATA_DIR || path.join(process.cwd(), "data"));
const backupDir = path.resolve(process.env.BACKUP_DIR || path.join(dataDir, "backups"));
const retention = Number.parseInt(process.env.BACKUP_RETENTION || "30", 10);
const sourceFile = path.join(dataDir, "app-db.json");

function timestamp() {
  return new Date().toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
}

async function pathExists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function pruneBackups() {
  if (!Number.isFinite(retention) || retention <= 0) {
    return [];
  }

  const files = (await readdir(backupDir))
    .filter((file) => /^app-db-\d{4}-\d{2}-\d{2}T.*Z\.json$/.test(file))
    .sort()
    .reverse();
  const expired = files.slice(retention);

  for (const file of expired) {
    await rm(path.join(backupDir, file), { force: true });
  }

  return expired;
}

async function main() {
  if (!(await pathExists(sourceFile))) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          skipped: true,
          reason: "data file not found",
          sourceFile,
        },
        null,
        2,
      ),
    );
    return;
  }

  await mkdir(backupDir, { recursive: true });
  const destinationFile = path.join(backupDir, `app-db-${timestamp()}.json`);
  await copyFile(sourceFile, destinationFile);
  const pruned = await pruneBackups();

  console.log(
    JSON.stringify(
      {
        ok: true,
        sourceFile,
        destinationFile,
        retention,
        pruned,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
