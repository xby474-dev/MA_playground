# 参考资料

检查日期：2026-09-15。数学推导、教学文案和图形均在本项目内独立实现；以下是延伸阅读与使用到的技术接口资料，不表示复制了这些站点的实现。

## 数学

- OpenStax, *Calculus Volume 3*, §4.2, Limits and Continuity: https://openstax.org/books/calculus-volume-3/pages/4-2-limits-and-continuity
- OpenStax, *Calculus Volume 3*, §4.4, Tangent Planes and Linear Approximations: https://openstax.org/books/calculus-volume-3/pages/4-4-tangent-planes-and-linear-approximations

- OpenStax, *Calculus Volume 3*, §6.4, Green’s Theorem: https://openstax.org/books/calculus-volume-3/pages/6-4-greens-theorem
- OpenStax, *Calculus Volume 3*, §6.7, Stokes’ Theorem: https://openstax.org/books/calculus-volume-3/pages/6-7-stokes-theorem
- OpenStax, *Calculus Volume 3*, §6.8, The Divergence Theorem: https://openstax.org/books/calculus-volume-3/pages/6-8-the-divergence-theorem

新实验对矩形、长方体与显式图面的推导、所选多项式场与解析积分均为本项目实现。引用教材用于一般定理条件的核对和进一步阅读；参考链接不参与运行，离线时完整证明仍包含在应用中。

## 技术

- MDN, SVG: https://developer.mozilla.org/en-US/docs/Web/SVG
- MDN, MathML: https://developer.mozilla.org/en-US/docs/Web/MathML
- Node.js, test runner: https://nodejs.org/api/test.html
- Playwright Python, installation: https://playwright.dev/python/docs/intro
- GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Actions, setup-node: https://github.com/actions/setup-node

## v1.2 关系图来源与独立补充（核对：2026-09-16）

用户本轮上传的教材关系图用于确定逻辑骨架，特别是“邻域内偏导有界”的条件。未提供书名页码，不编造引用，也不在开源包重新分发扫描图。新增第四节点、所有函数案例、统一余项估计、序列反例和练习按本轮要求独立实现，并在 RELATIONS-MATHEMATICS.md 中逐项推导。

再次核对 OpenStax §4.4 的可微性、切平面和连续偏导充分条件；页面文字并非逐字转录。桌面关系图的键盘实现参考官方 SVG tabindex / focus 接口：

- https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/tabindex
- https://developer.mozilla.org/en-US/docs/Web/API/SVGElement/focus

这些链接仅用于进一步阅读；断网不影响公式、图形、完整推导或答题。

工作流兼容性核对（2026-09-16）：actions/setup-node 官方仓库与 actions/checkout 官方 releases 确认既有 v7 / v6 主版本可用。本轮保留已有工作流版本，不将文档检查等同于实际执行远端 Actions。

- https://github.com/actions/setup-node
- https://github.com/actions/checkout/releases
