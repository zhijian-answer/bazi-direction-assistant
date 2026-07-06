# 第三方开源组件说明

## bazi-calculator-by-alvamind

- 来源：https://github.com/alvamind/bazi-calculator-by-alvamind
- 授权：MIT
- 用途：用于公历命盘的四柱交叉校验和含藏干权重的五行比例参考。
- 说明：该包的 npm 发布物缺少声明中的 `dist` 目录。本项目在安装依赖后从包内 MIT 源码生成运行文件，不修改其算法。

## lunar-javascript

- 来源：https://github.com/6tail/lunar-javascript
- 用途：阳历、农历转换，四柱、十神、藏干、纳音、大运与流年计算。

## iztro

- 版本：2.5.8（精确锁定）
- 来源：https://github.com/SylarLong/iztro
- 授权：MIT
- 版权：Copyright (c) 2023 All Contributors
- 用途：根据阳历或农历出生日期、出生时辰和性别生成紫微斗数十二宫、星曜、四化与运限的结构化数据。
- 说明：本项目仅使用本地开源排盘核心，不接入 iztro Chat API、Agents SDK 或其他远程 AI 服务。第三方原始字段仅在 `src/lib/ziwei/engines/iztroEngine.ts` 内读取，页面只消费本项目标准化后的结果。

## 8Char-Uni-App

- 来源：https://github.com/axbug/8Char-Uni-App
- 授权：GPL-3.0
- 用途：仅参考公开的功能分层和移动端信息组织思路。
- 说明：本项目未复制该仓库的源码、样式、素材或文案。

## circular-natal-horoscope-js

- 版本：1.1.0
- 来源：https://github.com/0xStarcat/CircularNatalHoroscopeJS
- 授权：Unlicense
- 用途：根据出生日期、时间和经纬度计算热带黄道星体落座、上升点、中天、宫位与主要相位。
- 说明：第三方字段只在 `src/lib/zodiac/circularEngine.ts` 中读取，页面仅消费 `ZodiacEngine` 标准结构。时辰或地点不足时不生成上升星座结论。
