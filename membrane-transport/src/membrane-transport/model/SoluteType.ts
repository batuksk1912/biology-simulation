import { Enumeration, EnumerationValue } from "scenerystack/phet-core";

export type TransportMode = "simple" | "facilitated";

/**
 * Enumeration of solutes in the membrane transport model.
 */
export default class SoluteType extends EnumerationValue {
  public static readonly OXYGEN = new SoluteType("oxygen", "simple", 0);
  public static readonly CARBON_DIOXIDE = new SoluteType(
    "carbonDioxide",
    "simple",
    0,
  );
  public static readonly SODIUM = new SoluteType("sodium", "facilitated", 1);
  public static readonly POTASSIUM = new SoluteType(
    "potassium",
    "facilitated",
    1,
  );
  public static readonly GLUCOSE = new SoluteType("glucose", "facilitated", 0);

  public static readonly enumeration = new Enumeration(SoluteType);

  public readonly key: string;
  public readonly transportMode: TransportMode;
  public readonly charge: number;

  public constructor(
    key: string,
    transportMode: TransportMode,
    charge: number,
  ) {
    super();
    this.key = key;
    this.transportMode = transportMode;
    this.charge = charge;
  }

  public get isIon(): boolean {
    return this === SoluteType.SODIUM || this === SoluteType.POTASSIUM;
  }

  public static readonly VALUES = [
    SoluteType.OXYGEN,
    SoluteType.CARBON_DIOXIDE,
    SoluteType.SODIUM,
    SoluteType.POTASSIUM,
    SoluteType.GLUCOSE,
  ] as const;
}
