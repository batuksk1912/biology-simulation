import { Bounds2 } from "scenerystack/dot";

/**
 * Shared model constants and layout values for the membrane transport screen.
 */
const MembraneTransportConstants = {
  SCREEN_WIDTH: 1100,
  SCREEN_HEIGHT: 700,
  MODEL_BOUNDS: new Bounds2(0, -50, 100, 50),
  MEMBRANE_HALF_THICKNESS: 5,
  PARTICLE_RADIUS: 1.7,
  PROTEIN_CAPTURE_RANGE: 7,
  PROTEIN_DROP_Y_RANGE: 13,
  MAX_COMPARTMENT_COUNT: 45,
  MAX_TOTAL_PARTICLES: 180,
  BROWNIAN_ACCELERATION: 30,
  VELOCITY_DAMPING: 0.92,
  BASE_PASSIVE_CROSSING_PROBABILITY: 0.55,
  PUMP_PERIOD: 1.25,
  RESTING_COUNTS: {
    oxygen: { outside: 18, inside: 7 },
    carbonDioxide: { outside: 6, inside: 17 },
    sodium: { outside: 29, inside: 6 },
    potassium: { outside: 6, inside: 29 },
    glucose: { outside: 16, inside: 5 },
  },
};

export default MembraneTransportConstants;
