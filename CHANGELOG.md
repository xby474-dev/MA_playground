# v1.8.0 · 隐函数：保持约束，读出变化

- 新增第九个实验：将隐函数导数解释为自由变量变化后，为保持约束而进行的一阶补偿；覆盖平面曲线、曲面与多约束向量系统。
- 新增参数分享、CSV、动画/暂停、图形拖动、证明与解释型自测；区分线性修正与精确分支，分析依赖块可逆、近奇异和精确奇异情况。
- 探索、证明、自测三个页面都加入统一的默认展开「本页导览」，并链接隐函数指南与数学推导。
- 保留 v1.7 线性映射实验及全部已有模块；生产包新增 `implicit-lab.html` 离线入口。
- 本地 `npm run verify`：64 个 JavaScript 文件检查、385 项 Node 测试通过，构建 88 个文件；GitHub Actions Run #26 的浏览器套件与 Pages 部署全部通过。

# v1.7.0 · 导数，是局部线性机器

- 新增第八个实验：局部线性化、Jacobian 列与换基、链式法则和投影中值定理。
- 新增余项和方向实验、完整推导、解释型自测、分享、CSV 与 `linear-lab.html` 离线入口。
- 探索、证明、自测三个页面都加入统一的默认展开「本页导览」，清楚标出问题、三步操作、观察点、结论、误区和完整指南。

# v1.6.0 · 2026-09-16

- 新增第七个实验“每个点，还是所有点”：用固定点/逃跑点、解析上确界、统一 N、面积、斜率和 M 预算直观区分逐点、一致、正规收敛及极限交换。
- 新增四个一致收敛页面、四套页面导览内容、`UNIFORM-GUIDE.md`、`UNIFORM-MATHEMATICS.md`、分享/CSV/证明/自测与离线入口。
- 保留 v1.5 六个实验及已有导览；统一导航更新为七项。
- 本地 `npm run verify` 通过：275 项 Node 检查；GitHub Actions Run #23 通过 214 项 Chromium 检查并完成 Pages 部署。

# v1.5 · 2026-09-16

- Add an integrated convergence-test condition graph: nine nodes, eight theorem routes, eight converse/incomparability investigations, sixty-four proof steps, eight reasoning checks.
- Add eight analytic series families with sign, parameter and fixed-reference switching; analytic verdicts are independent of finite N.
- Distinguish ordinary ratios, root limsup, two-way vs one-way limit comparison, absolute vs conditional convergence, and method inconclusiveness vs failure of prerequisites.
- Add ratio/root and quotient views, monotone integral rectangles, finite-prefix growth, signed/absolute ledgers, accessible graph controls, share state and CSV.
- Preserve previous five experiments and all their tests; only six-lab navigation expectations are updated.
- Add a sixth complete offline entry and dependency-free static deployment support.
- 267 Node checks and 206 Chromium checks passed; GitHub Actions Run #18 passed and GitHub Pages was deployed and verified.

# v1.4.0 — 2026-09-16

- 新增第五个统一实验 Taylor：逐层生长、解析导数、直接拖点、分数暂停与低阶匹配。
- 六个函数；固定距离/阶数误差图、解析充分界、半径与端点、非解析反例。
- 四条完整证明、八题、CSV与分享，原四模块保留。
- 267项Node和203项Chromium检查通过；HTTP浏览器导航受策略阻止，离线注入与HTTP资源分别验证。
- 已推送到 `main`；GitHub Actions Run #13 通过，GitHub Pages 已公开更新并验证。

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
