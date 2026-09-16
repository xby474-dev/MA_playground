# 工程决策

## 为什么选择无依赖前端

第一版要讲清两个概念，而不是实现符号代数系统。有限的已审核函数不需要任意公式解析器、后端、账号或数据库。使用原生 ES modules、SVG、Canvas 2D 与 MathML，可以让站点无 CDN 地运行，也保留一个完全离线的单文件交付。

数学内容、图形和状态分别组织，未来换渲染库不需要重写证明。

## 数据流

```
URL / 控件输入
      ↓
state.js：白名单、界限、默认值
      ↓
app.js：当前实验状态
      ↓
math.js：纯函数和已证明的解析表达式
      ↓
SVG / Canvas、数值面板、CSV
```

`content.js` 只包含作者控制的教学内容。URL 参数不作为 HTML 插入；路径、视图、函数名都必须通过枚举白名单，数值必须有限并在支持范围内。

滑块更新时仅更新数值与图形，不销毁输入元素，从而保持焦点。三维画布持有独立相机状态；通过 `AbortController` 和 `ResizeObserver.disconnect()` 释放监听。切换实验、学习阶段或隐藏文档会暂停动画。

自测答案只存在当前页面内存；不写 cookie/localStorage、不上传，不包含在分享链接里。

## 可视化选择

SVG 负责二维路径、对数尺度曲线和误差极坐标图。Canvas 2D 使用 CPU 正交投影、网格深度排序与有限面片，避免 WebGL 驱动成为运行门槛。图形并非符号求值或任意精度计算器。

网格有遮挡近似，独立坐标显示比例有明确说明，极限函数细脊线可能漏采。输入平面的 x/y 保持等比例；函数值图的横轴标为参数或距离的对数刻度。

## 构建

`build.mjs` 只复制白名单中的公开资源，生成 `.nojekyll`，并调用 `standalone.mjs` 将同一组代码与样式封装为 `standalone.html`。

单文件合并器不是通用 JavaScript 打包器。它仅接受当前项目使用的本地命名导入/导出，并检查依赖顺序；遇到不支持的导入就报错。每个模块保留独立 IIFE 作用域，避免变量串扰；产物再次通过 Node 语法检查。

所有路径相对于站点目录；页面路由存在 hash 中，兼容 `/` 和 `/MA_playground/`，不依赖服务器端 history fallback。

## 不在本版范围内

任意函数输入、CAS 自动证明、自动极限判断、账户与协作、完整英文界面、更多未审核章节。先让已有实验经得起学生试用，再扩展。


## v1.1：统一场实验的模块边界

原有两个实验的数学模块、内容、自测保持不变。`app.js` 在 `lab=fields` 时挂载独立控制器；切换实验或学习标签时销毁旧控制器的监听与动画。`state.js` 将新实验的参数解析交给 `field-state.js`。

```text
field-state → field-lab → field-math → 数值 / 配对账本 / CSV
                        ↘ field-plots → SVG
field-content → 学习路径、定义、证明、问题
```

`field-math.js` 用已推导的多项式原函数计算内部区域积分；边界则对每条边和每个面分别积分。`contributions` 只用几何索引找到共边界，不能通过强制复制相反数来生成“验证结果”。曲面网格边可能弯曲；势函数端点差加旋转项的精确积分处理的是实际曲线，不是直线弦。

所有新图形使用 SVG，便于选块、高亮与缩放。体元分解是示意性的爆炸视图，界面明确不是物理切开。图元深度排序和箭头方向为教学观察，不进行 GPU 数值模拟。积分与绘图精度无关。

控制器局部更新 SVG、读数和标签，不重建正在操作的滑块；`AbortController` 负责监听清理，显式动画使用 `requestAnimationFrame`，尊重 reduced-motion。手机重新裁切 SVG 的视窗，而不将整张桌面图机械缩小。

构建生成两个完整单文件入口：`standalone.html` 保留原先起始页；`field-lab.html` 用作者控制的 `data-initial-lab` 指定新实验，仍可切换全部三个实验。没有另写一份演示代码。新数学说明和学习指南也被复制到静态产物。

## v1.2：关系图重构第二个实验

新 UI 使用 `lab=differentiability&mode=relations`。主导航和 `relations-lab.html` 都指向它；只有显式旧路由仍进入经典双函数比较，避免破坏旧参数、纯数学测试和回归断言。没有新建第四个侧栏实验。

`app.js` 统一解析完整导航 href（不再抹掉 mode），挂载并销毁关系实验控制器。新模块为：

```
relations-state  →  relations-lab  →  relations-math
                          ↓                 ↓
                  relations-content / relations-plots
```

数学模块保存作者审核的性质表、偏导、候选导数与解析上界。它不读取 DOM，也不依据网格自动判定性质。内容把一条逻辑箭头与正/反例及完整证明绑定。视图只显示数学结果；图形离散误差不会反向进入真值表。

三种页面（图 / 箭头实验 / 迁移判断）共享同一函数状态与五步学习路径，不是独立知识卡。桌面 SVG 节点和箭头支持键盘，手机改为纵向树。图上“箭头是否为定理”与“当前函数满足什么条件”分别渲染：不满足前提不能用来否定定理。

几何与数值控制器使用 AbortController 清理监听，ResizeObserver 清理画布尺寸监听，切页/隐藏页面停止 RAF。滑块不重建输入。答题草稿只存在模块内存，并在探索与答题之间保留；不写 URL/storage。显式重置清空草稿。

构建合并器新增本地模块依赖顺序检查，产出第三个完整离线入口，并复制两份新数学/操作说明。两套旧浏览器脚本仅调整导航后的兼容路由切换（场实验另检查新图出现），保留全部原有断言；新 UI 有独立回归套件。


## v1.3：一个精确构造，五种完备性视角

增加 `lab=completeness`，不改变前三模块的内部数学/内容。顶层路由将新参数交给 completeness-state，mount/destroy 继续统一控制局部监听、动画和分享。

```text
completeness-state → completeness-lab → completeness-math (BigInt rational)
                           ↓                    ↓
                completeness-content / completeness-plots (SVG)
```

数学层有两类明确的数据：作者审核的通用定义/域内结论，以及可复现的有限精确构造。它不通过采样决定数系是否完备。整数交叉相乘决定二分分支，分数在每次运算后约分；绘图阶段才转换为 Number。局部放大先用有理数计算坐标比例，避免端点在浮点减法中提前消失。

目标/数系/深度由图、实验、证明四步页和挑战共享。图采用一个真实有向环，任何两点间的路线来自图遍历，不用装饰性双向线假装证明。桌面节点/箭头是可操作 SVG，小屏改为真实按钮组成的纵向环。

动态教学公式是普通文本，统一转义 `& < >` 后插入 HTML；并非把原始不等式当 HTML 使用。候选有理数不经过 eval，只解析有限长度的整数、小数和分数。URL 参数白名单、整数范围和输出转义分别防守，非法输入不污染状态。

Cauchy 视角允许 m 与 j 独立落在较远尾部；精确差值不会因屏幕像素重合被清零。页面明确区分“这个充分界尚未达到 epsilon”和“数列不是 Cauchy”。上确界候选见证也由分数运算生成，不用 sqrt 判断。

构建合并器新增五个本地模块，产出第四个完整入口 completeness-lab.html，数学和指南复制到 dist/docs。只增加 test:ui 的第四套命令，既有 CI 工作流自动覆盖它。原 Node 测试全部保留；旧场浏览器套件仅调整两处导航数量预期，并新增全部四个 ID 检查。

## v1.4 Taylor integration

`taylor-math/state/plots/content/lab.js` follow the same five-way separation. The global router handles `lab=taylor`, cleans up the active controller and supplies the common share dialog. Fractional growth is a mathematical state `p` serialized to the hash, distinct from the target order `n`. An explicit loop updates `p`; reduced-motion users receive completed-step updates. Every new listener uses an AbortController and every animation is cleaned up on unmount.

Plots never choose coefficients. Analytical formulas compute data; SVG draws clipped segments and leaves singularities disconnected. During pointer dragging the coordinate window is frozen, while the numerical a or h is updated. The standalone builder inlines these exact modules; it is not a second demo codebase.


## v1.5：级数条件图，而非判别法排行榜

`series-math/state/content/plots/lab.js` 分离解析通项族、白名单路由、条件图与证明、SVG 与控制器。数学状态不读取 N、probe 或任何采样数组；有限图无法反向决定无穷敛散。固定参照与方法版本都是状态/内容的一部分，不能在比较两条条件时悄悄更换量词。

图区分一般箭头与当前节点条件；实线箭头使用图结构，反推卡有明确见证，真正不可比有两方向的见证。路径几何也有浏览器检查，避免一条曲线穿过无关节点，视觉上暗示错误的推导。

根值用上极限版本，比值用普通极限版。标准极限比较与单向扩展分开，不用已知最终分类冒充某个方法的实际证据。未定义比值不补零；部分和用补偿求和，仍不是区间算术。

源码、模块构建与完整单文件使用同一套模块。全局旧问答监听改为只接收其拥有的两个经典实验事件，而不是对新模块逐个加黑名单；各独立控制器自行管理表单与答案。新控制器用 AbortController/RAF 清理监听和动画，切页、隐藏、重置皆可停止。
