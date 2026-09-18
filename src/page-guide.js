const GUIDE_CONTENT = {
  limits: {
    title: '先知道要看什么，再开始靠近。',
    question: '只沿几条路径趋近原点，能不能说明多元极限存在？',
    steps: [
      '先观察直线路径，记下函数值怎样变化。',
      '切换到抛物线和竖直线，比较不同的靠近方式。',
      '缩小趋近尺度，查看函数值与收敛曲线，再进入证明。',
    ],
    observe: '看不同路径是否趋向同一个结果，也要分清原点函数值和路径极限。',
    takeaway: '多元极限要求所有允许路径都趋向同一个值。',
    warning: '有限条路径只能提供证据，不能代替对所有趋近方式的证明。',
    guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/MATHEMATICS.md',
    guideLabel: '查看极限定义与证明',
  },
  differentiability: {
    title: '先画出关系，再检查每一条箭头。',
    question: '偏导存在、连续、可微和偏导连续之间，哪些方向可以推出，哪些不能反推？',
    steps: [
      '先选一个函数，预测四个性质是否成立。',
      '点击绿色定理箭头，看它为什么成立。',
      '再换成反例，点击虚线箭头，检查逆推为什么失败。',
    ],
    observe: '节点描述当前函数，箭头描述一般命题；结合曲面、截面和归一化误差判断。',
    takeaway: '偏导存在不自动推出连续或可微；定理方向和反例方向必须分开理解。',
    warning: '误差趋于零还不够，不能把一个方向的好表现当成所有方向的结论。',
    guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/RELATIONS-GUIDE.md',
    guideLabel: '查看关系实验指南',
  },
  fields: {
    title: '先找到内部累积，再听见边界回声。',
    question: 'Green、Gauss、Stokes 为什么能把区域内部的局部变化与边界积分联系起来？',
    steps: [
      '选择一个定理，先观察一个简单向量场和区域。',
      '调整方向、分块或曲面形状，查看局部贡献如何配对。',
      '对照内部局部积分与边界账本，最后进入证明。',
    ],
    observe: '看公共边界如何反向抵消，方向改变时符号如何变化，以及旋度/散度与环流/通量的配对。',
    takeaway: '局部累积经过内部抵消，最终只留下外边界的整体效应。',
    warning: '有限网格是直觉模型；它不能单独替代定理所需的光滑性、定向和区域条件。',
    guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/FIELD-GUIDE.md',
    guideLabel: '查看场实验指南',
  },
  linear: {
    explore: { title: '先把导数当作一台局部线性机器。', question: '多元函数在一点附近，怎样用一个线性映射预测输入变化带来的输出变化？', steps: ['先选映射和工作点，拖动输入位移 h，比较真实输出与线性预测。', '缩小位移并查看归一化余项；再点 Jacobian 的列，观察坐标方向如何组成任意方向。', '切到复合或投影视角，比较两次线性化与沿线段的一维中值结论。'], observe: '看输入箭头、弯曲后的真实输出、平行四边形预测和余项随 ‖h‖ 的变化；读矩阵列时留意输入/输出维数与基底。', takeaway: '可微的核心是存在一个线性映射，使真实增量减去它的一阶预测后，相对 ‖h‖ 的误差趋于零。', warning: '有限尺度上的相似不是极限定义；Jacobian 矩阵是所选坐标中的表示，不等于抽象导数本身；有限方向采样也不是全方向证明。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/LINEAR-GUIDE.md', guideLabel: '查看线性映射实验指南' },
    proof: { title: '把图上的直觉拆成可检查的推导。', question: '局部线性化、链式法则与投影中值定理分别依赖什么条件，如何连成一个证明？', steps: ['选择局部余项、复合映射或投影路线，先读清定义域和值域。', '逐步检查余项阶、矩阵乘法顺序，或一元中值定理实际应用的标量函数。', '回到实验改变方向与尺度，核对图像只是示例而证明覆盖什么范围。'], observe: '看量词、趋零余项、Jacobian 的维数/乘法次序，以及投影方向 a 如何把向量变化变成标量。', takeaway: '这些结论不是视觉规律：它们由 Fréchet 可微定义、复合求导和一元中值定理在明确假设下推出。', warning: '一个候选中值点通常只保证当前选定的投影；不要把某条直线上的结论说成向量等式，也不要把浮点求根当作精确证明。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/LINEAR-MATHEMATICS.md', guideLabel: '查看线性映射数学证明' },
    challenge: { title: '用理由检验你是否读懂了线性化。', question: '换函数、方向、坐标或复合顺序后，哪些预测仍成立，哪些只是在特定条件下成立？', steps: ['先独立回答每道判断，并说出你使用的定义或定理。', '提交后逐题读解释，特别检查矩阵形状、误差阶和投影量词。', '回到探索页构造一个反例或改变参数，确认结论边界。'], observe: '关注误差除以 ‖h‖ 是否趋零、Jacobian 的输入输出空间、AB 与 BA 次序，以及“存在 ξ”对谁成立。', takeaway: '真正掌握导数，是能用线性映射解释一阶变化，并准确说出结论覆盖的方向与条件。', warning: '曲线贴近、单次答案正确或某个 ξ 数值看似合适，都不能替代一般命题的假设与证明。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/LINEAR-GUIDE.md', guideLabel: '查看线性映射实验指南' },
  },
  implicit: {
    explore: { title: '先看约束误差如何被依赖变量补回。', question: '在 F(x,y)=0 上，改变自由变量时，怎样调整依赖变量才能一阶保持约束？', steps: ['先选一个零集和“自由/依赖”变量，再拖动自由变量制造约束误差。', '播放一阶修正，观察 −B⁻¹A 如何抵消线性误差；再对照非线性精确分支。', '切换到曲面或多约束向量案例，比较修正方向与可逆条件。'], observe: '看自由空间、依赖空间和约束空间中各自的位移/误差；比较真实分支、蓝色一阶修正及剩余高阶误差。', takeaway: '当依赖块 B=D_yF 可逆时，保持约束的一阶变化满足 Dg=−B⁻¹A；它给的是局部变化规则，不是位置本身。', warning: '线性修正后仍可能有高阶残差；B 奇异时可能无解或不唯一，不能把伪逆或图上看似平滑当作隐函数定理结论。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/IMPLICIT-GUIDE.md', guideLabel: '查看隐函数实验指南' },
    proof: { title: '从约束恒等式走到隐函数导数。', question: '隐函数定理怎样保证局部函数存在、唯一且可微，导数公式从何而来？', steps: ['先检查 F 的光滑性以及依赖 Jacobian B 在基点可逆。', '沿局部解 g 写出 F(x,g(x))=0，并用链式法则对等式求导。', '核对所得线性方程的尺寸与可逆性，再区分局部定理和具体例子的额外性质。'], observe: '看定理假设、局部邻域、唯一分支和 A/B 的定义域值域；重点检查 B⁻¹ 的存在及矩阵乘法顺序。', takeaway: '存在唯一的局部可微分支来自隐函数定理；公式 Dg=−B⁻¹A 是在其假设下由约束恒等式求导得到。', warning: '单独解出一条曲线不自动证明隐函数定理；某个偏导为零不等于没有隐函数；数值动画也不能证明邻域内存在唯一分支。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/IMPLICIT-MATHEMATICS.md', guideLabel: '查看隐函数数学证明' },
    challenge: { title: '分清存在、唯一、可微和敏感性。', question: '给定一个约束和基点，何时能使用导数公式，何时只能说线性修正失败或解不唯一？', steps: ['先独立判断每道题涉及的定理条件或结论。', '提交后对照解析，区分依赖块奇异、接近奇异与精确可逆。', '返回对应案例，比较误差能否修正、解是否唯一及条件数如何变化。'], observe: '看 det B/秩、误差是否落在像空间、分支是否唯一，以及小但非零参数造成的敏感放大。', takeaway: '可逆性是标准隐函数定理给出该依赖方向局部解与公式的关键条件；近奇异会变敏感，精确奇异则须另行分析。', warning: '某条公式未定义不等于隐函数不存在；没找到定理证书不等于结论为假；数值上“很小”也不等于精确为零。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/IMPLICIT-GUIDE.md', guideLabel: '查看隐函数实验指南' },
  },
  completeness: {
    map: { title: '先看见五条路，最后问同一个终点。', question: '上确界、单调极限、区间套、子列和 Cauchy 条件，为什么可以互相推出？', steps: ['先点击一条节点或箭头，认出它在等价环中的位置。', '从一次二分开始，观察同一个逼近构造怎样换一种语言。', '切换到 ℚ，再进入证明，检查“终点属于谁”。'], observe: '看构造目标、数系 K 与箭头方向；绿色箭头是蕴含，不是把五个命题混成一句话。', takeaway: '完备性的五种表述都在保证：满足条件的逼近不会在数系中缺一个终点。', warning: '一个构造成功不等于整个数系完备；ℚ 稠密也不等于它包含所有极限。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/COMPLETENESS-GUIDE.md', guideLabel: '查看完备性实验指南' },
    explore: { title: '沿同一条二分，换五种读法。', question: '同一组逼近数据，怎样分别读成上确界、序列、区间、子列和 Cauchy 结论？', steps: ['先选一个视角和目标，观察二分如何留下候选终点。', '拖动二分层数 n，比较 ℝ 与 ℚ 中的同一构造。', '打开精确账本，再用“下一视角”继续转换语言。'], observe: '看区间端点、误差尺度和候选终点是否仍属于 K；有限层数只是构造的截面。', takeaway: '五种语言描述的是同一个“逼近并保留终点”的结构。', warning: '有限 n 的小误差不能单独证明无限极限；空心目标也不代表数轴上有一段空白。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/COMPLETENESS-GUIDE.md', guideLabel: '查看完备性实验指南' },
    proof: { title: '把一条箭头走完，才知道等价不是口号。', question: '从一个完备性命题到下一个命题，真正用到了哪些条件？', steps: ['先读“允许使用”，不要提前借用终点。', '逐步点击证明步骤，记录每一步构造了什么。', '切换另一条边，再比较哪些条件发生了变化。'], observe: '看每条箭头的前提、构造对象和最后归还的终点；特别注意阿基米德条件与 K 内极限。', takeaway: '等价关系来自一圈具体的构造与回收，而不是五个定义的相似措辞。', warning: '反向箭头不能因为图上对称就省略；“相邻差趋零”也不等于 Cauchy。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/COMPLETENESS-GUIDE.md', guideLabel: '查看完备性证明指南' },
    challenge: { title: '最后把“有终点”判断权交给你。', question: '改变数系、条件或逼近方式后，原来的结论还成立吗？', steps: ['先独立提交每道判断，不急着看解析。', '对照反馈，定位是条件、对象还是终点出了问题。', '回到实验，用一次构造重新验证你的理由。'], observe: '看题目改变的是数系、序列条件还是结论对象；理由比选项本身更重要。', takeaway: '完备性不是“越来越近”四个字，而是明确条件下终点仍在当前数系。', warning: '不要把图形直觉、有限计算或单个反例的好表现扩大成一般定理。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/COMPLETENESS-GUIDE.md', guideLabel: '查看完备性实验指南' },
  },
  taylor: {
    grow: { title: '先让曲线从一个点一层一层长出来。', question: 'Taylor 多项式怎样把一个点的导数信息变成附近的局部模型？', steps: ['先固定函数和展开点，播放从 T₀ 到 Tₙ 的生长。', '拖动观察点 h，核对函数值、近似值与余项。', '打开系数表，再进入误差实验。'], observe: '看匹配的是函数值、斜率和更高阶导数；曲线重合只是结果，不是拟合散点。', takeaway: '每增加一阶，就多匹配一个局部信息；它给出的是带阶数的局部近似。', warning: '当前点看起来很像，不等于多项式恒等于函数，也不等于任意远处都可靠。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/TAYLOR-GUIDE.md', guideLabel: '查看 Taylor 实验指南' },
    error: { title: '把“像不像”拆成两个可检验的问题。', question: '固定阶数离开展开点，和固定观察点增加阶数，分别会发生什么？', steps: ['先固定 n 移动 h，观察局部模型离开 a 后的误差。', '再固定 x 增加 n，比较各阶近似的变化。', '阅读余项界，区分图上采样与可证明的保证。'], observe: '看两张误差图的横轴不同；底部显示下限不代表误差精确为零。', takeaway: '阶数、距离与函数的收敛性质共同决定近似质量。', warning: '增加阶数不保证每一步都更好；有限采样也不能代替误差估计。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/TAYLOR-GUIDE.md', guideLabel: '查看 Taylor 误差指南' },
    boundary: { title: '边界处，近似、收敛与相等必须分开。', question: '级数在哪些点收敛，以及它是否等于原函数，为什么是两个问题？', steps: ['先选择一个场景，观察展开点、收敛半径和观察点的位置。', '切换端点或越过边界，比较误差与收敛状态。', '再进入证明，检查条件，而不是只看曲线。'], observe: '看半径、端点和函数定义域；“部分和有极限”不自动等于原函数。', takeaway: '局部 Taylor 近似、级数收敛和函数展开相等是逐层加强的结论。', warning: '越过收敛半径、端点表现良好或图线重合，都不能直接推出全域恒等。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/TAYLOR-GUIDE.md', guideLabel: '查看 Taylor 边界指南' },
    proof: { title: '动画给线索，证明负责说明为什么。', question: '系数、余项和收敛半径分别由什么数学理由保证？', steps: ['先选择一条证明路线，查看它的前提。', '逐步阅读构造、估计和结论，记录每一步的对象。', '回到实验，用参数检验证明适用的范围。'], observe: '看证明使用的是导数公式、余项估计还是比值/几何级数；不要把数值读数当作证明。', takeaway: 'Taylor 展开不是一条绘图规则，而是导数信息与余项控制共同给出的定理。', warning: '一个正例不能证明一般命题；当前函数的漂亮曲线也不能替代条件检查。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/TAYLOR-GUIDE.md', guideLabel: '查看 Taylor 证明指南' },
    challenge: { title: '把局部近似的判断迁移到新问题。', question: '面对新的函数、阶数和观察点，你能判断近似保证到哪里吗？', steps: ['先独立选择答案，再说明你依赖的条件。', '查看解析反馈，区分局部、有限阶和无限展开。', '回到生长或边界实验，验证你的判断。'], observe: '重点看展开点、阶数、余项和收敛区间，而不是只看某一个数值。', takeaway: '真正理解 Taylor 展开，是知道它保证什么，也知道它没有保证什么。', warning: '不要把“误差很小”“曲线重合”或“所有导数为零”误读成恒等式。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/TAYLOR-GUIDE.md', guideLabel: '查看 Taylor 完整指南' },
  },
  series: {
    map: { title: '先看地图，再问哪条判别法够用。', question: '比值、根值、比较、积分和交错等条件，哪些能推出收敛，哪些不能反推？', steps: ['先点击一个节点或箭头，区分“条件”“性质”和“结论”。', '切换一个级数案例，观察同一对象经过不同判别路线时哪里成立。', '进入实验或证明页，核对前提、估计和结论，不只看最后读数。'], observe: '看箭头方向、节点前提和当前级数的满足标记；实线是蕴含，虚线需要反例支持。', takeaway: '判别法不是强弱排行榜；先固定版本和前提，再选择一条足够的证明路线。', warning: '某条判别法前提不满足，不等于原级数发散；有限项、有限窗口和图上没画出的箭头也不能替代无穷论证。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/SERIES-GUIDE.md', guideLabel: '查看级数实验指南' },
    workshop: { title: '让同一个级数接受不同证据。', question: '改变通项、符号、参照和显示长度时，哪一种证据真正能决定敛散？', steps: ['先选一个熟悉案例，例如 1/n²、1/n 或交错调和。', '切换“条件透镜”和“两本账”，再调整参照与逐项动画。', '比较方法状态：可用、无法判断，还是前提不适用。'], observe: '重点看比值/根值、比较商、积分矩形、部分和与绝对值部分和；动画只是有限前缀证据。', takeaway: '同一结论可以有多条充分路线，但每条路线都只在明确前提下负责。', warning: '最后一项变小、有限部分和看似稳定或一个比值超过 1，都不能孤立决定原级数。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/SERIES-GUIDE.md', guideLabel: '查看级数实验指南' },
    proof: { title: '沿一条箭头，把前提走到结论。', question: '判别法的每一步估计究竟用到了什么条件？', steps: ['先选择一条关系，读清它的假设与目标。', '逐步查看缓冲常数、比较不等式或部分和构造。', '再用案例检查反向命题为什么需要另一个见证。'], observe: '看量词、尾部条件、正性/单调性、符号和参照的敛散；不要把数值样本当作证明。', takeaway: '真正的判别不是“图像看起来收敛”，而是前提如何控制所有足够晚的尾部。', warning: '定理箭头不能自动反向；分组收敛、比值振荡和临界值都需要额外论证。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/SERIES-MATHEMATICS.md', guideLabel: '查看级数数学证明' },
    challenge: { title: '最后判断：是方法没回答，还是级数真的发散？', question: '面对新参数，你能区分判别法失败、前提不适用和真正的敛散结论吗？', steps: ['先独立选择路线或判断，不急着看反馈。', '查看理由，标出使用的前提与被排除的误读。', '回到地图或实验，用一个反例检验你的方向。'], observe: '重点看“无法判断”“前提未满足”“原级数发散”三种不同标签，以及绝对值账本。', takeaway: '会选择一条足够的路线，并知道它没有保证什么，才是真正理解级数判别。', warning: '交错不自动等于条件收敛，绝对值发散也不自动等于原级数发散，未画箭头更不等于互不蕴含。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/SERIES-GUIDE.md', guideLabel: '查看级数完整指南' },
  },
  uniform: {
    map: { title: '先分清“每个点”与“所有点”。', question: '函数项级数逐点收敛时，什么时候能找到一个同时控制整个定义域的 N？', steps: ['先看 xᴺ 在 [0,1] 上的固定点误差与逃跑点。', '切换定义域、部分和 N 和 ε，比较固定点与全域证书。', '再进入证明页，核对量词顺序和解析上确界。'], observe: '看误差带、探针、上确界是否取到，以及 N 是否依赖 x；有限网格不代表全域。', takeaway: '一致收敛的关键是给定 ε 后先选一个对所有 x 和后续 m 都有效的 N。', warning: '逐点收敛、图线看起来贴近、有限采样最大误差变小，都不能自动推出一致收敛。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/UNIFORM-GUIDE.md', guideLabel: '查看一致收敛实验指南' },
    workshop: { title: '让同一个 N 接受全域检查。', question: '固定一个点的好表现，能不能升级成整个定义域的统一保证？', steps: ['先锁住 x，观察部分和与极限的误差。', '切换“追踪逃跑点”，观察 x_N 如何随 N 改变。', '用统一 N、面积、斜率或 M 预算视图检查条件。'], observe: '重点看固定点/追踪点、所有后续项、整体面积和局部斜率；不同视图回答不同问题。', takeaway: '一致性不是误差更小，而是同一个 N 能在量词顺序中保护所有点。', warning: '一个点的证书不是全域证书；不满足某个充分条件也不等于极限交换一定失败。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/UNIFORM-GUIDE.md', guideLabel: '查看一致收敛实验指南' },
    proof: { title: '沿一条箭头，把量词和条件走完。', question: '一致收敛为什么能推出逐点收敛、连续性或逐项积分，而求导需要额外条件？', steps: ['先选择一条定理或反例路线，读清定义域和前提。', '逐步查看尾部估计、误差分解或反例构造。', '回到实验，用参数案例检查结论适用的范围。'], observe: '看 ε、N、x、m 的量词顺序，以及闭区间、可积性、导数一致和锚点条件。', takeaway: '极限交换不是图像效果，而是由统一误差与明确附加条件共同保证的结论。', warning: '一致收敛本身不控制导数；逐点收敛也不能自动交换积分、保持连续或产生统一 N。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/UNIFORM-MATHEMATICS.md', guideLabel: '查看一致收敛数学证明' },
    challenge: { title: '最后判断：缺条件，还是结论真的失败？', question: '面对一个函数项级数，你能区分逐点、一致、正规收敛以及极限交换的不同要求吗？', steps: ['先独立判断量词和结论，不急着看反馈。', '查看解析理由，标出坏点、上确界或缺失前提。', '回到地图或实验，用一个正例和一个反例复核判断。'], observe: '重点看“没有统一 N”“上确界不取到”“积分面积”“导数斜率”和锚点信息。', takeaway: '真正理解一致收敛，是知道一个条件能保证什么，也知道它没有保证什么。', warning: '没有找到统一证书不等于必然发散；有限图形、连续极限或小面积也不能替代定理条件。', guide: 'https://github.com/xby474-dev/MA_playground/blob/main/docs/UNIFORM-GUIDE.md', guideLabel: '查看一致收敛完整指南' },
  },
};

function resolveGuideContent(type, screen) {
  const content = GUIDE_CONTENT[type];
  if (content && !Array.isArray(content.steps)) return content[screen] ?? content.explore ?? content.map ?? content.grow;
  return content;
}

function defaultTarget(type, tab, mode, screen) {
  if (type === 'completeness') return { map: '[data-cp-action="start"]', explore: '#cp-depth', proof: '[data-cp-proof-step="0"]', challenge: '#cp-quiz' }[screen] ?? '#cp-title';
  if (type === 'taylor') return { grow: '[data-ty-action="play"]', error: '#ty-h', boundary: '[data-ty-scenario="nonmonotone"]', proof: '[data-ty-proof="coefficients"]', challenge: '#ty-quiz' }[screen] ?? '#ty-title';
  if (type === 'series') return { map: '#se-graph', workshop: '#se-main-plot', proof: '[data-se-step="0"]', challenge: '#se-quiz' }[screen] ?? '#se-title';
  if (type === 'uniform') return { map: '#uf-graph', workshop: '#uf-main-plot', proof: '[data-uf-step="0"]', challenge: '#uf-quiz' }[screen] ?? '#uf-title';
  if (type === 'linear') return { explore: '#lm-scale', proof: '[data-lm-proof-step="0"]', challenge: '#lm-quiz' }[screen] ?? '#lm-scale';
  if (type === 'implicit') return { explore: '#ip-progress', proof: '[data-ip-proof="0"]', challenge: '#ip-quiz-form' }[screen] ?? '#ip-progress';
  if (type === 'linear') return { explore: '#lm-scale', proof: '[data-lm-proof-step="0"]', challenge: '#lm-quiz' }[screen] ?? '#lm-scale';
  if (type === 'implicit') return { explore: '#ip-progress', proof: '[data-ip-proof="0"]', challenge: '#ip-quiz-form' }[screen] ?? '#ip-progress';
  if (type === 'relations') return '[data-r-stage="0"]';
  if (tab !== 'explore') return '#tab-explore';
  if (type === 'limits') return '[data-set="path"]';
  if (type === 'differentiability' && mode === 'classic') return '[data-set="model"]';
  return '[data-r-stage="0"]';
}

export function pageGuide(type, { tab = 'explore', mode = '', screen = '', target } = {}) {
  const content = resolveGuideContent(type, screen);
  if (!content) throw new RangeError(`Unknown page guide: ${type}`);
  const guideId = `page-guide-${type}${screen ? `-${screen}` : ''}`;
  const targetSelector = target ?? defaultTarget(type, tab, mode, screen);
  return `<section class="page-guide" data-guide="${type}" data-guide-target='${targetSelector}' aria-labelledby="${guideId}-title">
    <div class="page-guide-heading"><div><span class="overline">START HERE · 本页导览</span><h2 id="${guideId}-title">${content.title}</h2><p class="page-guide-question"><strong>本页要回答的问题</strong>${content.question}</p></div><button class="text-button page-guide-collapse" type="button" data-guide-action="collapse" aria-expanded="true" aria-controls="${guideId}-body">收起导览</button></div>
    <div id="${guideId}-body" class="page-guide-body">
      <div class="page-guide-columns"><div><h3>怎么开始</h3><ol>${content.steps.map(step => `<li>${step}</li>`).join('')}</ol></div><div><h3>重点观察</h3><p>${content.observe}</p><h3>本页结论</h3><p class="page-guide-takeaway">${content.takeaway}</p></div><div><h3>常见误区</h3><p class="page-guide-warning">${content.warning}</p></div></div>
      <div class="page-guide-actions"><button class="button primary" type="button" data-guide-action="start">开始第 1 步 →</button><a class="text-button" href="${content.guide}" target="_blank" rel="noopener noreferrer">${content.guideLabel} ↗</a></div>
    </div>
    <button class="text-button page-guide-expand" type="button" data-guide-action="expand" aria-expanded="false" aria-controls="${guideId}-body" hidden>重新打开本页导览 ↓</button>
  </section>`;
}

function storage() {
  try { return window.sessionStorage; } catch { return null; }
}

export function guideStorageKey({ type, lab, mode = '', tab = 'explore', screen = '' }) {
  return `ma-playground:guide:${type ?? lab}:${mode}:${tab}:${screen}`;
}

export function setGuideOpen(guide, open) {
  const body = guide.querySelector('.page-guide-body');
  const collapse = guide.querySelector('[data-guide-action="collapse"]');
  const expand = guide.querySelector('[data-guide-action="expand"]');
  if (!body || !collapse || !expand) return;
  body.hidden = !open;
  collapse.hidden = !open;
  expand.hidden = open;
  collapse.setAttribute('aria-expanded', String(open));
  expand.setAttribute('aria-expanded', String(open));
  guide.classList.toggle('is-collapsed', !open);
}

export function initializeGuide(root, key) {
  const guide = root.querySelector('.page-guide');
  if (!guide) return;
  let saved;
  try { saved = storage()?.getItem(key); } catch { saved = null; }
  setGuideOpen(guide, saved !== 'collapsed');
}

export function persistGuideState(key, open) {
  try { storage()?.setItem(key, open ? 'open' : 'collapsed'); } catch { /* private browsing can disable sessionStorage */ }
}
