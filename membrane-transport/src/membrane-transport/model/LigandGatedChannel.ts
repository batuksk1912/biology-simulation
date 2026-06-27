import { BooleanProperty } from "scenerystack/axon";
import SoluteType from "./SoluteType.js";
import MembraneProtein from "./MembraneProtein.js";

/**
 * Ion channel that opens while the ligand-bound property is true.
 */
export default class LigandGatedChannel extends MembraneProtein {
  public readonly ligandBoundProperty: BooleanProperty;

  public constructor(xPosition: number) {
    super("ligandGated", xPosition, false);
    this.ligandBoundProperty = new BooleanProperty(false);
    this.ligandBoundProperty.link((bound) => {
      this.openProperty.value = bound;
    });
  }

  public supportsSolute(soluteType: SoluteType): boolean {
    return (
      soluteType === SoluteType.SODIUM || soluteType === SoluteType.POTASSIUM
    );
  }

  public override reset(): void {
    this.ligandBoundProperty.reset();
    super.reset();
  }

  public override dispose(): void {
    this.ligandBoundProperty.dispose();
    super.dispose();
  }
}
