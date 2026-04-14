import { circuitJsonToSchematicSvg } from "circuit-to-svg";
import fs from "fs";

const PIN_SPACING = 1.0;
const BODY_WIDTH = 4.0;
const BODY_HEIGHT_PER_PIN = 1.0;
const PIN_LENGTH = 1.0;

function generateSsop20() {
  const pinCount = 20;
  const pinsPerSide = 10;
  const bodyHeight = pinsPerSide * BODY_HEIGHT_PER_PIN;
  const topY = (pinsPerSide - 1) * PIN_SPACING / 2;
  
  const circuitJson = [];
  
  // Source component
  circuitJson.push({
    type: "source_component",
    source_component_id: "src_ssop20",
    name: "U?",
    ftype: "simple_chip"
  });
  
  // Schematic component
  circuitJson.push({
    type: "schematic_component",
    schematic_component_id: "sch_ssop20",
    source_component_id: "src_ssop20",
    center: { x: 0, y: 0 },
    size: { width: BODY_WIDTH, height: bodyHeight },
    rotation: 0,
    is_box_with_pins: false
  });
  
  // Body rectangle
  circuitJson.push({
    type: "schematic_rect",
    schematic_rect_id: "rect_ssop20",
    schematic_component_id: "sch_ssop20",
    center: { x: 0, y: 0 },
    width: BODY_WIDTH,
    height: bodyHeight,
    rotation: 0,
    color: "rgb(132, 0, 0)",
    is_filled: true,
    fill_color: "rgb(255, 255, 194)",
    is_dashed: false
  });
  
  // Name text
  circuitJson.push({
    type: "schematic_text",
    schematic_text_id: "text_ssop20_name",
    text: "SSOP20",
    font_size: 0.35,
    position: { x: 0, y: topY + 0.5 },
    rotation: 0,
    anchor: "bottom",
    color: "rgb(0, 100, 100)"
  });
  
  // Notch (pin 1 indicator) - small arc or circle in top-left
  circuitJson.push({
    type: "schematic_circle",
    schematic_circle_id: "notch_ssop20",
    schematic_component_id: "sch_ssop20",
    center: { x: -BODY_WIDTH/2 + 0.3, y: topY - 0.3 },
    radius: 0.15,
    color: "rgb(132, 0, 0)",
    is_filled: true,
    fill_color: "rgb(132, 0, 0)",
    is_dashed: false
  });
  
  // Pins
  for (let i = 0; i < pinsPerSide; i++) {
    const y = topY - i * PIN_SPACING;
    const pinNumLeft = i + 1;
    const pinNumRight = 20 - i;
    
    // Left side pin
    const srcPortIdL = `src_ssop20_p${pinNumLeft}`;
    const schPortIdL = `sch_ssop20_p${pinNumLeft}`;
    
    circuitJson.push({
      type: "source_port",
      source_port_id: srcPortIdL,
      source_component_id: "src_ssop20",
      name: `${pinNumLeft}`,
      pin_number: pinNumLeft
    });
    circuitJson.push({
      type: "schematic_port",
      schematic_port_id: schPortIdL,
      source_port_id: srcPortIdL,
      schematic_component_id: "sch_ssop20",
      center: { x: -BODY_WIDTH/2 - PIN_LENGTH, y: y },
      facing_direction: "left",
      pin_number: pinNumLeft
    });
    circuitJson.push({
      type: "schematic_line",
      schematic_line_id: `line_ssop20_p${pinNumLeft}`,
      schematic_component_id: "sch_ssop20",
      x1: -BODY_WIDTH/2, y1: y, x2: -BODY_WIDTH/2 - PIN_LENGTH, y2: y,
      color: "rgb(132, 0, 0)",
      is_dashed: false
    });
    // Pin label inside body
    circuitJson.push({
      type: "schematic_text",
      schematic_text_id: `label_ssop20_p${pinNumLeft}`,
      text: `${pinNumLeft}`,
      font_size: 0.22,
      position: { x: -BODY_WIDTH/2 + 0.15, y: y },
      rotation: 0,
      anchor: "left",
      color: "rgb(0, 100, 100)"
    });
    // Pin number outside
    circuitJson.push({
      type: "schematic_text",
      schematic_text_id: `num_ssop20_p${pinNumLeft}`,
      text: `${pinNumLeft}`,
      font_size: 0.18,
      position: { x: -BODY_WIDTH/2 - PIN_LENGTH - 0.1, y: y + 0.15 },
      rotation: 0,
      anchor: "bottom_right",
      color: "rgb(169, 0, 0)"
    });
    
    // Right side pin
    const srcPortIdR = `src_ssop20_p${pinNumRight}`;
    const schPortIdR = `sch_ssop20_p${pinNumRight}`;
    
    circuitJson.push({
      type: "source_port",
      source_port_id: srcPortIdR,
      source_component_id: "src_ssop20",
      name: `${pinNumRight}`,
      pin_number: pinNumRight
    });
    circuitJson.push({
      type: "schematic_port",
      schematic_port_id: schPortIdR,
      source_port_id: srcPortIdR,
      schematic_component_id: "sch_ssop20",
      center: { x: BODY_WIDTH/2 + PIN_LENGTH, y: y },
      facing_direction: "right",
      pin_number: pinNumRight
    });
    circuitJson.push({
      type: "schematic_line",
      schematic_line_id: `line_ssop20_p${pinNumRight}`,
      schematic_component_id: "sch_ssop20",
      x1: BODY_WIDTH/2, y1: y, x2: BODY_WIDTH/2 + PIN_LENGTH, y2: y,
      color: "rgb(132, 0, 0)",
      is_dashed: false
    });
    // Pin label inside body
    circuitJson.push({
      type: "schematic_text",
      schematic_text_id: `label_ssop20_p${pinNumRight}`,
      text: `${pinNumRight}`,
      font_size: 0.22,
      position: { x: BODY_WIDTH/2 - 0.15, y: y },
      rotation: 0,
      anchor: "right",
      color: "rgb(0, 100, 100)"
    });
    // Pin number outside
    circuitJson.push({
      type: "schematic_text",
      schematic_text_id: `num_ssop20_p${pinNumRight}`,
      text: `${pinNumRight}`,
      font_size: 0.18,
      position: { x: BODY_WIDTH/2 + PIN_LENGTH + 0.1, y: y + 0.15 },
      rotation: 0,
      anchor: "bottom_left",
      color: "rgb(169, 0, 0)"
    });
  }
  
  return circuitJson;
}

function generateStm32f030f4p6() {
  const pinsLeft = [
    { num: 1,  name: "BOOT0" },
    { num: 2,  name: "PF0/OSC_IN" },
    { num: 3,  name: "PF1/OSC_OUT" },
    { num: 4,  name: "NRST" },
    { num: 5,  name: "VDDA" },
    { num: 6,  name: "PA0" },
    { num: 7,  name: "PA1" },
    { num: 8,  name: "PA2" },
    { num: 9,  name: "PA3" },
    { num: 10, name: "PA4" }
  ];
  const pinsRight = [
    { num: 11, name: "PA5" },
    { num: 12, name: "PA6" },
    { num: 13, name: "PA7" },
    { num: 14, name: "PB1" },
    { num: 15, name: "VSS" },
    { num: 16, name: "VDD" },
    { num: 17, name: "PA9" },
    { num: 18, name: "PA10" },
    { num: 19, name: "PA13" },
    { num: 20, name: "PA14" }
  ];
  
  const pinsPerSide = 10;
  const bodyHeight = pinsPerSide * BODY_HEIGHT_PER_PIN;
  const topY = (pinsPerSide - 1) * PIN_SPACING / 2;
  
  const circuitJson = [];
  
  circuitJson.push({
    type: "source_component",
    source_component_id: "src_stm32",
    name: "U?",
    ftype: "simple_chip"
  });
  
  circuitJson.push({
    type: "schematic_component",
    schematic_component_id: "sch_stm32",
    source_component_id: "src_stm32",
    center: { x: 0, y: 0 },
    size: { width: BODY_WIDTH, height: bodyHeight },
    rotation: 0,
    is_box_with_pins: false
  });
  
  circuitJson.push({
    type: "schematic_rect",
    schematic_rect_id: "rect_stm32",
    schematic_component_id: "sch_stm32",
    center: { x: 0, y: 0 },
    width: BODY_WIDTH,
    height: bodyHeight,
    rotation: 0,
    color: "rgb(132, 0, 0)",
    is_filled: true,
    fill_color: "rgb(255, 255, 194)",
    is_dashed: false
  });
  
  // Name text
  circuitJson.push({
    type: "schematic_text",
    schematic_text_id: "text_stm32_name",
    text: "STM32F030F4P6",
    font_size: 0.35,
    position: { x: 0, y: topY + 0.5 },
    rotation: 0,
    anchor: "bottom",
    color: "rgb(0, 100, 100)"
  });
  
  // Notch (pin 1 indicator)
  circuitJson.push({
    type: "schematic_circle",
    schematic_circle_id: "notch_stm32",
    schematic_component_id: "sch_stm32",
    center: { x: -BODY_WIDTH/2 + 0.3, y: topY - 0.3 },
    radius: 0.15,
    color: "rgb(132, 0, 0)",
    is_filled: true,
    fill_color: "rgb(132, 0, 0)",
    is_dashed: false
  });
  
  // Left pins
  for (let i = 0; i < pinsLeft.length; i++) {
    const pin = pinsLeft[i];
    const y = topY - i * PIN_SPACING;
    const srcPortId = `src_stm32_p${pin.num}`;
    const schPortId = `sch_stm32_p${pin.num}`;
    
    circuitJson.push({
      type: "source_port",
      source_port_id: srcPortId,
      source_component_id: "src_stm32",
      name: pin.name,
      pin_number: pin.num
    });
    circuitJson.push({
      type: "schematic_port",
      schematic_port_id: schPortId,
      source_port_id: srcPortId,
      schematic_component_id: "sch_stm32",
      center: { x: -BODY_WIDTH/2 - PIN_LENGTH, y: y },
      facing_direction: "left",
      pin_number: pin.num
    });
    circuitJson.push({
      type: "schematic_line",
      schematic_line_id: `line_stm32_p${pin.num}`,
      schematic_component_id: "sch_stm32",
      x1: -BODY_WIDTH/2, y1: y, x2: -BODY_WIDTH/2 - PIN_LENGTH, y2: y,
      color: "rgb(132, 0, 0)",
      is_dashed: false
    });
    // Shorten label if too long
    const label = pin.name.length > 10 ? pin.name.substring(0, 9) + "…" : pin.name;
    circuitJson.push({
      type: "schematic_text",
      schematic_text_id: `label_stm32_p${pin.num}`,
      text: label,
      font_size: 0.22,
      position: { x: -BODY_WIDTH/2 + 0.15, y: y },
      rotation: 0,
      anchor: "left",
      color: "rgb(0, 100, 100)"
    });
    circuitJson.push({
      type: "schematic_text",
      schematic_text_id: `num_stm32_p${pin.num}`,
      text: `${pin.num}`,
      font_size: 0.18,
      position: { x: -BODY_WIDTH/2 - PIN_LENGTH - 0.1, y: y + 0.15 },
      rotation: 0,
      anchor: "bottom_right",
      color: "rgb(169, 0, 0)"
    });
  }
  
  // Right pins
  for (let i = 0; i < pinsRight.length; i++) {
    const pin = pinsRight[i];
    const y = topY - i * PIN_SPACING;
    const srcPortId = `src_stm32_p${pin.num}`;
    const schPortId = `sch_stm32_p${pin.num}`;
    
    circuitJson.push({
      type: "source_port",
      source_port_id: srcPortId,
      source_component_id: "src_stm32",
      name: pin.name,
      pin_number: pin.num
    });
    circuitJson.push({
      type: "schematic_port",
      schematic_port_id: schPortId,
      source_port_id: srcPortId,
      schematic_component_id: "sch_stm32",
      center: { x: BODY_WIDTH/2 + PIN_LENGTH, y: y },
      facing_direction: "right",
      pin_number: pin.num
    });
    circuitJson.push({
      type: "schematic_line",
      schematic_line_id: `line_stm32_p${pin.num}`,
      schematic_component_id: "sch_stm32",
      x1: BODY_WIDTH/2, y1: y, x2: BODY_WIDTH/2 + PIN_LENGTH, y2: y,
      color: "rgb(132, 0, 0)",
      is_dashed: false
    });
    const label = pin.name.length > 10 ? pin.name.substring(0, 9) + "…" : pin.name;
    circuitJson.push({
      type: "schematic_text",
      schematic_text_id: `label_stm32_p${pin.num}`,
      text: label,
      font_size: 0.22,
      position: { x: BODY_WIDTH/2 - 0.15, y: y },
      rotation: 0,
      anchor: "right",
      color: "rgb(0, 100, 100)"
    });
    circuitJson.push({
      type: "schematic_text",
      schematic_text_id: `num_stm32_p${pin.num}`,
      text: `${pin.num}`,
      font_size: 0.18,
      position: { x: BODY_WIDTH/2 + PIN_LENGTH + 0.1, y: y + 0.15 },
      rotation: 0,
      anchor: "bottom_left",
      color: "rgb(169, 0, 0)"
    });
  }
  
  return circuitJson;
}

// Generate both
const ssop20Json = generateSsop20();
const stm32Json = generateStm32f030f4p6();

fs.mkdirSync("generated/symbols", { recursive: true });

fs.writeFileSync("generated/symbols/ssop20_symbol.json", JSON.stringify(ssop20Json, null, 2));
fs.writeFileSync("generated/symbols/stm32f030f4p6_symbol.json", JSON.stringify(stm32Json, null, 2));

const ssop20Svg = circuitJsonToSchematicSvg(ssop20Json, { width: 500, height: 700 });
const stm32Svg = circuitJsonToSchematicSvg(stm32Json, { width: 600, height: 700 });

fs.writeFileSync("generated/symbols/ssop20_symbol.svg", ssop20Svg);
fs.writeFileSync("generated/symbols/stm32f030f4p6_symbol.svg", stm32Svg);

console.log("Generated:");
console.log("  - generated/symbols/ssop20_symbol.json");
console.log("  - generated/symbols/ssop20_symbol.svg");
console.log("  - generated/symbols/stm32f030f4p6_symbol.json");
console.log("  - generated/symbols/stm32f030f4p6_symbol.svg");
