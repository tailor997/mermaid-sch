# STM32F030F4P6 Minimum System — tscircuit Autorouting Demo

这是一个基于 **tscircuit** 的 STM32F030F4P6 单片机最小系统 Demo，
**所有走线完全由 tscircuit 自动布线完成**，只声明了元器件和引脚连接关系。

## 项目结构

```
.
├── src/
│   └── stm32_min_system.tsx      # tscircuit TSX 语法原理图
├── scripts/
│   ├── generate_symbols.js       # SSOP20 / STM32 Symbol 生成脚本
│   └── export.ts                 # 导出 CircuitJSON / SVG 脚本
├── generated/
│   ├── symbols/                  # 已生成的 Symbol JSON & SVG
│   └── demo/                     # Demo 输出 (CircuitJSON / SVG)
├── assets/
│   └── datasheets/               # STM32 Datasheet
├── package.json
├── tsconfig.json
└── README.md
```

## 环境要求

- **Node.js ≥ 20** 或 **Bun**（tscircuit 生态依赖 `import ... with { type: "json" }` 语法）
- **pnpm**（推荐）

> 注：当前项目使用 pnpm 管理依赖。若你使用 npm/yarn，命令需对应替换。

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 方式 A：运行导出脚本（推荐，直接生成 JSON + SVG）

```bash
pnpm run export
```

运行后会在 `generated/demo/` 下生成：
- `stm32_min_system.circuit.json` — 完整的 Circuit JSON（含自动布线后的 trace）
- `stm32_min_system.sch.svg` — 原理图 SVG
- `stm32_min_system.pcb.svg` — PCB 预览 SVG

### 3. 方式 B：使用 tscircuit CLI 进行交互式开发

```bash
pnpm run dev
```

这会启动 `tsci dev` 服务器（默认 `http://localhost:3020`），你可以在浏览器中实时查看原理图和 PCB 3D 预览。

## Demo 电路说明

### 元器件清单

| 位号 | 类型 | 参数 | 封装 | 作用 |
|------|------|------|------|------|
| U1 | MCU | STM32F030F4P6 | TSSOP20 | 主控芯片 |
| C1 | 电容 | 100nF | 0402 | VDD 去耦 |
| C2 | 电容 | 100nF | 0402 | VDDA 去耦 |
| C3 | 电容 | 100nF | 0402 | NRST 滤波 |
| R1 | 电阻 | 10k | 0402 | NRST 上拉 |
| R2 | 电阻 | 10k | 0402 | BOOT0 下拉 |
| R3 | 电阻 | 1k | 0402 | LED 限流 |
| LED1 | LED | - | 0603 | PA0 指示灯 |

### 连接关系

- **电源**：`VDD`、`VDDA` → `VCC`；`VSS` → `GND`
- **去耦**：`C1`、`C2` 并接在 `VCC` 与 `GND` 之间
- **复位**：`NRST` 经 `R1` 上拉到 `VCC`，经 `C3` 滤波到 `GND`
- **启动模式**：`BOOT0` 经 `R2` 下拉到 `GND`（从 Flash 启动）
- **指示灯**：`PA0` → `R3` → `LED1` → `GND`

### 自动布线

代码中**没有任何手动绘制的走线坐标**。所有连接仅通过 `<trace from="..." to="..." />` 声明，tscircuit 的 `sequential_trace` 自动布线器会：

1. 根据 `pcbX`/`pcbY` 放置器件
2. 自动计算 PCB 走线路径
3. 自动处理 schematic 连线布局
4. 生成完整的 CircuitJSON

## 核心语法要点

### 1. 芯片定义与引脚别名

```tsx
<chip
  name="U1"
  footprint="tssop20"
  pinLabels={{
    pin1: "BOOT0",
    pin2: "PF0_OSC_IN",
    // ...
    pin16: "VDD",
  }}
/>
```

通过 `pinLabels` 将物理引脚号映射为可读信号名，后续即可用 `U1.VDD`、`U1.BOOT0` 等方式在 `<trace>` 中引用。

### 2. 自动布线声明

```tsx
<trace from="U1.VDD" to="net.VCC" />
<trace from="U1.PA0" to="R3.pin1" />
```

- `net.VCC` / `net.GND` 会自动创建为电源网络
- 电阻、电容的引脚名为 `.pin1` / `.pin2`
- LED 的引脚名为 `.pos` / `.neg`

### 3. 原理图引脚排布

```tsx
schPortArrangement={{
  leftSide: { direction: "top-to-bottom", pins: [1,2,3,4,5,6,7,8,9,10] },
  rightSide: { direction: "bottom-to-top", pins: [20,19,18,17,16,15,14,13,12,11] },
}}
```

控制芯片在原理图中的引脚分布方向，符合 TSSOP20 的阅读习惯。

## 扩展建议

- **替换 footprint**：若 `tssop20` 在本地库中不存在，可用 `easyeda` 工具从嘉立创下载真实封装：
  ```bash
  npx easyeda convert -i C32908 -o stm32_footprint.tsx
  ```
- **添加晶振**：在 `PF0_OSC_IN` / `PF1_OSC_OUT` 之间添加 `<crystal>` 和两颗负载电容，可进一步测试差分布线效果。
- **添加 SWD 排针**：将 `PA13_SWDIO`、`PA14_SWCLK` 引出到 `<pinheader>`，测试多端口自动布线。
