const baseUrl = (process.env.SMOKE_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const password = process.env.SMOKE_PASSWORD || "password123";
const email = process.env.SMOKE_EMAIL || `smoke-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
const smokeNow = new Date();
const smokeYear = smokeNow.getFullYear();
const smokeMonth = smokeNow.getMonth() + 1;

const cookieJar = new Map();

function updateCookies(response) {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) {
    return;
  }
  for (const cookie of setCookie.split(/,(?=[^;]+?=)/)) {
    const [pair] = cookie.split(";");
    const [name, value] = pair.split("=");
    if (name && value) {
      cookieJar.set(name.trim(), value.trim());
    }
  }
}

function cookieHeader() {
  return [...cookieJar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const cookies = cookieHeader();
  if (cookies) {
    headers.set("cookie", cookies);
  }
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });
  updateCookies(response);
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { response, data, text };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const health = await request("/api/health");
  assert(health.response.ok, `health failed: ${health.response.status}`);
  assert(health.data?.status === "ok", "health status is not ok");
  assert(health.data?.app_id === "bazi-direction-assistant", "unexpected app id");

  const manifest = await request("/manifest.webmanifest");
  assert(manifest.response.ok, `manifest failed: ${manifest.response.status}`);
  assert(manifest.data?.name === "八字方向助手", "manifest name mismatch");
  assert(manifest.data?.display === "standalone", "manifest display should be standalone");
  assert(manifest.data?.icons?.length >= 2, "manifest icons missing");

  const appIcon = await request("/app-icon.svg");
  assert(appIcon.response.ok, `app icon failed: ${appIcon.response.status}`);
  assert(typeof appIcon.data === "string" && appIcon.data.includes("<svg"), "app icon svg missing");

  const maskableIcon = await request("/maskable-icon.svg");
  assert(maskableIcon.response.ok, `maskable icon failed: ${maskableIcon.response.status}`);
  assert(typeof maskableIcon.data === "string" && maskableIcon.data.includes("<svg"), "maskable icon svg missing");

  const register = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke User",
      email,
      password,
    }),
  });
  assert(register.response.ok, `register failed: ${register.response.status} ${register.text}`);
  assert(cookieJar.has("bazi_session"), "register did not set session cookie");

  const profile = await request("/api/profiles", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Profile",
      gender: "male",
      calendarType: "solar",
      birthDate: "1990-05-20",
      birthTime: "09:00",
      birthPlace: "Shanghai",
      timeUnknown: false,
    }),
  });
  assert(profile.response.ok, `profile failed: ${profile.response.status} ${profile.text}`);
  assert(profile.data?.profile?.chart?.pillars?.day, "profile chart missing day pillar");

  const extraProfile = await request("/api/profiles", {
    method: "POST",
    body: JSON.stringify({
      name: "Smoke Extra Profile",
      gender: "female",
      calendarType: "solar",
      birthDate: "1992-08-18",
      birthTime: "10:30",
      birthPlace: "Beijing",
      timeUnknown: false,
    }),
  });
  assert(extraProfile.response.ok, `extra profile failed: ${extraProfile.response.status} ${extraProfile.text}`);
  assert(extraProfile.data?.profile?.id, "extra profile id missing");

  const extraCheckin = await request("/api/checkins", {
    method: "POST",
    body: JSON.stringify({
      profileId: extraProfile.data.profile.id,
      action: "删除档案前的测试打卡",
      note: "这个记录应随档案删除",
    }),
  });
  assert(extraCheckin.response.ok, `extra checkin failed: ${extraCheckin.response.status} ${extraCheckin.text}`);

  const extraQuestion = await request("/api/questions", {
    method: "POST",
    body: JSON.stringify({
      profileId: extraProfile.data.profile.id,
      category: "direction",
      question: "这个额外档案适合先做什么？",
    }),
  });
  assert(extraQuestion.response.ok, `extra question failed: ${extraQuestion.response.status} ${extraQuestion.text}`);

  const deleteExtraProfile = await request(`/api/profiles?profileId=${encodeURIComponent(extraProfile.data.profile.id)}`, {
    method: "DELETE",
  });
  assert(deleteExtraProfile.response.ok, `delete extra profile failed: ${deleteExtraProfile.response.status} ${deleteExtraProfile.text}`);
  assert(deleteExtraProfile.data?.deleted?.profiles === 1, "delete extra profile did not remove profile");
  assert(deleteExtraProfile.data?.deleted?.questions >= 1, "delete extra profile did not remove questions");
  assert(deleteExtraProfile.data?.deleted?.checkins >= 1, "delete extra profile did not remove checkins");

  const daily = await request(`/api/daily?profileId=${encodeURIComponent(profile.data.profile.id)}`);
  assert(daily.response.ok, `daily guidance failed: ${daily.response.status} ${daily.text}`);
  assert(daily.data?.guidance?.theme, "daily guidance theme missing");
  assert(daily.data?.guidance?.suitable?.length >= 1, "daily guidance suitable list missing");

  const checkin = await request("/api/checkins", {
    method: "POST",
    body: JSON.stringify({
      profileId: profile.data.profile.id,
      action: "完成一个 15 分钟行动",
      note: "烟测记录：今天先做一小步",
    }),
  });
  assert(checkin.response.ok, `checkin failed: ${checkin.response.status} ${checkin.text}`);
  assert(checkin.data?.checkin?.action, "checkin action missing");

  const checkins = await request(`/api/checkins?profileId=${encodeURIComponent(profile.data.profile.id)}`);
  assert(checkins.response.ok, `checkins read failed: ${checkins.response.status} ${checkins.text}`);
  assert(checkins.data?.today?.id === checkin.data.checkin.id, "today checkin missing");
  assert(checkins.data?.checkins?.length >= 1, "checkins list missing");
  assert(checkins.data?.stats?.checkedToday === true, "checkin stats should mark today checked");
  assert(checkins.data?.stats?.currentStreak >= 1, "checkin current streak missing");
  assert(checkins.data?.stats?.last7Days?.length === 7, "checkin last 7 days missing");

  const actionCard = await request(`/api/action-card?profileId=${encodeURIComponent(profile.data.profile.id)}`);
  assert(actionCard.response.ok, `action card failed: ${actionCard.response.status} ${actionCard.text}`);
  assert(actionCard.data?.card?.supportNote, "action card support note missing");
  assert(actionCard.data?.card?.groundingSteps?.length >= 3, "action card grounding steps missing");
  assert(actionCard.data?.card?.tinyActions?.length >= 3, "action card tiny actions missing");
  assert(actionCard.data?.card?.disclaimer, "action card disclaimer missing");

  const report = await request(`/api/reports?profileId=${encodeURIComponent(profile.data.profile.id)}`);
  assert(report.response.ok, `report failed: ${report.response.status} ${report.text}`);
  assert(report.data?.report?.title, "report title missing");
  assert(report.data?.report?.sections?.length >= 3, "report sections missing");
  assert(report.data?.report?.actionPlan?.length >= 3, "report action plan missing");

  const forecast = await request(`/api/forecast?profileId=${encodeURIComponent(profile.data.profile.id)}&year=${smokeYear}&month=${smokeMonth}`);
  assert(forecast.response.ok, `forecast failed: ${forecast.response.status} ${forecast.text}`);
  assert(forecast.data?.forecast?.title, "forecast title missing");
  assert(forecast.data?.forecast?.year === smokeYear, "forecast year mismatch");
  assert(forecast.data?.forecast?.currentMonth?.theme, "forecast current month missing");
  assert(forecast.data?.forecast?.currentMonth?.month === smokeMonth, "forecast current month mismatch");
  assert(forecast.data?.forecast?.months?.length === 12, "forecast months missing");

  const coverCard = await request(`/api/share-card?profileId=${encodeURIComponent(profile.data.profile.id)}&type=cover`);
  assert(coverCard.response.ok, `cover card failed: ${coverCard.response.status} ${coverCard.text}`);
  assert(coverCard.response.headers.get("content-type")?.includes("image/svg+xml"), "cover card content type is not svg");
  assert(typeof coverCard.data === "string" && coverCard.data.includes("<svg"), "cover card svg missing");

  const dailyCard = await request(`/api/share-card?profileId=${encodeURIComponent(profile.data.profile.id)}&type=daily`);
  assert(dailyCard.response.ok, `daily card failed: ${dailyCard.response.status} ${dailyCard.text}`);
  assert(dailyCard.response.headers.get("content-type")?.includes("image/svg+xml"), "daily card content type is not svg");
  assert(typeof dailyCard.data === "string" && dailyCard.data.includes("今日方向"), "daily card svg missing title");

  const wuxingCard = await request(`/api/share-card?profileId=${encodeURIComponent(profile.data.profile.id)}&type=wuxing`);
  assert(wuxingCard.response.ok, `wuxing card failed: ${wuxingCard.response.status} ${wuxingCard.text}`);
  assert(wuxingCard.response.headers.get("content-type")?.includes("image/svg+xml"), "wuxing card content type is not svg");
  assert(typeof wuxingCard.data === "string" && wuxingCard.data.includes("五行能量图"), "wuxing card svg missing title");

  const question = await request("/api/questions", {
    method: "POST",
    body: JSON.stringify({
      profileId: profile.data.profile.id,
      category: "direction",
      question: "我现在迷茫，应该先做哪三件事？",
    }),
  });
  assert(question.response.ok, `question failed: ${question.response.status} ${question.text}`);
  assert(question.data?.question?.answer, "question answer missing");

  const me = await request("/api/me");
  assert(me.response.ok, `me failed: ${me.response.status}`);
  assert(me.data?.profiles?.length >= 1, "profile did not persist");
  assert(me.data?.questions?.length >= 1, "question did not persist");
  assert(me.data?.checkins?.length >= 1, "checkin did not persist");
  assert(!me.data.profiles.some((item) => item.id === extraProfile.data.profile.id), "deleted extra profile still visible");
  assert(!me.data.questions.some((item) => item.profileId === extraProfile.data.profile.id), "deleted extra profile questions still visible");
  assert(!me.data.checkins.some((item) => item.profileId === extraProfile.data.profile.id), "deleted extra profile checkins still visible");

  const myExport = await request("/api/me/export");
  assert(myExport.response.ok, `my data export failed: ${myExport.response.status} ${myExport.text}`);
  assert(myExport.response.headers.get("content-type")?.includes("application/json"), "my data export is not json");
  assert(myExport.response.headers.get("content-disposition")?.includes("bazi-my-data"), "my data export filename missing");
  assert(myExport.data?.scope === "current-user", "my data export scope mismatch");
  assert(myExport.data?.user?.email === email, "my data export user mismatch");
  assert(myExport.data?.profiles?.length >= 1, "my data export profiles missing");
  assert(myExport.data?.questions?.length >= 1, "my data export questions missing");
  assert(myExport.data?.checkins?.length >= 1, "my data export checkins missing");
  assert(myExport.data?.generated?.[0]?.report?.title, "my data export report missing");
  assert(!myExport.text.includes("passwordHash"), "my data export leaked passwordHash field");
  assert(!myExport.text.includes("salt"), "my data export leaked salt field");
  assert(!myExport.text.includes("token"), "my data export leaked token field");

  const exportAttempt = await request("/api/admin/export");
  assert(exportAttempt.response.status === 403, `non-admin export should be 403, got ${exportAttempt.response.status}`);

  const deleteMe = await request("/api/me", { method: "DELETE" });
  assert(deleteMe.response.ok, `delete me failed: ${deleteMe.response.status} ${deleteMe.text}`);
  assert(deleteMe.data?.deleted?.users === 1, "delete me did not remove user");
  assert(deleteMe.data?.deleted?.profiles >= 1, "delete me did not remove profiles");
  assert(deleteMe.data?.deleted?.questions >= 1, "delete me did not remove questions");
  assert(deleteMe.data?.deleted?.checkins >= 1, "delete me did not remove checkins");

  const meAfterDelete = await request("/api/me");
  assert(meAfterDelete.response.ok, `me after delete failed: ${meAfterDelete.response.status}`);
  assert(meAfterDelete.data?.user === null, "deleted account still has a session");
  assert(meAfterDelete.data?.profiles?.length === 0, "deleted account profiles still visible");
  assert(meAfterDelete.data?.questions?.length === 0, "deleted account questions still visible");
  assert(meAfterDelete.data?.checkins?.length === 0, "deleted account checkins still visible");

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        email,
        aiMode: health.data.ai_mode,
        pwa: manifest.data.display,
        profileId: profile.data.profile.id,
        dailyTheme: daily.data.guidance.theme,
        checkinId: checkin.data.checkin.id,
        checkinStreak: checkins.data.stats.currentStreak,
        actionCard: actionCard.data.card.title,
        reportTitle: report.data.report.title,
        forecastTitle: forecast.data.forecast.title,
        myDataExport: myExport.data.scope,
        accountDeleted: true,
        shareCards: ["daily", "cover", "wuxing"],
        questionId: question.data.question.id,
        remainingToday: question.data.remainingToday,
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
