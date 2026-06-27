import { Vector2 } from "scenerystack/dot";
import SoluteType from "./SoluteType.js";

export type Compartment = "outside" | "inside";

/**
 * A single molecule or ion tracked by the model.
 */
export default class Particle {
  private static nextId = 1;

  public readonly id: number;
  public readonly type: SoluteType;
  public readonly position: Vector2;
  public readonly velocity: Vector2;
  public compartment: Compartment;

  public constructor(
    type: SoluteType,
    position: Vector2,
    velocity: Vector2,
    compartment: Compartment,
  ) {
    this.id = Particle.nextId;
    Particle.nextId += 1;
    this.type = type;
    this.position = position;
    this.velocity = velocity;
    this.compartment = compartment;
  }
}
