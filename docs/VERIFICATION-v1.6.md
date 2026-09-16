# MA Playground v1.6 · 一致收敛实验验证记录

## 范围

v1.6 在 v1.5 六个实验的基础上加入第七个实验“每个点，还是所有点”，并将同一套「本页导览」卡片扩展到四个新页面：条件地图、同一个 N 挑战、为什么能交换、自己判断。v1.5 的页面导览与浏览器回归保持不变。

## 本地结果

- `npm run verify`：通过。
- Node 检查：**275 / 275**。
- 生产构建：通过，生成 70 个静态文件；入口包含 `dist/uniform-lab.html`。
- 构建内容包含一致收敛数学、操作指南、本地样式和完整离线合并文件。

## v1.6 数学与状态检查

覆盖固定点/逃跑点、`xᴺ` 的定义域差异、几何级数、交错但不正规、移动尖峰、细小波纹、常数漂移、解析上确界、统一 N 证书、面积/斜率/M 预算、CSV 说明，以及四个阶段的导览文案和完整指南链接。

## 浏览器结果

GitHub Actions 已安装 Chromium 并执行七套真实生产构建浏览器检查。v1.6 新增 `tests/uniform_browser_test.py`；它检查七项导航、默认展开导览、固定点/逃跑点切换、统一证书、反例、四步证明、八道解释型自测和分享状态。

远端 Actions Run #23 已通过：**214 项 Chromium 检查全部通过**，其中原有六套为 206 项，一致收敛实验新增 8 项。数学/构建 job 用时 2m36s，Pages 部署 job 用时 15s；生产站点已由同一运行发布。

## 已知边界

浏览器检查默认使用生产 HTTP 模块版；若受管理策略阻止 URL 导航，显式 `--offline-harness` 会注入真实构建的完整离线 HTML。它不修改浏览器策略，也不使用模拟数学或测试专用页面。仍不声称 Safari、Firefox、操作系统文件策略或完整屏幕阅读器验收；有限采样也不等于无穷过程的数学证明。

## 发布记录

- 仓库：[xby474-dev/MA_playground](https://github.com/xby474-dev/MA_playground)
- Pages：[xby474-dev.github.io/MA_playground](https://xby474-dev.github.io/MA_playground/)
- v1.6 Actions 运行：[Run #23](https://github.com/xby474-dev/MA_playground/actions/runs/35092188305) 已通过，GitHub Pages 已部署并验证。
