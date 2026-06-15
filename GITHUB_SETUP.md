# GitHub 仓库推送说明

当前项目已经是本地 git 仓库，分支为 `main`。代码、部署文件和 GitHub Actions CI 都已经提交。

## 需要你准备

在 GitHub 新建一个空仓库，推荐仓库名：

```text
bazi-direction-assistant
```

新建仓库时不要勾选 README、`.gitignore` 或 license，因为本地项目已经包含这些文件。

## 推送方式

拿到仓库地址后，在项目目录运行：

```powershell
.\scripts\push-github.ps1 -RemoteUrl "https://github.com/你的用户名/bazi-direction-assistant.git"
```

如果浏览器或 Git Credential Manager 已保存 GitHub 登录状态，推送会直接完成；如果没有，会弹出 GitHub 登录窗口。

## 推送后自动检查

仓库包含 `.github/workflows/ci.yml`。推送到 GitHub 后会自动执行：

- `npm ci`
- `npm run check`
- 启动生产服务
- `/api/health` 健康检查
- `npm run smoke` 核心流程烟测

## 当前本地提交

```text
096fd1c Add GitHub push helper
1238445 Add GitHub CI workflow
bf16afa Build free bazi direction assistant
```
