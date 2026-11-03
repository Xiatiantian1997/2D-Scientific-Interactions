# 接入 SOP

## 1. 生成 HTML

```sh
python3 scripts/build_lesson.py fragments/sampling-distribution.html fragments/quantum-linked.html -o lesson.html --title "交互讲义"
python3 scripts/build_lesson.py fragments/wave-speeds.html --ui-css lecture-ui.css -o lesson.html
python3 scripts/build_catalog.py
```

第一条组合独立实验，第二条应用统一 UI，第三条生成全部示例。打包只需 Python；生成的 HTML 不依赖服务器或外部脚本。

浏览器打开生成文件。GitHub 源码预览不运行 HTML；Notion 中使用允许脚本且无需额外登录的已发布网页嵌入，并在实际宿主验证。

## 2. 接入共用组件

每个片段提供一个 `[data-controls]` 容器，并调用一次 `SciControls.mount(root, config)`。

| 配置 | 用途 |
|---|---|
| `controls` | 按顺序声明各控件的唯一 `key`、`label`、类型与默认值 |
| `get / set` | 读取、更新模型；或以 `input` 接入模型的数值适配器 |
| `kind: choice` | 单按钮循环 `items` 中的状态 |
| `kind: action` | `act` 执行单次动作 |
| `kind: wheel` | `stops` 定义主档，`discrete` 定义离散选择，`period` 只用于可循环量 |
| `transport` | `toggle / isPlaying` 绑定对应播放对象 |
| `pause / cancelGesture` | 处理失焦、后台和手势中断 |
| `graph` | 将图形点击播放与模型原有拖动操作分离 |

模型更新后调用 `root.sciSync?.()` 同步组件。组件不持有另一份科学状态。

实例提供 `sciApi.getState()`、`getControl(key)`、`reset(key)`、`pause()` 和 `controls` 描述。`reset` 必须指定有效区域，不能无参数复位全部。`sciDisposeControls()` 清理共用监听器；完整卸载通过移除实例 iframe 完成，以一并释放模型观察器及动画。

## 3. 保持实例隔离

打包器为每个实例创建独立 `iframe srcdoc`，只授予 `allow-scripts`。同一片段可以重复使用，不把固定 ID 的片段直接重复拼入同一 DOM。物理耦合在模型内部显式定义单位、因果和共享状态，不能靠同名变量自动关联。

## 4. 应用 UI 与主题

样式优先级：`sci-base → sci-fragments → sci-theme`。用 `--ui-css` 将宿主样式注入各实例；外层 CSS 不穿过 iframe。

可覆盖 `.sci-panel`、`.sci-group`、`.sci-field`、`.sci-button`、`.sci-slider`、`.sci-wheel`；尺寸令牌包括 `--sci-control-height`、`--sci-button-width`、`--sci-wheel-width`、`--sci-control-radius`。模型不得依赖这些像素值。

暖纸、素纸、深色使用同一组语义颜色令牌。换主题只更新令牌，不重新加载实验。消息校验来源；保留科学色彩职责、图形比例、命中范围及辅助功能。需要更换控件形式时显式适配行为接口，不能用遮挡、重复控件或覆盖监听器实现。

## 5. 检查交付

修改 `fragments/`、`runtime/` 后重新生成 `examples/`，执行 [验证 SOP](validation.md)。页面、源码、模型约定和操作文档一同保持一致。
