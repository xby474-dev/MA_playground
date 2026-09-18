# v1.8 交付状态

2026-09-19。

**当前正式版本将包含九个完整实验。** 本次同时并入 v1.7「导数，是局部线性机器」和 v1.8「保持约束，读出变化」，原有七个实验继续保留。

## 新增实验

- **v1.7 导数，是局部线性机器**：局部线性化、Jacobian 列与换基、链式法则、投影中值定理；提供交互实验、证明、解释型自测、分享、CSV 和离线入口。
- **v1.8 保持约束，读出变化**：从自由变量制造约束误差，经一阶修正回到约束面；覆盖曲线、曲面、多约束向量系统、隐函数定理条件与奇异/近奇异对照。
- 两个新实验的探索、证明、自测页均加入默认展开的「本页导览」卡片：本页问题、三步操作、重点观察、结论、常见误区及 `docs` 完整指南链接。开始实验后可收起；页面阶段分别记忆展开状态。

## 验证结果

- `npm run verify`：64 个 JavaScript 文件语法检查通过；**385 / 385 Node 测试通过**；生产构建成功，生成 88 个文件。
- 构建包含 `linear-lab.html` 和 `implicit-lab.html` 单文件离线入口；应用无运行时 CDN、API 或外部依赖。
- GitHub Actions [Run #26](https://github.com/xby474-dev/MA_playground/actions/runs/35376391971) 已通过 `npm run verify`、全部 Chromium 浏览器套件及 Pages 部署。当前 Windows 本机缺少 Playwright，所以浏览器验证由 GitHub runner 执行，而非本机执行。
- 已检查公开首页含 `v1.8`、`nav-linear`、`nav-implicit` 和新样式入口；两个离线 HTML、源码、样式、指南与数学文档共 10 个 URL 均返回 HTTP 200。

## 发布状态

v1.7/v1.8 已推送到正式仓库 `main`，保留原有 Git 历史，没有 force push。功能提交为 `7bbc715`，浏览器测试时序修复为 `153e88a`。GitHub Pages 已部署，线上地址：[xby474-dev.github.io/MA_playground](https://xby474-dev.github.io/MA_playground/)。

独立版本源码包留下的历史测试数字仍保存在 [v1.7](VERIFICATION-v1.7.md) 与 [v1.8](VERIFICATION-v1.8.md)；正式仓库本次整合验收见 [v1.8 综合验证记录](VERIFICATION-v1.8.md#正式仓库综合发布验收)。
