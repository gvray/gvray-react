# 主题系统使用规范

> 规范版本：v1.0 | 最后更新：2026-06-25

## 一、核心原则

```
单一来源：Zustand Store → ConfigProvider → ThemeTokenInjector → CSS 变量
统一通道：所有自定义样式必须通过 CSS 变量消费主题色
禁止硬编码：任何颜色值必须从 token 或 CSS 变量来，禁止写死 #xxx
```

## 二、技术栈角色分工

| 技术 | 职责 | 颜色消费方式 |
| --- | --- | --- |
| **antd** | UI 组件库 | `ConfigProvider` + cssinjs，自动响应 |
| **Less** | 页面级样式 | 只写结构，颜色全部用 `var(--gvray-xxx)` |
| **styled-components** | 组件级样式 | 直接用 `var(--gvray-xxx)`，不用 `props.theme` |
| **ECharts** | 图表 | `theme.useToken()` 获取 token 注入 option |
| **TSX inline style** | 极少数场景 | 用 `var(--gvray-xxx)` 或 `theme.useToken()` |

## 三、使用规范（按场景）

### 3.1 Less 文件 → 全部用 CSS 变量

```less
/* ✅ 正确 */
.my-card {
  color: var(--gvray-text-color);
  background: var(--gvray-bg-container);
  border: 1px solid var(--gvray-border-color);

  &:hover {
    background: var(--gvray-primary-1); // 主色衍生背景
    border-color: var(--gvray-primary-3);
  }
}

/* ❌ 错误 */
.my-card {
  color: #666; // 硬编码
  background: #fff;
  border: 1px solid #d9d9d9;
}
```

**重要**：不要通过 LESS 变量包装 CSS 变量：

```less
/* ❌ 错误 - LESS 编译可能将 CSS 变量求值为静态值 */
@primary-color: var(--gvray-primary-color);
.button {
  color: @primary-color;
}

/* ✅ 正确 - 直接使用 */
.button {
  color: var(--gvray-primary-color);
}
```

### 3.2 styled-components → 用 CSS 变量

```tsx
// ✅ 正确：样式静态，主题变化由 CSS 变量驱动，React 不重渲染
const MyBox = styled.div`
  color: var(--gvray-text-color);
  background: var(--gvray-bg-container);
  border: 1px solid var(--gvray-border-color);

  &:hover {
    background: var(--gvray-primary-1);
  }
`;

// ❌ 错误：主题变化时 styled-components 会重新生成样式、插入 style 标签
const MyBoxBad = styled.div<{ $color: string }>`
  color: ${({ $color }) => $color};
`;

// ❌ 错误：ThemeProvider 注入 antd token 导致双上下文
<ThemeProvider theme={antdToken}>
  <MyBox /> // 消费 props.theme.colorPrimary
</ThemeProvider>;
```

**唯一例外**：布局参数（width、height、position 等）可以用 transient props（`$` 前缀）传递。

### 3.3 TSX inline style → CSS 变量或 useToken

```tsx
// ✅ 正确：使用 CSS 变量
<span style={{ color: 'var(--gvray-color-primary)' }} />

// ✅ 正确：在组件内用 useToken
import { theme } from 'antd';
const { token } = theme.useToken();
<Progress strokeColor={{ from: token.colorPrimary, to: token.colorPrimaryHover }} />

// ❌ 错误
<span style={{ color: '#1677ff' }} />
```

### 3.4 ECharts 图表 → useToken 注入

```tsx
import { theme } from 'antd';

const MyChart = () => {
  const { token } = theme.useToken();

  const option = {
    xAxis: {
      axisLabel: { color: token.colorTextSecondary },
    },
    yAxis: {
      splitLine: { lineStyle: { color: token.colorFillSecondary } },
    },
    tooltip: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
      textStyle: { color: token.colorText },
    },
    // 数据系列颜色保留，用于区分数据
    series: [{ data: [...], itemStyle: { color: '#667eea' } }],
  };

  return <ReactECharts option={option} />;
};
```

### 3.5 颜色消费方式

| 场景                     | 推荐方式                                 |
| ------------------------ | ---------------------------------------- |
| Less / styled-components | `var(--gvray-xxx)`                       |
| ECharts / Canvas         | `theme.useToken()`                       |
| TSX inline style         | `var(--gvray-xxx)` 或 `theme.useToken()` |

不要自定义 Hook 封装颜色，CSS 变量和 `useToken` 已经覆盖所有场景。

## 四、CSS 变量命名对照表

ThemeTokenInjector 同时注入两套命名，完全兼容：

| 语义 | 自定义命名 | antd 原生命名 |
| --- | --- | --- |
| 主色 | `--gvray-primary-color` | `--gvray-color-primary` |
| 主色 hover | `--gvray-primary-color-hover` | `--gvray-color-primary-hover` |
| 主色 active | `--gvray-primary-color-active` | `--gvray-color-primary-active` |
| 主色背景 | `--gvray-primary-1` | `--gvray-color-primary-bg` |
| 成功色 | `--gvray-success-color` | `--gvray-color-success` |
| 警告色 | `--gvray-warning-color` | `--gvray-color-warning` |
| 错误色 | `--gvray-error-color` | `--gvray-color-error` |
| 信息色 | `--gvray-info-color` | `--gvray-color-info` |
| 文本色 | `--gvray-text-color` | `--gvray-color-text` |
| 次要文本 | `--gvray-text-color-secondary` | `--gvray-color-text-secondary` |
| 三级文本 | `--gvray-text-color-disabled` | `--gvray-color-text-tertiary` |
| 四级文本 | — | `--gvray-color-text-quaternary` |
| 占位文本 | `--gvray-text-color-placeholder` | `--gvray-color-text-placeholder` |
| 背景色 | `--gvray-bg-color` | — |
| 容器背景 | `--gvray-bg-container` | `--gvray-color-bg-container` |
| 浮层背景 | `--gvray-bg-elevated` | `--gvray-color-bg-elevated` |
| 布局背景 | `--gvray-bg-layout` | `--gvray-color-bg-layout` |
| 边框色 | `--gvray-border-color` | `--gvray-color-border` |
| 次边框 | `--gvray-border-color-secondary` | `--gvray-color-border-secondary` |
| 分割线 | `--gvray-border-color-split` | — |
| 填充色 | `--gvray-fill-color` | `--gvray-color-fill` |
| 次填充 | `--gvray-fill-color-secondary` | `--gvray-color-fill-secondary` |
| 阴影 | `--gvray-box-shadow` | — |
| 次阴影 | `--gvray-box-shadow-secondary` | — |

**推荐**：新代码统一使用自定义命名 `--gvray-xxx`，更简洁。遇到已有代码使用 `--gvray-color-xxx` 也无需修改。

## 五、常见颜色替换对照

| 硬编码值 | 替换为 |
| --- | --- |
| `#fff`, `#ffffff` | `var(--gvray-bg-container)` 或 `var(--gvray-color-bg-container)` |
| `#000`, `#000000` | `var(--gvray-text-color)` |
| `#666` | `var(--gvray-text-color-secondary)` |
| `#999`, `#bfbfbf`, `#8c8c8c`, `#bbb` | `var(--gvray-text-color-placeholder)` |
| `#888` | `var(--gvray-text-color-secondary)` |
| `#d9d9d9` | `var(--gvray-border-color)` |
| `#f0f0f0`, `#f5f5f5` | `var(--gvray-border-color)` 或 `var(--gvray-fill-color)` |
| `#fafafa` | `var(--gvray-bg-elevated)` |
| `#e6e6e6` | `var(--gvray-fill-color)` |
| `#1677ff` | `var(--gvray-primary-color)` |
| `#1890ff` | `var(--gvray-primary-color)` |
| `#52c41a` | `var(--gvray-success-color)` |
| `#faad14` | `var(--gvray-warning-color)` |
| `#ff4d4f` | `var(--gvray-error-color)` |
| `#722ed1` | `var(--gvray-info-color)` |
| `rgba(0,0,0,0.45)` | `var(--gvray-text-color-secondary)` |
| `rgba(0,0,0,0.25)` | `var(--gvray-text-color-placeholder)` |
| `rgba(0,0,0,0.06)` | `var(--gvray-fill-color)` |
| `rgba(255,255,255,0.75)` | `var(--gvray-bg-mask)` |

## 六、架构图

```
┌─────────────────────────────────────────────────────────────┐
│  Zustand Store (useSettingStore)                             │
│  theme | colorPrimary | sidebarTheme                         │
│  persist → localStorage | sync → backend                     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  ConfigProvider                                              │
│  theme={{ algorithm, token: { colorPrimary } }}             │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  ThemeTokenInjector (useToken → CSS 变量)                    │
│  --gvray-primary-color, --gvray-text-color, ...                │
│  --gvray-color-primary, --gvray-color-text, ... (兼容层)        │
└────────────┬───────────┬───────────┬────────────────────────┘
             │           │           │
      ┌──────▼───┐ ┌────▼────┐ ┌────▼────┐
      │  antd    │ │  Less   │ │ styled  │
      │ 组件     │ │ 页面    │ │ 组件    │
      │ cssinjs  │ │ var()   │ │ var()   │
      └──────────┘ └─────────┘ └─────────┘
                         │
                  ┌──────▼──────┐
                  │  ECharts    │
                  │ useToken()  │
                  └─────────────┘
```

## 七、FAQ

**Q1: 为什么不用 styled-components 的 ThemeProvider？**

A: 三个原因：

1. 双上下文（ConfigProvider + ThemeProvider）维护成本高
2. styled-components 的 `props.theme` 动态插值会导致重渲染
3. CSS 变量是更轻量的跨技术栈方案，antd、Less、styled-components 都能消费

**Q2: Less 中能不能用 CSS 变量做运算？**

A: 不能。Less 的数学运算只支持编译期确定的值：

```less
/* ❌ 错误 - 运行时求值失败 */
width: calc(100% - var(--gvray-border-radius));

/* ✅ 正确 - calc 在浏览器运行期计算 */
width: calc(100% - var(--gvray-border-radius));
```

**Q3: 切换主题时 CSS 变量怎么生效？**

A: ThemeTokenInjector 的 `div` 包裹了整个应用布局，当 antd ConfigProvider 的 token 变化时：

1. `theme.useToken()` 返回新 token
2. `useMemo` 重新计算 `cssVars`
3. `div` 的 `style` 属性更新
4. 浏览器重新计算所有 `var(--gvray-xxx)` 的值
5. React 组件**不会**重渲染（因为样式规则本身没变，只是变量值变了）

**Q4: 新组件怎么接入主题？**

A: 三步：

1. 需要动态值 → `theme.useToken()` 获取 token
2. 写样式 → 用 `var(--gvray-xxx)` CSS 变量
3. 不要 → 写死任何 `#xxx` 颜色值

**Q5: Dashboard 渐变卡片为什么保留 `color: #fff`？**

A: 渐变卡片的背景是深色渐变（`linear-gradient(135deg, ...)`），文字必须在任何主题下都是白色才能可读。这是**装饰性硬编码**，不是主题色。

## 八、检查清单（Code Review）

提交 PR 时检查：

- [ ] 没有 `#1677ff`、`#1890ff` 等主色硬编码
- [ ] 没有 `#fff` / `#ffffff` / `#000` 等极端色（除非装饰性场景）
- [ ] Less 中所有颜色使用 `var(--gvray-xxx)`
- [ ] styled-components 中没有 `${props => props.$color}` 动态插值传递主题色
- [ ] ECharts 使用 `theme.useToken()` 获取颜色
- [ ] 新增/修改的组件在暗色主题下测试通过
