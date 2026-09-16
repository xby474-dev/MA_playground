# v1.2 交付状态

日期：2026-09-16。

**v1.2 已推送到真实 GitHub 远端，GitHub Actions 与 GitHub Pages 均已成功运行。**

## 完成范围

关系图是默认导航入口。绿色实线对应定理，虚线 ⇏ 对应不成立的逆推。课堂路径是建立关系、光滑正例、尝试逆推、经典反例、自己判断；同一个实验中连接曲面、双侧截面、候选线性平面、偏导序列、误差比例与严格证明。

四个光滑正例、三个用户指定反例、原连续且偏导存在但不可微的桥梁反例，以及三个新的迁移题均已完成。图中有界偏导的附加条件明确保留。原多元极限、Green–Gauss–Stokes 实验和旧比较模式保留。

106 项 Node 检查通过；GitHub Actions 中 29 项原界面、37 项场实验和 27 项关系实验 Chromium 检查通过。浏览器实际使用完整离线构建注入；HTTP 资源另测。精确限制见 [VERIFICATION.md](VERIFICATION.md)。

## 仓库来源与本地历史

来源是本对话交付的 `MA-Playground-v1.1.zip`，不是新建空项目。读取现有模块、样式、数学文档和测试，先运行 76 项基线测试，再恢复包内 Git bundle。

源码基线：上一版远端提交 `efe1f70de7afd01ab37e171a54ffa4adca39a9b8`。v1.2 功能提交为 `af304acd26ccbacf7cd1f3345f9af4369697c9c9`，本轮提交 hash、基线、差异补丁和本地历史 bundle 见交付包 `delivery/manifest.json`。

v1.2 已在真实远端 `main` 上以普通提交接入，保留既有历史，没有执行 force push。

## 远端状态

v1.2 已推送至 [`xby474-dev/MA_playground`](https://github.com/xby474-dev/MA_playground)。交付物不含登录凭据、令牌、环境秘密或字体文件。

既有 Pages 工作流保留，`test:ui` 已接入三套浏览器检查。GitHub Actions 已成功完成 CI 和 Pages 部署；主页为 [`https://xby474-dev.github.io/MA_playground/`](https://xby474-dev.github.io/MA_playground/)，关系实验可通过 `#lab=differentiability&mode=relations` 打开。

后续更新应先获取真实远端状态，再审查并合并增量；保留远端历史，不执行 force push。
