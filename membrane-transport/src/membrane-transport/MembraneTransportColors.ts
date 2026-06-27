import { Color, ColorProperty } from "scenerystack/scenery";

/**
 * Observable colors used by the view so projector-mode or theme changes can be applied centrally.
 */
const MembraneTransportColors = {
  extracellularFluidProperty: new ColorProperty(new Color(224, 244, 255)),
  cytosolProperty: new ColorProperty(new Color(232, 247, 232)),
  membraneHeadProperty: new ColorProperty(new Color(255, 216, 120)),
  membraneTailProperty: new ColorProperty(new Color(123, 91, 61)),
  membraneCoreProperty: new ColorProperty(new Color(255, 241, 185)),
  oxygenProperty: new ColorProperty(new Color(67, 159, 214)),
  carbonDioxideProperty: new ColorProperty(new Color(99, 116, 129)),
  sodiumProperty: new ColorProperty(new Color(232, 91, 84)),
  potassiumProperty: new ColorProperty(new Color(124, 103, 210)),
  glucoseProperty: new ColorProperty(new Color(41, 168, 130)),
  channelProperty: new ColorProperty(new Color(57, 104, 142)),
  pumpProperty: new ColorProperty(new Color(196, 123, 50)),
  closedProteinProperty: new ColorProperty(new Color(116, 122, 130)),
  panelStrokeProperty: new ColorProperty(new Color(74, 86, 98)),
};

export default MembraneTransportColors;
