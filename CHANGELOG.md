# Changelog

## 1.3.0 · 2026-09-16

- Added the fourth complete experiment: equivalent forms of real completeness, with a clickable five-node proof cycle and route planner.
- Unified exact rational bisection across supremum, monotone convergence, nested intervals, subsequences and Cauchy tails. Added ℝ/ℚ comparison, √2/√3 counterexamples and the 3/2 normal control.
- Added BigInt fractions, exact upper-bound witnesses, independent distant tail indices, shrinking-interval zoom, six explained transfer questions and full noncircular proofs under explicit Archimedean assumptions.
- Added a complete offline entry, responsive vertical graph and synchronized mobile controls. Preserved all three earlier experiments and classic comparison mode.
- Added 43 mathematical/state/content/plot checks, 2 engineering checks and 38 browser checks. Existing field browser navigation counts were updated from three to four without removing prior assertions.
- Escaped mathematical inequalities consistently after a real DOM truncation was found during browser review; exact text and unknown HTML elements are checked in regression tests.
- Updated source documentation, references, delivery status and actual verification boundaries. Pushed to `main`; GitHub Actions Run #8 passed and the public GitHub Pages site was verified.


## 1.2.0 — 2026-09-16

将第二个实验重构为“偏导、连续、可微、偏导连续”的统一有向关系图。绿色定理箭头和虚线非蕴含分别进入证明与反例；保留教材图中邻域偏导有界的附加条件。连续五阶段从光滑正例推进到逆推、反例和三道迁移判断。

加入四个光滑正例、三个指定经典反例、一个既有桥梁反例，统一曲面/截面/候选平面/偏导/尺度误差和解析证据；新增手机关系树、键盘导航、答题草稿、分享和 CSV。五个独立关系模块保持既有工程结构，旧比较模式兼容，其他两个实验不变。

新增 28 项关系检查与 2 项工程检查，总计 106 项；新关系浏览器 27 项、原实验 29 项、场实验 37 项通过。三套完整离线入口、中文/英文 README、数学和操作指南、实际验证记录更新。浏览器受策略限制，使用真实离线构建注入；HTTP 资源另测，GitHub Actions 与 Pages 已成功发布。

所有三个实验页面新增首次展开的“本页导览”：用核心问题、三步操作、观察重点、结论和常见误区帮助直接进入页面的学习者建立阅读路径；导览可收起、重新打开，并保留完整文档入口。

## 1.1.0 — 2026-09-15

新增单一的“局部累积，边界回声”统一场实验：Green → 平面通量桥梁 → Gauss → Stokes → 统一视角。各站共享场与参数、局部到边界的四阶段及解析账本。新增曲面形变、公共边/面抵消、定向、奇点/内边界反例、严格推导与八题自测。

新增五个运行模块、独立样式、30 项新测试与2项工程检查、新实验浏览器回归、双离线入口、学习指南及数学规格。原有两个实验、44 项基线测试、29 项基线浏览器检查保留。精确执行结果见 docs/VERIFICATION.md。

## 1.0.0 — 基线交付

多元极限的路径反例；偏导与可微性的归一化误差实验。原始验证记录保留为 docs/VERIFICATION-v1.0.md。
