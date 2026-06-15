param(
  [Parameter(Mandatory = $true)]
  [string]$RemoteUrl,

  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

function Fail($Message) {
  Write-Error $Message
  exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Fail "未找到 git，请先安装 Git for Windows。"
}

$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
  Fail "当前目录不是 git 仓库。请在项目目录内运行此脚本。"
}

Set-Location $repoRoot

$status = git status --porcelain
if ($status) {
  Fail "当前有未提交变更。请先提交或处理后再推送。"
}

if ($RemoteUrl -notmatch "^https://github\.com/.+/.+\.git$") {
  Fail "仓库地址格式不正确。示例：https://github.com/your-name/bazi-direction-assistant.git"
}

$currentBranch = git branch --show-current
if ($currentBranch -ne $Branch) {
  git branch -M $Branch
}

$origin = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0 -and $origin) {
  if ($origin -ne $RemoteUrl) {
    git remote set-url origin $RemoteUrl
  }
} else {
  git remote add origin $RemoteUrl
}

Write-Host "正在推送 $Branch 到 $RemoteUrl"
git push -u origin $Branch
