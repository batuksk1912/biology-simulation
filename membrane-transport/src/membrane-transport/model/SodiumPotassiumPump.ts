import { BooleanProperty } from "scenerystack/axon";
import MembraneProtein from "./MembraneProtein.js";

/**
 * Active transporter that exports 3 Na+ and imports 2 K+ per ATP cycle.
 */
export default class SodiumPotassiumPump extends MembraneProtein {
  public readonly atpAvailableProperty: BooleanProperty;
  public cycleAccumulator = 0;

  public constructor(xPosition: number) {
    super("sodiumPotassiumPump", xPosition, true);
    this.atpAvailableProperty = new BooleanProperty(true);
  }

  public supportsSolute(): boolean {
    return false;
  }

  public get isActive(): boolean {
    return this.openProperty.value && this.atpAvailableProperty.value;
  }

  public override reset(): void {
    this.cycleAccumulator = 0;
    this.atpAvailableProperty.reset();
    super.reset();
  }

  public override dispose(): void {
    this.atpAvailableProperty.dispose();
    super.dispose();
  }
}
