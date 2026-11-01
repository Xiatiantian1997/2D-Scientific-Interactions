# 接入与换肤

这是范例接入层，不是通用科学求解器。把可信的本地片段打包为独立HTML；每个模型在独立iframe中运行，旧作品的固定ID不会互相冲突。使用者提供的HTML须先审查，不把它当任意不可信插件执行器。

## 使用

```sh
python3 scripts/build_lesson.py fragments/sampling-distribution.html fragments/quantum-linked.html -o lesson.html --title "统计与量子示例"
```

可重复传入同一个文件；不需要npm或服务端。生成文件可在普通浏览器打开。使用iframes/srcdoc的目标宿主必须允许脚本；Notion原生正文不会执行HTML，需要支持的外部网页嵌入位置。这次未公开部署网页。

## 主题

内置暖纸、素纸、深色。顶部主题选择向每个iframe发送同一套语义令牌，不重新载入文档；模型状态应保留。需要采用其他人的UI，可修改打包器THEMES映射和runtime/host.css。主图色使用viz-series-*，含义仍由作品约定负责。

只接受内置/作者配置的十六进制令牌值，消息必须来自父窗口；父窗口仅接受自己创建的iframe高度消息。iframe仅允许脚本、不授予同源权限。主题令牌全部嵌入，打包页自身无外部网络依赖；片段原有的外部库依赖仍须单独审查。

旧3D若缓存颜色或写死材质色，不能只发CSS令牌就声称完整换肤，需要适配重绘。旧例图内12px不可直接全局放大：必须重新安排坐标与留白。当前打包器保证宿主基础控件样式，不负责把任意旧图自动改版。

## 状态与生命周期

新采样/势阱例各自暴露root.sciApi.getState()/setValue()/reset()，用于同一文档内作者适配，不是跨iframe自动连接协议。删除实例前调用root.sciDestroy()；销毁隔离iframe会由浏览器回收该文档资源。

多模型同页默认独立。若模型确有物理联系，作者按platform-policy.md声明接口并实现同一控制器/适配器，再检查约束与时间推进；不把相同名称的变量自动绑定。

## 验证

- `python3 tests/test_packaging.py`：三主题、重复实例隔离、转义、消息来源检查，已执行。
- `node tests/check-additions.cjs`：两个新例的实际脚本在模拟DOM执行，已执行。
- SVG实际渲染：已执行；环境中文字体不全。
- 真实浏览器主题切换、iframe高度、Android触屏、Notion宿主：待验证。

“接入层已经实现”与“在用户设备通过”分别记录；缺设备验收不阻止审查源码，但不得宣称生产级全兼容。
