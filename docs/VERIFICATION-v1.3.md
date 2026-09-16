# v1.3 实际验证记录

验证日期：2026-09-16。范围为新增完备性统一实验及前三个实验的回归。**本记录不是公开部署证明，也不是一般数学定理的机器证明。**

## 实际结果

| 检查 | 结果 | 范围 |
|---|---:|---|
| JavaScript 语法与外部运行依赖检查 | **32 个文件通过** | 源码、构建脚本、JS 测试 |
| Node 数学/状态/内容/绘图/工程 | **154 / 154** | 原106项全部保留，新增43项完备性、2项工程及3项页面导览检查 |
| 生产构建 | **通过** | 静态模块站、四份完整离线HTML及数学说明 |
| 原极限与经典比较浏览器回归 | **29 / 29** | 原数学交互、证明、自测、分享、CSV、手机布局 |
| 统一场实验浏览器回归 | **37 / 37** | Green、平面通量、Gauss、Stokes、统一视角 |
| 偏导关系图浏览器回归 | **27 / 27** | 原图、正/反例、证明、迁移判断和响应式 |
| 新完备性浏览器回归 | **38 / 38** | 图、五视角、证明环、数系/目标、精确值、分享、CSV、挑战和手机 |
| 生产 HTTP 资源 | **通过，计入154项** | 真实 Node 服务的根路径、/MA_playground/、模块、CSS、文档和MIME |
| 可重复构建 | **通过，计入154项** | 两次构建全部产物 SHA-256 相同 |
| 已执行浏览器流程中的未捕获异常/外部运行时请求 | **0 / 0** | 四套最终成功运行的脚本范围内 |
| 公开站点与远端 Actions | **通过** | Run #8 成功；Pages 页面已打开并显示 v1.3 第四实验 |

四套浏览器脚本记录 **131 项**操作/断言组合；不等于测试了131种浏览器或覆盖全部用户场景。

逐项记录：[原实验](browser-report.json)、[场实验](field-browser-report.json)、[偏导关系](relations-browser-report.json)、[完备性](completeness-browser-report.json)。历史记录：[v1.0](VERIFICATION-v1.0.md)、[v1.1](VERIFICATION-v1.1.md)、[v1.2](VERIFICATION-v1.2.md)。新实际截图在 `docs/images/completeness-*.png`；完整截图在交付包 `test-results/`。

## 环境与实际执行

Linux；Node.js 22.16.0；npm 10.9.2；Python 3.13.5；Playwright 1.57.0；Chromium 144.0.7559.96；Git 2.47.3。

```bash
npm run verify
python -m py_compile tests/*browser_test.py
python tests/browser_test.py --offline-harness --browser /usr/bin/chromium
python tests/field_browser_test.py --offline-harness --browser /usr/bin/chromium
python tests/relations_browser_test.py --offline-harness --browser /usr/bin/chromium
python tests/completeness_browser_test.py --offline-harness --browser /usr/bin/chromium
```

桌面1512×1100，新实验检查360、390、768、1024px。人工查看实际桌面等价图、区间套数系对照、证明页，以及移动图/长证明布局。移动端不是压缩桌面图：使用纵向有向环，并在图旁放同步层数控件。截图等待瞬时提示自然消失，没有为截图隐藏真实UI元素。

## 浏览器验证边界（不能省略）

本轮实际尝试浏览器 HTTP 导航，受到管理策略阻止：

```text
Page.goto: net::ERR_BLOCKED_BY_ADMINISTRATOR
http://127.0.0.1:4173/MA_playground/#lab=completeness
```

没有修改或绕过浏览器策略。测试显式使用 offline-harness，把**实际生成的完整HTML**注入空白页，由真实 Chromium 执行 DOM/SVG/Canvas/MathML 和事件。没有另写一份假UI。模块资源与路径/MIME 则由 Node 启动真实服务器，独立发起 HTTP 请求验证。

所以已验证的是实际单文件应用的浏览器交互；**尚未完成浏览器 HTTP 导航→ES modules加载的全链路**，也未验收操作系统 `file://` 访问策略或公开站点。浏览器测试默认仍用正常 HTTP 模式，便于允许导航的开发或 CI 环境继续验证。

## 精确数学与内容检查

新43项涵盖：分数归一化与负号；非法分母、超长输入、HTML/指数输入拒绝；精确加减乘除和整数平方比较；三个目标的初始区间；128层精确宽度/平方夹逼；嵌套性与正宽度；平方残差界；3/2 命中后非零宽度约定；所有类型上界候选的精确见证；任意远尾项和浮点不可分辨时的精确距离；严格epsilon充分界；偶奇子列原始下标；五边图强连通；普遍命题与单例结果的区别；定义与证明前提；数学不等式转义；六题反馈；状态往返和攻击输入；CSV；边界尺寸SVG与有限/无限声明。

新增2项工程检查包括第四模块的生产资源与第四份完整离线入口。原数学与教学模块没有改动。浏览器对应检查了同一参数在图/实验/证明间保留、数系切换、上界见证输入恢复、32层放大、所有有限区间仍非空、子列与全列、N=e尚未获得充分证书而非否定Cauchy、独立远项、所有证明、CSV/手动分享、显式动画/路由清理、答题往返和reset。

理论根据为 [COMPLETENESS-MATHEMATICS.md](COMPLETENESS-MATHEMATICS.md) 中独立编排的推导。范围明确是阿基米德有序域；长度趋零版本保证唯一交点；ℚ 的相对闭区间不能换成 ℝ 中的闭区间。绘图用实数坐标参照，不将数轴上的可视空白解释为有理数的密度。数字检查不是形式化证明器。

## 实际发现与修复

1. 初版部分 `<d`、`<x` 等数学片段被浏览器解析为未知HTML标签，造成读数或解释缺失。统一文本转义，并在Node和浏览器检查文字完整与未知元素，五条证明逐页验证。
2. 桌面图下方箭头标签与节点接近，重新分配标签/视窗空间；手机采用真实按钮环。候选检查按钮禁止中途换行；手机图旁增加同步滑块，保留焦点。
3. Cauchy 充分界未满足时改成清晰分句，避免不等式链误读；不展示在该视角无效的参照点开关。
4. 旧场回归原先硬编码“三个导航”，新增实验后两处断言自然失效。改为四个并核对全部ID；旧数学/交互检查没有删除。修正编辑引入的Python缩进后全部重跑通过。
5. 一次四套浏览器并行重跑超过工具200秒上限，导致最后一套被中断并出现测试驱动EPIPE；这不是应用页面异常。保留其他三套成功结果，将新套件单独完整重跑至38/38。最终记录只对应完成运行，不把中断当成通过。

## 未覆盖或不承诺

已运行 GitHub Actions 的四套 Chromium 回归并打开公开 Pages；仍未运行 Safari/Firefox/iOS、完整屏幕阅读器或教学效果研究，不声称WCAG认证。CSV检查Blob内容，不能替代操作系统保存权限验收；分享检查状态与手动复制，不声称已取得剪贴板授权。仅有审核过的三个目标和六题，没有任意集合输入、通用CAS或自动定理证明。

本地commit、补丁应用树一致性、bundle与独立解压验证，由交付包 `delivery/manifest.json` 和日志记录。v1.3 已推送到远端，Run #8 与公开 Pages 核验结果以本记录和 `docs/STATUS.md` 为准。
