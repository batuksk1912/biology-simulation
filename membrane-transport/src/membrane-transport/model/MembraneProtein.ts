import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import SoluteType from "./SoluteType.js";

export type ProteinKind =
  "leakage" | "voltageGated" | "ligandGated" | "sodiumPotassiumPump";

/**
 * Base model object for membrane proteins positioned along the bilayer.
 */
export default abstract class MembraneProtein {
  private static nextId = 1;

  public readonly id: number;
  public readonly kind: ProteinKind;
  public readonly xPositionProperty: NumberProperty;
  public readonly openProperty: BooleanProperty;

  protected constructor(
    kind: ProteinKind,
    xPosition: number,
    initiallyOpen: boolean,
  ) {
    this.id = MembraneProtein.nextId;
    MembraneProtein.nextId += 1;
    this.kind = kind;
    this.xPositionProperty = new NumberProperty(xPosition);
    this.openProperty = new BooleanProperty(initiallyOpen);
  }

  public abstract supportsSolute(soluteType: SoluteType): boolean;

  public reset(): void {
    this.openProperty.reset();
    this.xPositionProperty.reset();
  }

  public dispose(): void {
    this.xPositionProperty.dispose();
    this.openProperty.dispose();
  }
}
