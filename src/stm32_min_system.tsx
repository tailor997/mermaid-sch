import type { CommonLayoutProps } from "@tscircuit/props"

/**
 * STM32F030F4P6 Minimum System Demo for tscircuit Autorouting
 *
 * This circuit demonstrates:
 * - STM32F030F4P6 in TSSOP20
 * - Power decoupling (VDD, VDDA)
 * - NRST reset circuit with pull-up + filter cap
 * - BOOT0 pulldown
 * - LED indicator on PA0
 *
 * All component placements are declared, but trace routing is 100% automatic.
 */
export const Stm32MinSystem = (props: CommonLayoutProps) => {
  return (
    <board
      width="30mm"
      height="25mm"
      autorouter="sequential_trace"
      {...props}
    >
      {/* === Main MCU: STM32F030F4P6 (TSSOP20) === */}
      <chip
        name="U1"
        footprint="tssop20"
        manufacturerPartNumber="STM32F030F4P6"
        pinLabels={{
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
        }}
        schPortArrangement={{
          leftSide: {
            direction: "top-to-bottom",
            pins: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          },
          rightSide: {
            direction: "bottom-to-top",
            pins: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
          },
        }}
        pcbX="15mm"
        pcbY="12.5mm"
      />

      {/* === Decoupling & Reset Passives === */}
      <capacitor
        name="C1"
        capacitance="100nF"
        footprint="0402"
        pcbX="22mm"
        pcbY="8mm"
      />
      <capacitor
        name="C2"
        capacitance="100nF"
        footprint="0402"
        pcbX="8mm"
        pcbY="18mm"
      />
      <capacitor
        name="C3"
        capacitance="100nF"
        footprint="0402"
        pcbX="8mm"
        pcbY="10mm"
      />
      <resistor
        name="R1"
        resistance="10k"
        footprint="0402"
        pcbX="6mm"
        pcbY="8mm"
      />
      <resistor
        name="R2"
        resistance="10k"
        footprint="0402"
        pcbX="8mm"
        pcbY="20mm"
      />

      {/* === LED Indicator on PA0 === */}
      <resistor
        name="R3"
        resistance="1k"
        footprint="0402"
        pcbX="22mm"
        pcbY="16mm"
      />
      <led
        name="LED1"
        footprint="0603"
        pcbX="26mm"
        pcbY="16mm"
      />

      {/* === Power & Ground === */}
      {/* tscircuit automatically creates nets when referenced in traces */}

      {/* Power rails */}
      <trace from="U1.VDD" to="net.VCC" />
      <trace from="U1.VSS" to="net.GND" />
      <trace from="U1.VDDA" to="net.VCC" />

      {/* Decoupling caps */}
      <trace from="C1.pin1" to="net.VCC" />
      <trace from="C1.pin2" to="net.GND" />
      <trace from="C2.pin1" to="net.VCC" />
      <trace from="C2.pin2" to="net.GND" />

      {/* NRST reset circuit: 10k pull-up to VCC + 100nF to GND */}
      <trace from="U1.NRST" to="R1.pin2" />
      <trace from="R1.pin1" to="net.VCC" />
      <trace from="U1.NRST" to="C3.pin1" />
      <trace from="C3.pin2" to="net.GND" />

      {/* BOOT0 pulldown to GND (boot from Flash) */}
      <trace from="U1.BOOT0" to="R2.pin1" />
      <trace from="R2.pin2" to="net.GND" />

      {/* LED indicator: PA0 -> 1k -> LED -> GND */}
      <trace from="U1.PA0" to="R3.pin1" />
      <trace from="R3.pin2" to="LED1.pos" />
      <trace from="LED1.neg" to="net.GND" />
    </board>
  )
}
