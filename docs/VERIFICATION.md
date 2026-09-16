# v1.4 实际验证记录

验证日期：2026-09-16。对象：在 v1.3 上新增 Taylor 统一实验，同时回归原有四个实验、页面导览和旧双函数比较。本记录不是一般数学定理的机器证明。

## 已执行结果

| 检查 | 结果 | 范围 |
|---|---:|---|
| JavaScript 语法与运行依赖检查 | 38 个文件通过 | 源码、脚本和 JS 测试；没有远程运行脚本或样式 |
| Node 数学/状态/内容/图形/工程 | **203 / 203** | 原151项，新增46项Taylor、2项静态工程和4项页面导览检查 |
| 生产构建 | **通过** | 模块站、五份完整离线HTML、数学说明 |
| 原极限与经典比较 Chromium 回归 | **29 / 29** | 原有流程、证明、自测、分享和CSV |
| Green–Gauss–Stokes Chromium 回归 | **37 / 37** | 原五视角与全部交互 |
| 偏导关系图 Chromium 回归 | **27 / 27** | 图、正/反例、证明、迁移判断 |
| 完备性 Chromium 回归 | **38 / 38** | 证明环、有理数、数系对照、各视角 |
| Taylor Chromium 检查 | **37 / 37** | 真实连续动画、拖点、导数、六函数、误差、反例、证明、手机 |
| 生产HTTP资源 | **通过，计入203项** | 真实Node服务的根路径、/MA_playground/、模块、样式、文档、MIME |
| 可重复构建 | **通过，计入203项** | 连续两次完整构建所有产物SHA-256一致 |
| 已运行浏览器流程中的未捕获异常 / 外部运行时请求 | **0 / 0** | 五套成功完成的脚本范围 |
| 远端 Actions、公开站点、公开部署 | **通过** | Run #13 成功；Pages 页面已打开并验证 Taylor 实验、五实验导航和本页导览 |

五套浏览器脚本合计 **168 项**操作/断言组合，不等于168个浏览器，也不等于穷尽所有用户情境。

对应报告：[Taylor](taylor-browser-report.json)、[原实验](browser-report.json)、[场实验](field-browser-report.json)、[偏导](relations-browser-report.json)、[完备性](completeness-browser-report.json)。历史记录在 `VERIFICATION-v1.0.md` 至 `VERIFICATION-v1.3.md`。实际截图在 `docs/images/taylor-*.png` 与交付包的 `test-results/`。`docs/images/taylor-growth.gif` 从实际浏览器运行的动画录制，不是设计稿。

## 环境与实际执行命令

Linux；Node.js 22.16.0；npm 10.9.2；Python 3.13；Playwright 1.57.0；Chromium（精确版本见各 JSON 报告）。

```bash
npm run verify
python -m py_compile tests/*browser_test.py
python tests/browser_test.py --offline-harness --browser /usr/bin/chromium
python tests/field_browser_test.py --offline-harness --browser /usr/bin/chromium
python tests/relations_browser_test.py --offline-harness --browser /usr/bin/chromium
python tests/completeness_browser_test.py --offline-harness --browser /usr/bin/chromium
python tests/taylor_browser_test.py --offline-harness --browser /usr/bin/chromium
```

Taylor 桌面1512×1100，响应式检查360/390/768/1024px。通常动态效果下实际运行 requestAnimationFrame、在分数阶暂停、继续并自动完成；另外测试减少动态偏好下的整阶播放。直接鼠标拖动使用真实pointer事件，SVG两个手柄也执行键盘检查。手动查看桌面生长/误差/反例，以及手机长页、证明和控制器。

## 浏览器验证边界

本轮重新尝试生产模块版 HTTP 导航，实际返回：

```text
Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR
http://127.0.0.1:4187/MA_playground/#lab=taylor
```

没有修改或绕过管理策略。离线 harness 将**实际构建的完整HTML**注入空白页，由真实 Chromium 执行同一份 DOM、SVG、MathML 和事件代码。不是单独实现的测试替身。HTTP模块资源另由Node服务器真实请求检查。

因此未完成“浏览器HTTP导航→模块下载→执行”的全链路，也未验证操作系统`file://`访问策略或公开站点。正常脚本仍默认HTTP，以便授权开发环境/CI运行。未声称Safari、Firefox、iOS、完整屏幕阅读器或WCAG认证。剪贴板检查包括手动复制回退，不声称权限已获批；CSV检查实际Blob内容，不替代操作系统文件保存权限验收。

## 新增数学与工程覆盖

46项Taylor测试包括：函数域与非法展开点；阶乘；五个解析函数的移动中心系数；flat例子零导数；独立有限多项式表达式；Horner与直接求和；整数与分数生长；低阶导数保持与高阶修正；碰巧为零与构造保证；几何曲率公式；原点恒等、缺失点与浮点相消；几何精确余项跨越半径仍成立；Lagrange导数全区间界与跨奇点禁用；两侧误差界；二进局部半径；移动收敛半径与端点；flat级数的收敛和相等分开；升阶反而变差；CSV、URL往返与攻击输入；极端参数SVG非有限坐标检查；绘图定标不随阶数改变；键盘手柄；完整内容、四条证明、八道题及HTML不等式转义。

两项工程测试检查新模块、样式、离线数学文档和直接入口，在根路径与仓库子路径可获取，完整HTML仍保留全部五个实验且不含外部运行依赖。

数学推导完整写在 [TAYLOR-MATHEMATICS.md](TAYLOR-MATHEMATICS.md)。数值测试检验实现，不代表形式化验证。符号界是解析充分条件；其浮点显示不是严格区间算术。有限13个阶数点不能替代无穷收敛证明。

## 本轮发现并修复

1. URL 的非法 h 回退到0.8，但窗口被合法缩到0.25时，h可能越界。现在回退值也被依赖范围裁剪，保留对应回归测试。
2. 情境预设的说明label曾混入数学状态，导致分享往返不一致。仅复制数学/页面参数，label保留在产品元数据中。
3. 从0阶开始而不是先显示完整四阶；播放按钮区分首次生长、暂停续播、完成后重播。中途曲线不标完整阶数，余项界相应禁用。
4. 保留旧测试，仅更新新增导航引起的数量与ID断言。没有删掉旧测试以换取通过。

本地提交、补丁应用树一致性、bundle完整性及独立解压重建结果，在交付包 `delivery/manifest.json` 和对应日志中另行记录。
