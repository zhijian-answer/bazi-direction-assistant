import Link from "next/link";

export const metadata = {
  title: "隐私说明 - 八字方向助手",
  description: "八字方向助手的数据使用和隐私说明。",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] px-5 py-10 text-[#27231d]">
      <article className="mx-auto max-w-3xl border border-[#d6c8b8] bg-white p-6">
        <Link href="/" className="text-sm text-[#9c4f35]">
          返回首页
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">隐私说明</h1>
        <div className="mt-6 space-y-5 text-sm leading-7 text-[#4f473e]">
          <p>
            本站会保存用户注册邮箱、出生档案、命盘计算结果、提问记录和系统回答，用于提供历史记录、每日次数限制和基础运营统计。
          </p>
          <p>
            出生信息属于敏感个人资料。正式上线时，应配置 HTTPS、数据库备份、管理员权限和日志脱敏，并避免在公开页面展示任何可识别个人身份的信息。
          </p>
          <p>
            如果配置了 OpenAI API，提问内容和命盘结构会被发送到模型服务用于生成回答。用户不应提交身份证号、住址、联系方式、银行卡等额外敏感信息。
          </p>
        </div>
      </article>
    </main>
  );
}
