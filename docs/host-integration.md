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
- Chromium主题保留状态、同页重复旧例隔离、三宽度布局已通过；Android触屏、Notion宿主仍待验证。

“接入层已经实现”与“在用户设备通过”分别记录；缺设备验收不阻止审查源码，但不得宣称生产级全兼容。


## 2D 旧例迁移（2026-11-01）

11份旧例统一使用 `runtime/touch-controls.js`，需在片段脚本前加载；`build_lesson.py`自动注入。下方`data-reset-area`提供全区空白复位，具体reset/pause/cancelGesture由每个模型显式实现，不能推断公式符号并自动改参数。播放图标不依赖外部库。`root.sciApi`暴露reset/pause/getState供宿主和测试使用；新两例保留原接口。不是统一通用物理求解API。

旧例仍有固定ID，请使用隔离iframe打包器，不要裸拼接。iframe删除会销毁其文档、计时器与监听；不要声称旧例已支持任意SPA原位卸载。`sciDisposeControls`只清理共享控制器，不能替代整个旧例的销毁。

`python3 scripts/build_catalog.py`从片段重新生成13份独立运行页及同页检查页，避免源码修了、分发副本没变。主题切换通过令牌消息完成，不重建实例、不改变模型数据。


## 整体UI覆盖与折叠入口

折叠入口默认为原生details/summary，外观为箭头与文字组成的紧凑按钮；宽度由内容决定，高度至少44px。展开后入口不横向伸长，内容另起一行。只点按钮才展开；其右侧空白属于既有操作区复位范围。

打包时按 `sci-base → sci-fragments → sci-theme` 的CSS层顺序注入：平台基础样式、例子专用样式、讲义UI覆盖。`python3 scripts/build_lesson.py fragments/diffusion-lens.html --ui-css lecture-ui.css -o lesson.html` 可将同一份受信任UI样式送入每个隔离实例。只改外层页面CSS无法穿过iframe；必须用此入口重新构建。UI文件只接收作者维护的CSS，不接收用户输入的任意代码。

整体UI可以统一按钮外观、圆角、留白、字体、折叠入口和主题。不要用!important竞争优先级，不更改数据属性、事件绑定、科学模型、比较尺度、默认静止和防误触语义。控件命中高度仍至少44px。

图标目前仍有脚本更新文字的旧实现，换图标系统不应在外部临时插入图标节点（重绘可能覆盖它）；后续统一UI需要连同播放状态渲染函数一起适配，保留aria-label、状态及固定占位。CSS覆盖入口不是任意图标库的自动兼容承诺。
