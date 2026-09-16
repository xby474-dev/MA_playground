# 可访问性与使用约定

已实现跳到主内容的链接、ARIA 选项卡与左右/Home/End 键、带标签的原生滑块、可键盘旋转的三维画布、原生模态对话框、可选择复制的 MathML、语义化自测题及实时反馈。

图形颜色不是唯一提示：比较曲线使用实线/虚线、文字图例和相邻的数值。读者可以只使用数值、公式和证明理解结论，无需从像素识别函数性质。

图形切换后隐藏无意义的控件；方向扫描禁用几何缩放，平面图不显示相机重置按钮。动画不会自动开始，只有用户明确点击才运行；页面隐藏或切换内容会停止。尊重 `prefers-reduced-motion`，取消装饰过渡。

## 键盘

- Tab 在链接、按钮、滑块之间移动。
- 学习阶段选项卡：左右键切换；Home / End 跳到首尾。
- 三维画布获得焦点后：方向键旋转，Home 恢复相机。
- 原生滑块：方向键微调，Home / End 到达端点。
- 对话框：Escape 关闭。

## 移动端

在 360、390、768、1024 像素宽度检查了学习阶段切换与页面无水平溢出。窄屏使用上下布局；图形与参数并排观察仍以桌面或横向平板更舒适。长数学式允许在公式区域内部水平滚动，不应撑开整页。

## 验证边界

实际做过 Chromium 截图与交互回归，不等于经过 WCAG 认证。未实际验证完整屏幕阅读器流程、色盲用户任务成功率、iOS Safari 和 Firefox 的全部行为。MathML 的朗读和字形依赖具体系统/浏览器。欢迎报告可访问性问题。

不捆绑系统字体文件。使用用户设备已有的中文、系统界面和数学字体；没有外部字体请求。


## v1.1 新实验

五站导航有 `aria-current="step"`；局部到整体的四阶段与定向切换有 `aria-pressed`。SVG 点击选块之外，提供带标签的数字输入，可不使用鼠标准确选择任意小块。方格/体元参数和 3D 视角都使用原生表单控件。

手机图形重新设置视窗，辅助性小字隐藏，但全部关键数值、法向、面积因子、积分账本保留在相邻 HTML 中。共边界除了颜色，还有相反方向、正负号、编号及等于零的账本。动画按需启动，可暂停；减少动态效果时直接显示终态。

新实验已在 Chromium 的 360、390、768、1024px 下对五站及三学习标签进行无整页横向溢出检查。这不是屏幕阅读器完整审核，也不声称已达到 WCAG 认证。

## v1.2 关系实验

桌面 SVG 箭头/节点使用 role=button、tabindex=0、可读标签，并响应 Enter/Space。绿色/实线与暖色/虚线同时用符号、文字和样式区分，不只靠颜色。节点状态用 ✓/×/? 及“成立/不成立”文本重复表达。

小屏幕使用真实按钮组成纵向树，不依赖难以点击的小号 SVG 文本。切换箭头后焦点移到新标题；回到图可以继续键盘选择。输入有标签；判断题为 fieldset/legend 和原生单选；反馈使用 status。曲面支持方向键与 Home，任何图形的重要结论都有相邻数值/文字替代。

验证覆盖 Chromium 键盘与窄屏流程。尚未完成完整屏幕阅读器审计，也未验证所有 Safari/Firefox 版本；不能据此声称全面 WCAG 合规。


## v1.3 完备性实验

五节点和五箭头均提供可读标签、焦点和 Enter/Space 激活；移动端使用纵向按钮环。属性真假用文字和符号重复表达，不只依赖 ℝ/ℚ 的颜色。图形中的参照点、有限取样和精确读数有相邻文字解释。

手机在主要图旁提供独立 ID 的层数滑块和播放/步进按钮，与桌面控制同步但不破坏键盘焦点。长分数、账本和证明式允许局部滚动或换行，不撑开整页。层数0/32处步进有正确禁用状态；动画由用户显式开始，减少动态时只作离散步进，可暂停、切页停止。

证明页每一步用 aria-live 提供更新；挑战为 fieldset、legend 和原生单选，作答可离开再回来，错误理由和状态有明确反馈。重置清空草稿。分享使用既有手动复制降级。

实际检查 Chromium 的 360/390/768/1024px 布局、键盘图导航、滑块焦点、异常输入及四个实验往返；这仍不等于完整屏幕阅读器审计或 WCAG 认证。

## v1.4 Taylor

No autoplay. Explicit playback follows reduced-motion preference: continuous 1.2s-per-layer growth normally, discrete completed layers under reduced motion. Progress is also a native range; layer cards and both plot handles have keyboard alternatives. Handles use role=slider and bounds; Left/Right adjust, Shift accelerates, Home/End select defined endpoints. Focus is restored after a SVG redraw. Derivative tables and text explain the same mathematics as the plots. The route cleans up animation and listeners; hidden-page events pause playback.

Checks include 360/390/768/1024px layouts, narrow tables, long proofs, actual pointer drag and keyboard interaction. This is not a complete assistive-technology audit or WCAG certification.
