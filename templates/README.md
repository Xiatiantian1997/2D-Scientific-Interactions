# 模板目录

按读者需要理解的关系选方法，再改编科学模型。同一实验可以组合几种方法，不必强行归到唯一类别。

| 方法 | 适用目标 | 参考源码 |
|---|---|---|
| 参数联动 | 改变输入，看派生结果与固定条件 | [电阻与功率](../fragments/resistor-coupling.html) |
| 连续过程 | 看状态随时间变化及交换关系 | [扩散与放大](../fragments/diffusion-lens.html)、[区域交换](../fragments/diffusion-exchange.html)、[相速与群速](../fragments/wave-speeds.html) |
| 形态反馈 | 结构变化反过来限制后续过程 | [沟槽封口](../fragments/trench-closure.html) |
| 原位比较 | 固定尺度和进度比较不同条件 | [波包相遇](../fragments/wave-overlap.html) |
| 局部读取与联动 | 选位置，读取局部量或关联状态 | [势能与力](../fragments/potential-force.html)、[晶圆测厚探针](../fragments/wafer-probe.html) |
| 分量与整体 | 看分量怎样构成同一个对象 | [波的叠加](../fragments/wave-addition.html)、[复数与相位](../fragments/complex-wave.html) |
| 双参数约束 | 看多个条件同时成立的范围 | [工艺窗口](../fragments/process-window.html) |
| 随机采样与分布 | 看单次不确定与大量结果的规律 | [采样分布](../fragments/sampling-distribution.html) |
| 表示之间联动 | 看多张图如何描述同一状态 | [量子定态](../fragments/quantum-linked.html) |

## 使用一个范例

1. 读取同名 `contracts/*.json`，确认假设、单位、颜色含义、操作与比较基准。
2. 修改 `fragments/*.html`，按[创作简表](authoring-brief.md)核对新的模型。
3. 按[接入说明](../docs/host-integration.md)打包，按[验证说明](../docs/validation.md)检查。

[独立 HTML 目录](../examples/)由源码生成；[组合检查页](../examples/composition-check.html)用于重复实例与同页隔离检查。源码链接不是在线运行预览。

## 选择时的边界

局部放大有两种含义：只是看得更大时使用缩放；需要保留整体位置并展示新细节时使用联动局部视图。像素放大不增加测量分辨率，俯视图也不能凭空变成膜层截面。

晶圆测厚场与工艺窗口使用教学示意数据或响应函数，不是实测结果或经过标定的工艺预测。沟槽封口也是简化几何模型。其他模型的具体边界以各自约定为准。
