# 接入与换肤

## 生成 HTML

```sh
python3 scripts/build_lesson.py fragments/sampling-distribution.html fragments/quantum-linked.html -o lesson.html --title "交互讲义"
python3 scripts/build_lesson.py fragments/diffusion-lens.html --ui-css lecture-ui.css -o lesson.html
python3 scripts/build_catalog.py
```

前两条生成讲义；第三条从片段生成独立范例和组合检查页。不需要 npm 或服务端来打包。片段及自定义 CSS 应由作者维护和审查。

生成文件可在普通浏览器打开。GitHub 源码页不执行 HTML；Notion 正文也不执行 HTML，需要可访问的外部网页嵌入，且宿主允许脚本。登录、嵌入权限与设备兼容性需在实际环境验证。

## 多实例隔离

每个片段放入独立的 `iframe srcdoc`，仅授予 `allow-scripts`，不授予同源权限。可重复传入同一个文件；包含固定 ID 的片段不能直接拼接到同一 DOM。

打包器自动注入 `runtime/host.css` 与 `runtime/touch-controls.js`。同页模型默认独立；物理联动按[平台方法](platform-policy.md)设计共享状态或适配器，隔离容器不是自动耦合协议。

## 基础 UI 与主题

样式覆盖顺序为：

```text
sci-base → sci-fragments → sci-theme
基础样式 → 实验专用样式 → 讲义 UI 覆盖
```

通过 `--ui-css` 将同一份 UI 样式注入各实例。只改外层页面 CSS 无法穿过 iframe。

内置暖纸、素纸、深色主题。颜色使用语义令牌；主题通过消息更新，不重新加载实例，保留模型状态。令牌限定为作者配置的十六进制颜色；父子窗口校验消息来源。

UI 可以调整字体、留白、圆角、控件外观与反馈；主题可以调整配色与装饰。两者均需保留科学颜色的角色、比较尺度、事件绑定、命中范围及防误触规则。避免用 `!important` 互相覆盖。

图标更换涉及播放状态的渲染函数，不能仅插入一个图标节点后假设脚本不会覆盖。自定义图标须保留可访问名称与固定占位。

## 接口与限制

- 参考实现尚未统一为通用组件 API。部分实例提供 `sciApi.reset/pause/getState`，采样与量子联动实例提供 `getState/setValue/reset`；使用前检查对应源码。
- 采样与量子联动实例提供 `sciDestroy`。其他片段的 `sciDisposeControls` 只清理共用控制器，不能代替完整卸载；当前推荐通过销毁隔离 iframe 回收整个实例。
- 自定义片段的外部资源需单独审查，打包器不会自动离线化任意依赖。
- CSS 覆盖不等于任意图标库、第三方组件或宿主的自动兼容。

测试入口与实际设备限制集中在[验证说明](validation.md)。

## 控件替换与基础 UI

控件统一参见 [UI-design](https://github.com/Xiatiantian1997/UI-design/blob/main/docs/controls.md)。滑条外观可以覆盖；把播放并入时间条、把复选框／开关换成状态按钮，是行为适配，不能只靠 CSS 完成。

保持实验模块、交互组件、基础 UI、主题四层职责：实验提供模型、图形含义、状态与动作；交互组件处理点击、拖动、播放与中断；基础 UI 统一布局、尺寸与反馈；主题配置配色、材质与装饰。替换时必须移除旧监听器、共享同一状态源，并同步 aria-pressed、禁用状态和焦点。不让一次手势同时触发播放、定位和空白复位。

本次更新保存目标约定，旧例没有自动全部改版。当前各实例接口不一，仍须逐例适配与验证。

旧控制器的整区 reset 回调不是新版局部复位接口。新接入按区域声明恢复字段，保留相邻状态及已记录基准；固定 ID 的独立示例继续放入隔离 iframe，不直接重复粘贴到同一 DOM。方法与组件约定定稿不等于旧范例已完成迁移。
