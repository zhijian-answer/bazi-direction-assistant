"use client";

import { useState } from "react";

const ruleTypes = ["daily", "question", "bazi", "zodiac", "ziwei", "liupan", "disclaimer", "onboarding"];

export function AdminRuleForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setMessage("");
    try {
      const contentText = String(formData.get("content") || "{}");
      const response = await fetch("/api/content-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.get("type"),
          version: formData.get("version"),
          status: formData.get("status"),
          content: JSON.parse(contentText),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "保存失败");
      setMessage("规则已保存，刷新页面可查看最新版本。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form action={submit}>
      <label>规则类型<select name="type" defaultValue="daily">{ruleTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      <label>版本<input name="version" defaultValue="market-v1" maxLength={40} /></label>
      <label>状态<select name="status" defaultValue="draft"><option value="draft">草稿</option><option value="active">启用</option><option value="archived">归档</option></select></label>
      <label className="admin-rule-content">JSON 内容<textarea name="content" defaultValue={'{"title":"今日观察","enabled":true}'} rows={5} /></label>
      <button type="submit" disabled={busy}>{busy ? "正在保存" : "保存规则"}</button>
      {message ? <p role="status">{message}</p> : null}
    </form>
  );
}
