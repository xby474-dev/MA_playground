# 部署与首次发布

## GitHub Pages

本项目不需要 API Key 或服务器。生成的 `dist/` 是完整静态站点，默认兼容仓库子路径 `/MA_playground/`。

1. 将代码提交到仓库的 `main` 分支。保持已有远端提交历史；不要 `push --force`。
2. 仓库管理员进入 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。这是仓库设置，工作流文件不能替代所需权限。
3. 工作流 `.github/workflows/ci-pages.yml` 执行语法检查、数学/状态/内容测试、构建和 Chromium 回归测试。仅 `main` 分支在非 PR 事件下触发部署。
4. 部署成功后使用 Actions 中 `github-pages` 环境返回的实际链接。预定为 `https://xby474-dev.github.io/MA_playground/`，不能仅凭 URL 形式认定已经上线。

如果测试失败，部署不会进行。若 Pages 未启用，`configure-pages` 可能失败；配置 Source 后从 Actions 手动运行工作流。

只需仓库标准 `GITHUB_TOKEN`：验证任务使用 `contents: read`；部署任务额外使用 `pages: write`、`id-token: write`。不需要在源码中存入 PAT、密码或个人密钥。

## 本地生产预览

```bash
npm run verify
npm run preview
```

预览地址为 `http://127.0.0.1:4173/`，也支持测试 `http://127.0.0.1:4173/MA_playground/`。本地服务器只绑定 loopback；它是开发/验证工具，不用于生产公网服务。

## 其他静态托管

构建命令 `npm run build`，输出目录 `dist`。不要把源码根目录、`.git`、测试结果或环境变量文件当成公开构建产物。

## 离线使用

直接打开构建后的 `dist/standalone.html`，或用 `dist/field-lab.html` 直接进入新统一实验。两个入口都包含三个完整实验。分享本机 `file://` 链接不能让其他设备访问你的文件；部署后再分享 URL。网络版与单文件版使用同一组数学函数和教学内容。

## 发布完成的判断

本地 commit、本地 build、远端 push、Actions 成功、站点 HTTP 可用是五个不同状态。核对 [STATUS.md](STATUS.md) 与实际 Actions 运行，不能把其中一个当成另外几个。
