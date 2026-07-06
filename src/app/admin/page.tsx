import Link from "next/link";
import { isAdminUser } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/store";
import { AdminRuleForm } from "./AdminRuleForm";
import styles from "./admin.module.css";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) {
    return <main className={styles.page}><section className={styles.gate}><h1>玄枢管理后台</h1><p>{user ? "当前账号没有后台权限。" : "请先登录管理员账号，再进入市场交付后台。"}</p><Link href="/">返回登录</Link></section></main>;
  }

  const db = await readDb();
  const conflicts = db.syncStates.filter((item) => item.status === "conflict");
  const metrics = [
    ["用户", db.users.length], ["档案", db.profiles.length], ["报告", db.reports.length],
    ["分享记录", db.shareImages.length], ["内容规则", db.contentRules.length], ["同步冲突", conflicts.length],
  ] as const;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div className={styles.brand}><span className={styles.brandMark}>枢</span><div><strong>玄枢</strong><small>市场交付管理后台</small></div></div>
          <nav><Link href="/m">移动端</Link><Link href="/api/admin/export">脱敏导出</Link></nav>
        </header>

        <section className={styles.hero}><div><small>实时数据概览</small><h1>用户、内容与同步状态</h1><p>这里显示真实存储数据，不生成假用户、假热度或假使用量。所有管理接口都会再次校验管理员身份。</p></div><code>{user.email}</code></section>
        <section className={styles.metrics}>{metrics.map(([label, value]) => <article key={label} className={styles.metric}><span>{label}</span><strong>{value}</strong></article>)}</section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}><div><small>最近活动</small><h2>报告与分享记录</h2></div><span>各显示最近 8 条</span></div>
          <div className={styles.grid2}>
            <DataPanel title="报告记录" count={db.reports.length} rows={db.reports.slice(0, 8).map((item) => ({ primary: `${item.type.toUpperCase()} · ${item.id}`, secondary: item.profileId, time: item.createdAt, badge: item.status }))} />
            <DataPanel title="分享记录" count={db.shareImages.length} rows={db.shareImages.slice(0, 8).map((item) => ({ primary: item.title, secondary: item.profileId, time: item.createdAt, badge: item.type }))} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}><div><small>档案管理</small><h2>用户档案与同步冲突</h2></div><span>冲突不会自动覆盖</span></div>
          <div className={styles.grid2}>
            <DataPanel title="最新档案" count={db.profiles.length} rows={[...db.profiles].reverse().slice(0, 8).map((item) => ({ primary: item.name, secondary: `${item.birthDate} · ${item.birthPlace}`, time: item.createdAt, badge: item.calendarType }))} />
            <DataPanel title="待处理冲突" count={conflicts.length} rows={conflicts.slice(0, 8).map((item) => ({ primary: item.localProfileId, secondary: item.error || item.cloudProfileId, time: item.lastSyncedAt, badge: "conflict", conflict: true }))} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}><div><small>规则管理</small><h2>内容版本与发布状态</h2></div><span>启用规则可由客户端读取</span></div>
          <div className={styles.grid2}>
            <DataPanel title="现有规则" count={db.contentRules.length} rows={db.contentRules.slice(0, 8).map((item) => ({ primary: `${item.type} · ${item.version}`, secondary: item.id, time: item.updatedAt, badge: item.status }))} />
            <div className={styles.ruleForm}><AdminRuleForm /></div>
          </div>
        </section>
      </div>
    </main>
  );
}

function DataPanel({ title, count, rows }: { title: string; count: number; rows: Array<{ primary: string; secondary: string; time: string; badge: string; conflict?: boolean }> }) {
  return <section className={styles.panel}><header><strong>{title}</strong><span>{count} 条</span></header>{rows.length ? <div className={styles.rows}>{rows.map((row, index) => <article className={styles.row} key={`${row.primary}-${index}`}><div><strong className={row.conflict ? styles.conflict : undefined}>{row.primary}</strong><span>{row.secondary}</span></div><time>{new Date(row.time).toLocaleString("zh-CN")}</time><em>{row.badge}</em></article>)}</div> : <p className={styles.empty}>暂无数据</p>}</section>;
}
