# v1.1 交付状态

日期：2026-09-16。

**v1.1 已推送到真实 GitHub 远端，GitHub Actions 与 GitHub Pages 均已成功运行。**

## 当前成果

保留两个原有实验，新增 Green → 平面通量桥梁 → Gauss → Stokes → 统一视角的单一实验。包含局部/分块/抵消/整体四阶段、独立解析积分、共边/面账本、参数化与定向、固定边界曲面形变、奇点与内边界对照、证明拆解、八题自测、分享、CSV、手机适配及无外部运行依赖的完整离线入口。

76 项 Node 测试、原有 29 项与新增 37 项 Chromium 检查通过。GitHub Actions 已再次执行 CI 与 Pages 部署并成功；本地环境无法启动 Python 浏览器命令，但远端 CI 完成了完整浏览器检查。详见 [VERIFICATION.md](VERIFICATION.md)。

## 仓库来源与历史

本轮基于用户提供的 `MA-Playground-v1.0.zip`。先读取源代码、界面、数学说明和测试，再恢复包内本地 Git bundle；确认源码对应基线提交 `338c32f49f790ed91c6ba7886538b0e13dccfcec` 后在其上开发。

该基线属于上一轮的隔离环境历史，**不是本轮从真实远端 main 克隆得到的历史**。本轮先保留真实远端已有历史，再以普通合并提交接入 v1.1；没有执行 force push。当前远端功能提交为 `cdec80dfe20e9788b0681501a61e711ec3f5cc59`。

## 远端与权限

v1.1 已推送至 [`xby474-dev/MA_playground`](https://github.com/xby474-dev/MA_playground)。

GitHub Pages 已选择 `GitHub Actions` 作为 Source。部署成功链接为 [`https://xby474-dev.github.io/MA_playground/`](https://xby474-dev.github.io/MA_playground/)，统一场实验离线入口为 [`https://xby474-dev.github.io/MA_playground/field-lab.html`](https://xby474-dev.github.io/MA_playground/field-lab.html)。

## 后续维护约束

后续更新应先获取真实远端状态，再审查并应用增量；保留远端历史，不执行 force push。源码、测试和 GitHub Actions 通过后，再以真实工作流和站点结果更新本状态文件。
