<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Rules

- 这是面向中国大陆用户的八字命盘产品网站，不是开发者 Demo。
- 首页必须体现品牌、可信度、完整产品结构和明确的开始入口。
- 所有用户可见文案使用自然、克制、可信的简体中文。
- 禁止向用户展示“实验室、命盘仪、校准、模块初始化、Submit、Loading、Error”等开发者或设定化语言。
- 禁止在客户端展示依赖包、引擎名、版本号、内部阶段、规则 ID 和开发进度；专业依据只说明用户资料与命理结构，不暴露实现细节。
- 未完成的模块不进入正式导航。不要用“规划中、接入中、校准中”的功能卡片把产品路线图展示给客户。
- 首页展示区可以自定义；表单、标签页、表格、FAQ 等功能区必须遵守统一 tokens 和交互尺寸。
- 所有页面移动端优先，主要触控区不低于 44 px。
- 所有动画必须支持 `prefers-reduced-motion`。
- 结果卡片应适合微信截图，信息密度高但层级清晰。
- 八字计算通过独立接口调用，页面组件不得复制排盘规则。
- 修改 UI 前先阅读 `UI_RULES.md` 和 `COPY_RULES.md`。
- 需要新增或重做 UI 时，优先以已确认的 Figma AI 设计为视觉来源；不要由工程组件自行发明另一套风格。
- Figma 中的个性化报告示例不是生产数据。新 UI 的动态结论、报告正文与追问必须接服务端 DeepSeek 内容接口，固定导航和操作提示仍保存在本地。
