# 2D Scientific Interactions

用于科学讲义的二维交互方法库：先明确科学关系，再选择表达方式，最后接入讲义 UI 与主题。

这是可复用的方法与范例，不是通用科学求解器。现有 **9 类表达方法、13 个参考实现**；可以组合，也可以为新的教学需求扩展。

## 从这里开始

1. [平台方法](docs/platform-policy.md)：如何设计一个讲得明白的交互。
2. [模板目录](templates/README.md)：按理解目标选择参考实现。
3. [接入与换肤](docs/host-integration.md)：生成 HTML，组合多个模型，接入讲义 UI。

配套：[触摸与控件](docs/touch-and-controls.md) · [创作简表](templates/authoring-brief.md) · [验证说明](docs/validation.md)

## 统一操作

全部 13 个示例通过同一组件入口运行。按 [交互 SOP](docs/touch-and-controls.md) 定义控件、局部复位和播放行为；基础 UI 与主题统一覆盖外观，科学模型保持独立。

## 快速使用

```sh
python3 scripts/build_lesson.py fragments/sampling-distribution.html -o lesson.html
```

用浏览器打开生成的 HTML。多个片段可作为参数一起传入，各自在隔离容器中运行。

## 目录

| 目录 | 用途 |
|---|---|
| `docs/` | 平台方法、操作规则与接入说明 |
| `templates/` | 方法目录与创作简表 |
| `contracts/` | 每个范例的科学假设、视觉含义与交互约定 |
| `fragments/` | 可改编的交互源码 |
| `examples/` | 生成的独立 HTML 与组合检查页 |
| `runtime/` | 共用样式与触摸控制 |
| `scripts/`、`tests/` | 打包与验证 |

修改范例时以 `fragments/` 为源，再运行 `python3 scripts/build_catalog.py` 更新独立页面。GitHub 文件预览不执行 HTML，使用方式见接入说明。

