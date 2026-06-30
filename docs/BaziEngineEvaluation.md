# 八字排盘开源库评估

## 当前结论

当前项目使用 `lunar-javascript` 作为主排盘引擎，覆盖阳历转农历、农历与闰月输入、四柱、五行、十神、藏干、纳音、大运和流年。

`src/lib/bazi.ts` 已作为排盘适配层，外部页面、报告、每日建议只依赖统一的 `BaziChart` 结构。MIT 的 `bazi-calculator-by-alvamind` 已接入公历命盘辅助核对，并提供含藏干权重的五行比例；它不替换主引擎的农历能力。

## alvamind/bazi-calculator-by-alvamind

- 仓库：`https://github.com/alvamind/bazi-calculator-by-alvamind`
- 授权：MIT
- 技术形态：TypeScript / Node.js
- npm 包名：`bazi-calculator-by-alvamind`
- 当前 npm 版本：`1.0.2`

优点：

- 授权清楚，MIT 可以用于本项目。
- 结构清晰，有 `BaziCalculator` 类，输出四柱、五行、日主、贵人、文昌、驿马、桃花、八宅等分析结果。
- 可作为未来专业排盘增强和交叉校验来源。

风险：

- npm 包入口指向 `dist/index.js`，但当前发布包实际只包含 `src`，没有 `dist`，直接安装后存在导入失败风险。
- 日期映射范围为 1930-2048，超出范围会报错。
- 主要以公历日期映射计算为核心，不能直接替代当前项目的农历输入能力。
- 原始版本的时区、出生地点处理能力有限，需要额外适配。

当前处理：

- 已作为生产依赖使用，但只承担辅助校验，不替换主引擎。
- `scripts/prepare-alvamind.mjs` 在安装后从包内 MIT 源码生成缺失的 `dist` 文件，不修改算法。
- 页面会显示双引擎四柱一致数量；口径不一致时明确以主引擎为准。
- 仍需持续扩充命例集，尤其是子时、节气交界、闰月和海外出生时区。

## @aharris02/bazi-calculator-by-alvamind

- 仓库：`https://github.com/aharris02/bazi-calculator-by-alvamind`
- 授权：MIT
- npm 包名：`@aharris02/bazi-calculator-by-alvamind`
- 当前 npm 版本：`1.0.16`

优点：

- 是 alvamind 包的兼容性 fork。
- npm 包包含 `dist`，更适合直接在 Next.js / Node.js 环境导入。
- README 明确支持 IANA 时区、未知出生时辰、大运、流日/日期范围分析等能力。

风险：

- 不是用户最初点名的原仓库，需要单独确认是否接受 fork。
- 需要额外依赖 `date-fns` 和 `date-fns-tz`。
- 接入前仍需和当前 `lunar-javascript` 输出做系统对比。

建议：

- 作为第二阶段候选引擎。
- 如果要快速增强大运、流年、时区处理，可以先在独立分支接入并做 A/B 输出对比。

## axbug/8Char-Uni-App

- 仓库：`https://github.com/axbug/8Char-Uni-App`
- 授权：GPL-3.0
- 技术形态：Uni-App / Vue

可学习方向：

- 页面结构：命主信息、基本命盘、专业细盘、在线批命。
- 数据模块：四柱、十神、藏干、纳音、星运、空亡、神煞、称骨、五行、大运流年、古籍参考。
- 移动端 H5 信息组织方式。

限制：

- GPL-3.0 授权不适合直接复制进当前项目，除非整个项目按 GPL 开源发布。
- README 中写有部署保留项目信息和禁止商用声明。即使本项目目前免费，也计划未来接一点广告维持运行，所以不能直接搬代码或素材。

建议：

- 只学习产品结构、信息层级和移动端交互，不复制源码、样式、素材和文案。
- 把它的功能拆成后续路线图：专业细盘、大运流年页、古籍参考解释、分享海报升级。

## 下一步排盘引擎路线

1. 主引擎继续使用 `lunar-javascript`。
2. 辅助引擎使用 `bazi-calculator-by-alvamind`，只校验公历命盘并提供加权五行。
3. 持续建立命例测试集，覆盖阳历、农历、闰月、子时、未知时辰、节气交界和边界年份。
4. 后续增加真太阳时前，先明确经纬度、时区和采用口径，避免把近似值包装成精确结果。
5. 对外继续保持“传统文化研究 / 娱乐参考 / 自我探索”边界，不做确定性预测。
