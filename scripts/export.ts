/**
 * Export Script: Evaluates the STM32 minimum system circuit and generates
 * CircuitJSON, Schematic SVG, and PCB SVG outputs.
 *
 * This script uses @tscircuit/core's programmatic (non-React) API,
 * which is 100% equivalent to the TSX version but runs directly in Node.js.
 */
import {
  Circuit,
  Board,
  Chip,
  Resistor,
  Capacitor,
  Led,
  Trace,
} from "@tscircuit/core"
import {
  circuitJsonToSchematicSvg,
  circuitJsonToPcbSvg,
} from "circuit-to-svg"
import fs from "fs"

async function main() {
  const circuit = new Circuit()

  const board = new Board({
    width: "30mm",
    height: "25mm",
    autorouter: "sequential_trace",
  })
  circuit.add(board)

  // === MCU ===
  const U1 = new Chip({
    name: "U1",
    footprint: "tssop20",
    manufacturerPartNumber: "STM32F030F4P6",
    pinLabels: {
      pin1: "BOOT0",
      pin2: "PF0_OSC_IN",
      pin3: "PF1_OSC_OUT",
      pin4: "NRST",
      pin5: "VDDA",
      pin6: "PA0",
      pin7: "PA1",
      pin8: "PA2",
      pin9: "PA3",
      pin10: "PA4",
      pin11: "PA5",
      pin12: "PA6",
      pin13: "PA7",
      pin14: "PB1",
      pin15: "VSS",
      pin16: "VDD",
      pin17: "PA9",
      pin18: "PA10",
      pin19: "PA13_SWDIO",
      pin20: "PA14_SWCLK",
    },
    schPortArrangement: {
      leftSide: {
        direction: "top-to-bottom",
        pins: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      rightSide: {
        direction: "bottom-to-top",
        pins: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
      },
    },
    pcbX: "15mm",
    pcbY: "12.5mm",
  })
  board.add(U1)

  // === Passives ===
  const C1 = new Capacitor({
    name: "C1",
    capacitance: "100nF",
    footprint: "0402",
    pcbX: "22mm",
    pcbY: "8mm",
  })
  const C2 = new Capacitor({
    name: "C2",
    capacitance: "100nF",
    footprint: "0402",
    pcbX: "8mm",
    pcbY: "18mm",
  })
  const C3 = new Capacitor({
    name: "C3",
    capacitance: "100nF",
    footprint: "0402",
    pcbX: "8mm",
    pcbY: "10mm",
  })
  const R1 = new Resistor({
    name: "R1",
    resistance: "10k",
    footprint: "0402",
    pcbX: "6mm",
    pcbY: "8mm",
  })
  const R2 = new Resistor({
    name: "R2",
    resistance: "10k",
    footprint: "0402",
    pcbX: "8mm",
    pcbY: "20mm",
  })
  const R3 = new Resistor({
    name: "R3",
    resistance: "1k",
    footprint: "0402",
    pcbX: "22mm",
    pcbY: "16mm",
  })
  const LED1 = new Led({
    name: "LED1",
    footprint: "0603",
    pcbX: "26mm",
    pcbY: "16mm",
  })

  ;[C1, C2, C3, R1, R2, R3, LED1].forEach((c) => board.add(c))

  // === Traces (all autorouted) ===
  board.add(new Trace({ from: "U1.VDD", to: "net.VCC" }))
  board.add(new Trace({ from: "U1.VSS", to: "net.GND" }))
  board.add(new Trace({ from: "U1.VDDA", to: "net.VCC" }))

  board.add(new Trace({ from: "C1.pin1", to: "net.VCC" }))
  board.add(new Trace({ from: "C1.pin2", to: "net.GND" }))
  board.add(new Trace({ from: "C2.pin1", to: "net.VCC" }))
  board.add(new Trace({ from: "C2.pin2", to: "net.GND" }))

  board.add(new Trace({ from: "U1.NRST", to: "R1.pin2" }))
  board.add(new Trace({ from: "R1.pin1", to: "net.VCC" }))
  board.add(new Trace({ from: "U1.NRST", to: "C3.pin1" }))
  board.add(new Trace({ from: "C3.pin2", to: "net.GND" }))

  board.add(new Trace({ from: "U1.BOOT0", to: "R2.pin1" }))
  board.add(new Trace({ from: "R2.pin2", to: "net.GND" }))

  board.add(new Trace({ from: "U1.PA0", to: "R3.pin1" }))
  board.add(new Trace({ from: "R3.pin2", to: "LED1.pos" }))
  board.add(new Trace({ from: "LED1.neg", to: "net.GND" }))

  // Render and autoroute
  await circuit.render()

  const circuitJson = circuit.getCircuitJson()
  fs.mkdirSync("generated/demo", { recursive: true })

  fs.writeFileSync(
    "generated/demo/stm32_min_system.circuit.json",
    JSON.stringify(circuitJson, null, 2)
  )

  const schSvg = circuitJsonToSchematicSvg(circuitJson, {
    width: 800,
    height: 600,
  })
  fs.writeFileSync("generated/demo/stm32_min_system.sch.svg", schSvg)

  const pcbSvg = circuitJsonToPcbSvg(circuitJson, {
    width: 800,
    height: 600,
  })
  fs.writeFileSync("generated/demo/stm32_min_system.pcb.svg", pcbSvg)

  console.log("✅ Export complete!")
  console.log("  - generated/demo/stm32_min_system.circuit.json")
  console.log("  - generated/demo/stm32_min_system.sch.svg")
  console.log("  - generated/demo/stm32_min_system.pcb.svg")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
