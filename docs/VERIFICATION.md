# 当前版本的验证记录

当前为 v1.5：[级数判别实验的完整验证记录](VERIFICATION-v1.5.md)。

历史记录：[v1.4](VERIFICATION-v1.4.md)、[v1.3](VERIFICATION-v1.3.md)、[v1.2](VERIFICATION-v1.2.md)、[v1.1](VERIFICATION-v1.1.md)、[v1.0](VERIFICATION-v1.0.md)。

## 当前结果

| 检查 | 结果 |
|---|---:|
| Node 数学、状态、内容、图形与工程 | **267 / 267** |
| Chromium：原实验、场实验、偏导、完备性、Taylor、级数 | **203 / 203** |
| 生产构建、根路径与 `/MA_playground/` 资源 | **通过** |
| 重复构建 | **字节一致** |

浏览器 URL 导航受当前管理策略阻止，因此使用真实构建的完整离线 HTML 注入执行；HTTP 资源另由真实 Node 服务检查。这不等同于浏览器 HTTP 模块加载全链路，也不代表 Safari、Firefox、屏幕阅读器或公开站点验收。数值测试核对实现，不是形式化数学证明。

实际明细、截图、环境与本轮修复见 [VERIFICATION-v1.5.md](VERIFICATION-v1.5.md)。远端 Actions 和 Pages 状态将在本轮推送验证后更新。
