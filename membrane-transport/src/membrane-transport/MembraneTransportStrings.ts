import { StringProperty } from "scenerystack/axon";

/**
 * Central string properties for user-facing text. This keeps text observable and ready for localization.
 */
const MembraneTransportStrings = {
  titleStringProperty: new StringProperty("Membrane Transport"),
  screenNameStringProperty: new StringProperty("Membrane"),
  outsideStringProperty: new StringProperty("Extracellular"),
  insideStringProperty: new StringProperty("Cytosol"),
  membraneStringProperty: new StringProperty("Phospholipid bilayer"),
  toolboxStringProperty: new StringProperty("Transport proteins"),
  controlsStringProperty: new StringProperty("Controls"),
  concentrationsStringProperty: new StringProperty("Concentrations"),
  potentialStringProperty: new StringProperty("Membrane potential"),
  presentStringProperty: new StringProperty("Present"),
  outsideCountStringProperty: new StringProperty("Outside"),
  insideCountStringProperty: new StringProperty("Inside"),
  outsideShortStringProperty: new StringProperty("out"),
  insideShortStringProperty: new StringProperty("in"),
  millivoltStringProperty: new StringProperty("mV"),
  restingPresetStringProperty: new StringProperty("Resting potential"),
  addLigandStringProperty: new StringProperty("Add ligand"),
  removeLigandStringProperty: new StringProperty("Remove ligand"),
  atpStringProperty: new StringProperty("ATP available"),
  leakageChannelStringProperty: new StringProperty("Leakage channel"),
  voltageChannelStringProperty: new StringProperty("Voltage-gated channel"),
  ligandChannelStringProperty: new StringProperty("Ligand-gated channel"),
  sodiumPotassiumPumpStringProperty: new StringProperty("Na/K pump"),
  channelShortStringProperty: new StringProperty("CH"),
  voltageShortStringProperty: new StringProperty("V"),
  ligandShortStringProperty: new StringProperty("L"),
  pumpShortStringProperty: new StringProperty("ATP"),
  playAreaHelpStringProperty: new StringProperty(
    "Observe particles moving between extracellular fluid, membrane, and cytosol.",
  ),
  toolboxHelpStringProperty: new StringProperty(
    "Drag a protein to the membrane. Use arrow keys to move focused proteins.",
  ),
  stateDescriptionStringProperty: new StringProperty(
    "Particle counts and membrane potential update as transport occurs.",
  ),
  sodiumStateStringProperty: new StringProperty("Sodium"),
  potassiumStateStringProperty: new StringProperty("potassium"),
  isStateStringProperty: new StringProperty("is"),
  potentialStateStringProperty: new StringProperty("membrane potential is"),
  higherOutsideStringProperty: new StringProperty("higher outside"),
  higherInsideStringProperty: new StringProperty("higher inside"),
  balancedStringProperty: new StringProperty("balanced"),
  solutes: {
    oxygenStringProperty: new StringProperty("O2"),
    carbonDioxideStringProperty: new StringProperty("CO2"),
    sodiumStringProperty: new StringProperty("Na+"),
    potassiumStringProperty: new StringProperty("K+"),
    glucoseStringProperty: new StringProperty("Glucose"),
    oxygenAccessibleStringProperty: new StringProperty("oxygen molecule"),
    carbonDioxideAccessibleStringProperty: new StringProperty(
      "carbon dioxide molecule",
    ),
    sodiumAccessibleStringProperty: new StringProperty("sodium ion"),
    potassiumAccessibleStringProperty: new StringProperty("potassium ion"),
    glucoseAccessibleStringProperty: new StringProperty("glucose molecule"),
  },
};

export default MembraneTransportStrings;
