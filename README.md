# 2D Scientific Interactions

二维科学交互 · 曲线、场、过程动画与参数联动。

面向触摸屏科学讲义的二维交互方法与 HTML 示例，优先让读者直接看懂变化和依赖关系。


## 开放创作框架 3.1

范例可引用、改编、组合，也允许新的表达方式；它们不是固定题型。科学约束、视觉含义和验证诚实是底线，UI与布局是可调整的默认做法。多模型可同页独立使用、共享同一状态，或按明确接口耦合。新形式说明缺口、做最小样例并验证，详见[开放创作规则](docs/platform-policy.md)。

## 范围

- 函数曲线、波形、二维场与分布。
- 参数干预、约束联动、基准虚影与同位置比较。
- 连续过程动画、暂停回看和直接拖动。
- 手机与平板布局、必要图例和清晰的变量解释。

## 与三维仓库的分工

3D Scientific Interactions 负责设备建模、空间结构和装配拆解。二维与三维共用对象身份、模型约束、触摸和验证原则；存在二维截面与三维结构联动时，保留一个连贯教学单元，不为分类而割裂内容。

## 创作原则

1. 先写清学习目标、可控输入、固定条件和派生量。
2. 颜色含义稳定，变化对象保持身份；不增加没有解释作用的标记。
3. 需要比较时保留明确基准；不用动画替代物理约束。
4. 优先直接拖动和连续反馈，保留必要的点击替代入口。
5. 区分实际检查、源码审查与待测项目。

## 当前状态

当前共13份HTML片段，归入九类方法；本轮补齐随机采样与分布、表示之间的联动，并补录目录遗漏的复数波与波速两例。现有示例及逐例验证边界见模板清单。这是方法和参考实现集合，不是已经完成的通用仿真平台。

## 模板与下一轮检查

进入 [模板提炼入口](templates/README.md)，查看候选类型、现有参考与逐例检查表；复制 [模板工作稿](templates/authoring-brief.md) 填写一个教学单元。当前已有可运行的对话预览源片段；共用组件提炼与真实触屏测试仍未完成。`fragments/` 需要宿主样式。现提供 `scripts/build_lesson.py` 与 `runtime/host.css`，可打包为离线独立页并隔离多个实例；暖纸/素纸/深色主题可换。见[接入说明](docs/host-integration.md)和[双实例接入检查页源码](examples/composition-check.html)。GitHub源码页不是运行页面。

配套仓库：[3D Scientific Interactions](https://github.com/Xiatiantian1997/3d-scientific-interactions)。2D暂不继续堆案例；后续重点是宿主样式、旧例迁移与真机验证。详见[收尾与接入检查](docs/2d-readiness.md)。


## 2D收尾更新

已有13例已统一迁移下方操作区、固定尺寸播放符号、空白短按复位及图内18px字号；不再新增案例。见[迁移范围与复位表](docs/2d-migration.md)。

- 生成全部可运行页：`python3 scripts/build_catalog.py`（examples/内每例独立，无需网络依赖）。
- 模型与接入检查：`node tests/check-additions.cjs`、`python3 -m unittest discover -s tests`。
- Chromium检查：`node tests/browser-check.cjs`；依赖与截图记录见[自动验证](../../actions)。
- 旧片段需加载`runtime/host.css`与`runtime/touch-controls.js`；推荐使用打包器。不可把多个含固定ID的旧片段直接拼接到一个DOM。

真实平板与Notion验收不等同于自动测试，保留为单独待确认项。
