import SoluteType from "./SoluteType.js";
import MembraneProtein from "./MembraneProtein.js";

/**
 * Ion channel whose open state is updated from membrane potential.
 */
export default class VoltageGatedChannel extends MembraneProtein {
  public constructor(xPosition: number) {
    super("voltageGated", xPosition, false);
  }

  public supportsSolute(soluteType: SoluteType): boolean {
    return (
      soluteType === SoluteType.SODIUM || soluteType === SoluteType.POTASSIUM
    );
  }

  public updateFromPotential(membranePotentialMillivolts: number): void {
    this.openProperty.value = membranePotentialMillivolts > -45;
  }
}
