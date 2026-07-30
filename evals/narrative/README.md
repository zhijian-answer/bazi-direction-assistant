# 玄枢文案模型评测

这套评测不会进入 App 生产依赖。它用固定案例比较不同 OpenAI-compatible API，避免仅凭单条输出选择模型。

## 运行

在项目根目录设置临时环境变量，不要把密钥写进配置文件：

```powershell
$env:AI_PROVIDER = "deepseek"
$env:AI_MODEL = "deepseek-v4-pro"
$env:AI_BASE_URL = "https://api.deepseek.com"
$env:AI_API_KEY = "你的密钥"
npm run eval:copy
```

更换供应商后重复运行，并保留 `output/narrative-eval` 的结果用于人工对照。发布前至少人工复核：事实是否被改写、是否有生活场景、是否存在绝对预测、是否值得继续阅读。
