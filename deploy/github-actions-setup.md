# GitHub Actions 自动部署配置

仓库已经包含 `.github/workflows/deploy.yml`。以后只要推送到 `main`，GitHub 会自动：

1. 安装依赖
2. 本地构建检查
3. SSH 到服务器
4. 在服务器执行 `deploy/server-deploy.sh`
5. 访问线上 `/api/health` 做健康检查

## 需要配置的 GitHub Secrets

在 GitHub 仓库：

`Settings -> Secrets and variables -> Actions -> New repository secret`

添加：

```text
DEPLOY_HOST=23.94.84.112
DEPLOY_USER=root
DEPLOY_SSH_PORT=22
DEPLOY_SSH_KEY=部署专用私钥内容
```

不要使用个人长期 SSH 私钥。建议使用部署专用 key，并把对应公钥追加到服务器：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-ed25519 AAAA... bazi-github-actions" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## 手动触发

在 GitHub 仓库页面：

`Actions -> Deploy -> Run workflow`

## 服务器 SSH 稳定性修复

服务器上执行：

```bash
curl -fsSL https://raw.githubusercontent.com/zhijian-answer/bazi-direction-assistant/main/deploy/server-ssh-stabilize.sh | bash
```

本地连接建议使用：

```bash
ssh openclaw-server
```

`~/.ssh/config` 已经为 `openclaw-server` 加了 `IPQoS none`。
