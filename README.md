<div align="center">

# MA Playground
### Multivariable Calculus Visual Lab · 多元微积分可视化实验室

**让数学直觉，经得起证明。**

三个完整实验，把几何直觉、计算、定义与证明接起来。无后端、无登录、无 CDN，可完全离线运行。

[English](README.en.md) · [关系实验指南](docs/RELATIONS-GUIDE.md) · [关系图的完整证明](docs/RELATIONS-MATHEMATICS.md) · [场实验](docs/FIELD-GUIDE.md) · [实际验证](docs/VERIFICATION.md) · [交付状态](docs/STATUS.md)

</div>

![v1.2 实际浏览器界面：偏导、连续、可微、偏导连续的统一关系图](docs/images/relations-map-desktop.png)

## v1.2 · 四个性质，一张图

不是再加一组知识点卡片，而是重构原有第二个实验：

**建立关系 → 用正例走通箭头 → 尝试逆推 → 用反例击破 → 自己判断新函数。**

以 P（偏导存在）、C（连续）、D（可微）、C∂（偏导在原点连续）组成有向图。绿色实线点击进入定理解释；⇏ 虚线点击进入反例实验。节点描述当前函数，箭头描述一般命题，两者不混淆。

教材图中的“邻域内偏导存在且有界 ⇒ 连续”保留为显式条件箭头，不误写成“偏导存在 ⇒ 连续”。

| 函数 | P | C | D | C∂ |
|---|---|---|---|---|
| x²+y²、xy、sin x cos y、x²+xy+y² | ✓ | ✓ | ✓ | ✓ |
| xy/(x²+y²)，原点补 0 | ✓ | × | × | × |
| \|x\|+\|y\| | × | ✓ | × | × |
| x²sin(1/x)，x=0 时补 0 | ✓ | ✓ | ✓ | × |
| xy/√(x²+y²)，原点补 0 | ✓ | ✓ | × | × |

切换同一个函数的曲面、双侧截面、线性平面、偏导函数与尺度误差；先填写四项判断再揭晓。可展开严格推导，不以有限采样假装证明。最后三道新函数任务各含四项性质和一个理由，共 15 个独立评分项。

> P、C、D 均在原点判断。C∂ 要求偏导先在某开邻域存在，再在原点连续，不是只算原点的两个数，也不额外要求整片邻域都属于 C¹。

## 三个实验仍在同一个应用里

### 01 · 所有直线，都不够

研究 F=x²y/(x⁴+y²)，F(0,0)=0。比较直线、竖直线与抛物线的趋近，保留最多四条路径，连接二维路径、三维示意和精确代入式。所有直线极限相同仍不能保证二元极限存在。原有证明、六题中的极限题、分享与 CSV 完整保留。

### 02 · 四个性质，一张图

这是上面的 v1.2 统一关系实验。八个主例子（四个正常光滑函数、三个指定反例、一个旧版桥梁反例），加三个迁移任务。详情见 [操作指南](docs/RELATIONS-GUIDE.md) 与 [完整数学核对](docs/RELATIONS-MATHEMATICS.md)。

原有双函数比较界面在 `#lab=differentiability&mode=classic` 保留，旧数学与内容测试仍在；默认导航不再把它呈现成孤立模块。

### 03 · 局部累积，边界回声

Green 环流 → 平面通量桥梁 → Gauss 体元 → Stokes 曲面 → 统一视角。逐步观察局部量、分块累积、内部公共边界抵消与整体边界。内部和边界积分分别解析计算，支持定向、同边界曲面形变、奇点/孔洞与八道自测。本次未改动其数学或教学模块。

![统一场实验：曲面 Stokes](docs/images/field-stokes-surface.png)

## 立即运行

**不安装环境：** 下载交付包后双击 `dist/relations-lab.html`，直接进入新实验。`dist/standalone.html` 从极限实验开始，`dist/field-lab.html` 从统一场实验开始；三个文件都包含完整应用。无需网络、Node、API Key、字体服务或公式 CDN。

**开发运行：** 在包含本项目源码的目录中，使用 Node.js 22+：

```bash
npm run dev        # 本机开发服务器
npm run verify     # 语法、数学/状态/工程测试、生产构建
npm run preview    # 浏览 dist/ 生产构建
```

没有 npm 运行依赖，也没有构建框架依赖。普通模块入口 `index.html` 应经 HTTP 打开；完全离线使用合并后的 HTML。

## 交互与数学边界

图上的“成立”来自已审核的数学结论，不是采样判定器。普通函数输入/CAS/自动证明不在本项目范围内。

曲面高度独立缩放，不能从视觉角度读导数。有限网格可能漏掉高频振荡；实验用两列解析点严格解释偏导不连续。未定义的偏导是 null，不以 0 冒充；没有偏导生成的 L 时，禁用该平面，并将图表标为“相对高度”。

分享恢复当前参数，不上传或分享学生答题。CSV 明示有限尺度与解析上界类型。局部监听与动画随页面切换清理，键盘可点击关系箭头、转动曲面并控制输入；手机使用单独排布的关系树。

## 测试

```bash
npm test
npm run check
npm run build

# 以下依赖只用于测试，不参与应用运行
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
npm run test:ui
```

浏览器回归包含旧极限/可微界面、统一场实验、新关系实验三套。默认测试真实生产 HTTP 页面与模块加载；受管理策略限制时可显式使用 `--offline-harness`，注入实际构建的单文件 HTML，**不修改浏览器策略**。两种验证范围不能混称。

实际结果与未覆盖范围见 [VERIFICATION.md](docs/VERIFICATION.md)。测试检查实现一致性，不声称证明任意数学命题。

## 工程结构

```text
src/
  app.js                    导航、路由、全局生命周期与分享
  math.js / plots.js        原极限与双函数比较的数学/图形（保留）
  content.js / state.js      原内容与路由兼容层
  relations-math.js         函数目录、真值、偏导、误差、解析证据
  relations-state.js        新实验分享状态、白名单与边界
  relations-plots.js        有向图、移动树、SVG 图表、Canvas 曲面
  relations-content.js      同一学习路径、证明、预测与迁移任务
  relations-lab.js          局部交互、焦点、动画、答题、CSV
  field-*.js                Green–Gauss–Stokes 统一实验（保留）
styles/                     三个实验共用的笔记本视觉体系
scripts/                    依赖为零的构建、单文件合并与本地服务器
tests/                      数学/内容/状态/工程及三套浏览器回归
docs/                       完整数学、指南、架构、验证与部署说明
.github/workflows/          测试成功后部署 GitHub Pages
```

## 部署与仓库状态

`npm run build` 输出纯静态 `dist/`，支持根路径与 `/MA_playground/` 子路径。仓库保留 GitHub Pages 工作流，并让 CI 运行全部三套浏览器测试。管理员需授权仓库并配置 Pages 为 GitHub Actions。

**本轮交付是基于 v1.1 包内历史的本地实现，不代表已更新远端或已公开上线。** 准确提交与补丁见 `delivery/manifest.json`；合并前应先获取真实远端历史，不能强制覆盖。详情见 [部署说明](docs/DEPLOYMENT.md) 和 [交付状态](docs/STATUS.md)。

## 贡献与许可

欢迎报告数学错误、操作卡点、布局或无障碍问题。新增内容要同时提供条件、证明/反例与测试，不增加空白模块。见 [CONTRIBUTING.md](CONTRIBUTING.md)。本版主界面为中文，尚无完整英文 UI 或任意公式输入。

MIT。参考与技术资料见 [REFERENCES.md](docs/REFERENCES.md)。教材图片只用来对齐本次关系组织，未重新分发；函数、推导和交互是本项目独立实现。

> 数学分析我爱你～
>
> 保留原 README 的这句话。我们想做的，是让“会算”更接近“真正理解”。
