<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Rules

- 这是面向中国大陆用户的八字命盘产品网站，不是开发者 Demo。
- 首页必须体现品牌、可信度、完整产品结构和明确的开始入口。
- 所有用户可见文案使用自然、克制、可信的简体中文。
- 禁止向用户展示“实验室、命盘仪、校准、模块初始化、Submit、Loading、Error”等开发者或设定化语言。
- 首页展示区可以自定义；表单、标签页、表格、FAQ 等功能区必须遵守统一 tokens 和交互尺寸。
- 所有页面移动端优先，主要触控区不低于 44 px。
- 所有动画必须支持 `prefers-reduced-motion`。
- 结果卡片应适合微信截图，信息密度高但层级清晰。
- 八字计算通过独立接口调用，页面组件不得复制排盘规则。
- 修改 UI 前先阅读 `UI_RULES.md` 和 `COPY_RULES.md`。
