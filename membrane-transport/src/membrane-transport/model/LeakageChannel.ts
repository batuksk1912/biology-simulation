import SoluteType from "./SoluteType.js";
import MembraneProtein from "./MembraneProtein.js";

/**
 * Passive channel used by facilitated solutes while it is open.
 */
export default class LeakageChannel extends MembraneProtein {
  public constructor(xPosition: number) {
    super("leakage", xPosition, true);
  }

  public supportsSolute(soluteType: SoluteType): boolean {
    return soluteType.transportMode === "facilitated";
  }
}
