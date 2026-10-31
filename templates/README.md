# 2D 模板提炼入口

## 候选类型与参考

下列示例暂仍保存在 3D 仓库；这里只建立入口，不移动或复制源码。状态均为“待逐例审查与提炼”，不能据此宣称已有成熟模板。

| 候选类型 | 现有参考 | 首要检查 |
|---|---|---|
| 参数与结果联动 | [PN 结试作](https://github.com/Xiatiantian1997/3d-scientific-interactions/blob/main/examples/pn-junction-lesson.html) | 固定条件、可控量和派生量是否可辨 |
| 连续过程与跨尺度解释 | [硅烷成膜](https://github.com/Xiatiantian1997/3d-scientific-interactions/blob/main/examples/silane-cvd-motion.html) | 运输、反应、成核的对象与时间含义是否连贯 |
| 形貌演化与反馈 | [沟槽成膜](https://github.com/Xiatiantian1997/3d-scientific-interactions/blob/main/examples/cvd-trench-growth.html) | 口部收窄怎样影响后续供料；示意与预测的边界 |
| 同位置基准比较 | [晶体缺陷参考](https://github.com/Xiatiantian1997/3d-scientific-interactions/blob/main/examples/crystal-layer-labels.html) | 保留比较能力，提取二维视图可用的部分 |
| 曲线、波与二维场 | 尚未选定 | 暂不创建演示；选到能说明问题的参考再提炼 |

共用科学规范以 [3D 仓库创作约定](https://github.com/Xiatiantian1997/3d-scientific-interactions/blob/main/docs/authoring-contract.md) 为当前入口，避免两份规范各自漂移。2D 专用实现与模板后续放在本库。

## 模板工作方式

此目录目前是模板提炼的工作入口，不是已验证的通用组件库。先选一个代表例子，完成检查，再抽取可复用部分；没有合适例子或不能讲清的类型暂缓，不凑数量。

1. 复制 [模板工作稿](authoring-brief.md)，填清学习目标、模型条件、视觉含义与动作后果。
2. 复用已有实例中被认可的能力；记录来源路径，不复制整批历史版本。
3. 在一个新的教学问题上试用，检查模板是否仍成立。
4. 记录实际检查证据，区分“实测”“源码审查”“待验证”。通过后再提供独立 HTML 模板及使用说明。

每个最终模板应包含：可运行 HTML、适用与不适用范围、模型接入点、主题接入点、已验证环境及未解决事项。新科学模型仍需单独核实，换主题不能替代模型设计。

## 每例检查表

- [ ] 不读长段说明，能辨认对象、正在变化的部分和变化结果。
- [ ] 比较前后保持尺度、观察位置、对象身份与非干预条件。
- [ ] 输入、固定条件、派生量清楚；相同状态驱动画面、数值和说明。
- [ ] 动画可暂停、反向和中断，途中切换不会留下旧状态。
- [ ] 控件操作有立即可见的后果；无作用的重置和重复选择不占界面。
- [ ] 手机、平板和目标展示环境分别检查；未做的项目保留待验证。
- [ ] 颜色、布局、字号等 UI 项记录到共用 UI 工作，不在每例各做一套。

## 下一轮安排

先逐类审查下面的候选参考，每次完成一类的“例子 → 问题 → 可复用模板”。例子不能支持这一类时明确暂缓。共用 UI 随后统一处理阅读宽度、留白、触摸区域、图例、播放控制和主题；本轮不展开新的演示。
