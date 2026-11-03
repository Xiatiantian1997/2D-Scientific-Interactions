# 验证说明

验证分为模型、语义、交互、布局和宿主五部分。源码审查、模拟 DOM 测试、浏览器自动化和真机测试是不同证据，不相互替代。

## 可重复运行

```sh
node tests/check-additions.cjs
node tests/check-controls.cjs
python3 tests/test_packaging.py
python3 scripts/build_catalog.py
node tests/browser-check.cjs
```

前三项检查无需浏览器；后两项先生成页面，再运行浏览器检查。浏览器检查需要 Playwright、Chromium 与中文字体，环境安装方式见[CI 配置](../.github/workflows/validate-2d.yml)。

| 检查 | 用途 |
|---|---|
| `check-additions.cjs` | 采样、量子联动的模型与模拟 DOM 行为 |
| `check-controls.cjs` | 共用控制规则及范例行为回归 |
| `test_packaging.py` | 主题令牌、样式覆盖、多实例隔离与消息来源 |
| `browser-check.cjs` | 生成页面的浏览器交互、布局与主题检查 |

结果以实际运行输出及 [GitHub Actions](https://github.com/Xiatiantian1997/2d-scientific-interactions/actions) 为准。方法目录不承担测试日志；各范例的科学约定保存在 `contracts/`。

## 接入时检查

- 模型：单位、守恒、边界值、可控与派生量、随机序列及近似范围。
- 语义：颜色与对象身份稳定，辅助线不冒充实物，多图坐标明确。
- 交互：默认静止、暂停可中断、复位范围正确，拖动取消与多指不误触。
- 布局：实际尺寸文字可读，控件不跳位；换肤不改变实验状态。
- 组合：重复实例互不干扰，需要耦合的模型有明确接口。

## 设备与宿主边界

自动化通过不能替代真实平板的滚动、触摸精度、多指、后台恢复与辅助功能检查，也不能证明 Notion 或其他嵌入宿主允许脚本正常运行。当前不宣称这些环境已全面验证；在目标环境使用时记录实际结果即可。

完整讲义的教学效果属于应用评估，与组件能否正确响应操作分别判断。
