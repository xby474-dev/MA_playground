# MA Playground v1.8 · 实际验证记录

> 历史记录：以下数字来自当时独立的 v1.8-source 快照，不是本次与正式仓库合并后的综合验证结果。当前整合版本机 `npm run verify` 为 385 项 Node 测试通过、构建 88 个文件；本机 Python/Chromium 套件因缺少 `python` 命令未启动。推送后的 Actions/Pages 结果将在此记录更新。

## 版本与来源

从本对话交付的 v1.7-source ZIP 解压后新增第九个实验。没有远端拉取、commit、push 或公開部署。所有旧实验源文件保留；共享导航、路由、打包器与必要导航数断言更新为九个。

## 已执行结果

- `npm run check`：62个 JavaScript 文件语法检查通过；运行资源不包含外部脚本或样式。
- `npm test`：386/386通过；其中新增隐函数53项，既有333项完整保留。
- `npm run build`：87个生产文件，九个实验入口和完整离线页均生成。
- 构建重复性：两次生产构建的87个文件逐字节相同。
- 独立HTTP资源检查：根路径与 `/MA_playground/` 子路径分别请求全部87个文件，合计174次，与磁盘哈希一致。
- 新隐函数 Chromium 浏览器套件：36/36通过；`test-results/implicit-browser-report.json` 保存检查名称；检查期间没有未捕获JS异常或外部运行请求。
- 既有浏览器回归：基础29、关系图27、场37、完备性38、Taylor37、级数35、线性映射34，合计237/237。
- 总计273项浏览器检查，其中新模块36项。测试项数不是数学完全正确或所有可访问性均已验证的保证。

## 浏览器验证范围

曾真实尝试本地HTTP浏览器导航，环境返回 `net::ERR_BLOCKED_BY_ADMINISTRATOR`。没有绕过导航限制。后续套件显式使用 `--offline-harness --browser /usr/bin/chromium`，通过 Playwright set_content 执行实际构建的完整离线 HTML。拖动、事件、真实 requestAnimationFrame 动画、暂停、矩阵敏感性、奇异例子、图形、证明、八题、CSV浏览器下载、分享和旧模块导航确实在Chromium中运行。

这不是浏览器HTTP模块加载的端到端验收。HTTP资源正确性另由174次真实请求验证。未声称运行Safari、Firefox、完整屏幕阅读器、真实file://双击流程或公开站点。移动端以390px浏览器视口验证新模块；没有声称在实体手机逐机测试。

旧v1.6恢复源码的原始新增测试缺失没有被掩盖。v1.7继承的10项 uniform math smoke 与浏览器最小回归仍在；不把它们冒称原始一致收敛完整suite。

## 修正过的关键问题

- 平坦约束 `(y−x)^3=0` 中，逆偏导公式0/0不可用，但实际隐函数 g=x 的 Dg=1 存在；界面、动画和测试分别处理。
- 交换依赖变量时，A/B、输入/输出及 dx/dy 公式同步交换。
- 曲面标记 B=F_z；1×2 Dg 不误称DF。
- 一阶修正后的真实约束残差不被线性相消式覆盖；动画阶段2保留蓝色和一阶说明。
- 精确奇异λ=0不使用伪逆制造唯一性；有限兼容性和一阶兼容性分别计算。
- 小但非零依赖偏导、矩阵参数不被误判为0。
- 高阶参考分支越界时显示未定义；h=0的归一化误差不填0。
- 共享链接中的非预设可逆λ值正确显示在参数控件中。

## 数学审查

标准C¹ IFT与基于逆函数定理的存在性证明参考Jiří Lebl, Basic Analysis §8.5；例子、公式维度、显式分支、残差恒等式和全方向余项界在 `IMPLICIT-MATHEMATICS.md` 独立写明。绘图采样不判断定理真假；浮点读数不是区间证书。

## 源码包独立检查

已从生成的 `MA-Playground-v1.8-source.zip` 独立解压到新目录，执行 `npm run verify`：语法检查、386项Node测试和构建全部通过。独立目录生成的87个生产文件与工作目录逐字节相同，包括最终交付的隐函数离线HTML。ZIP自身CRC完整性检查通过。

隐函数离线HTML SHA-256：
`4cc2307839f069c4ec05749bc0f3eddb98f54e6fd4599c3f848807edb030601a`

更新本验证记录后，最终ZIP再次独立解压并执行同样核验；最终命令退出0，全部生产文件仍相同。独立目录未再运行浏览器套件，浏览器结果来自前述真实构建工作目录。

## 可重复运行

```sh
npm run verify
python tests/implicit_browser_test.py --offline-harness --browser /usr/bin/chromium
```

正常允许本地浏览器导航的环境可去掉 `--offline-harness`，由测试启动本地服务器。全套浏览器测试 `npm run test:ui` 默认HTTP模式，需要Python Playwright及浏览器独立安装。

## 记录位置

当前Node和各浏览器日志在 `delivery/v1.8/`，结构化报告在 `test-results/`。旧 `delivery/v1.7`、`delivery/prior-run` 仅作版本历史，不是当前验证证据。
