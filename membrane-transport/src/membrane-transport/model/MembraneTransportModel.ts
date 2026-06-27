import {
  BooleanProperty,
  createObservableArray,
  DerivedProperty,
  Emitter,
  EnumerationProperty,
  NumberProperty,
  type ObservableArray,
} from "scenerystack/axon";
import { dotRandom, Vector2 } from "scenerystack/dot";
import { TimeSpeed } from "scenerystack/scenery-phet";
import MembraneTransportConstants from "../MembraneTransportConstants.js";
import Particle, { type Compartment } from "./Particle.js";
import SoluteType from "./SoluteType.js";
import MembraneProtein from "./MembraneProtein.js";
import LeakageChannel from "./LeakageChannel.js";
import LigandGatedChannel from "./LigandGatedChannel.js";
import SodiumPotassiumPump from "./SodiumPotassiumPump.js";
import VoltageGatedChannel from "./VoltageGatedChannel.js";

type CountProperties = {
  insideCountProperty: NumberProperty;
  outsideCountProperty: NumberProperty;
  presentProperty: BooleanProperty;
};

/**
 * Owns all membrane transport state and rules. View code observes this model but does not own state.
 */
export default class MembraneTransportModel {
  public readonly isPlayingProperty = new BooleanProperty(true);
  public readonly atpAvailableProperty = new BooleanProperty(true);
  public readonly ligandBoundProperty = new BooleanProperty(false);
  public readonly timeSpeedProperty = new EnumerationProperty(
    TimeSpeed.NORMAL,
    {
      enumeration: TimeSpeed.enumeration,
    },
  );
  public readonly particles: ObservableArray<Particle> =
    createObservableArray();
  public readonly proteins: ObservableArray<MembraneProtein> =
    createObservableArray();
  public readonly crossingEmitter = new Emitter<[Particle]>();
  public readonly pumpCycleEmitter = new Emitter<[SodiumPotassiumPump]>();
  public readonly membranePotentialProperty: DerivedProperty<
    number,
    number,
    number,
    number,
    number,
    never,
    never,
    never,
    never,
    never,
    never,
    never,
    never,
    never,
    never,
    never
  >;

  private readonly countProperties = new Map<SoluteType, CountProperties>();
  private isUpdatingCountsInternally = false;

  public constructor() {
    SoluteType.VALUES.forEach((soluteType) => {
      const countProperties = {
        insideCountProperty: new NumberProperty(0),
        outsideCountProperty: new NumberProperty(0),
        presentProperty: new BooleanProperty(true),
      };
      this.countProperties.set(soluteType, countProperties);

      countProperties.insideCountProperty.lazyLink((count) => {
        this.syncParticlesToCount(soluteType, "inside", count);
      });
      countProperties.outsideCountProperty.lazyLink((count) => {
        this.syncParticlesToCount(soluteType, "outside", count);
      });
      countProperties.presentProperty.lazyLink((present) => {
        if (present) {
          this.applyRestingCount(soluteType);
        } else {
          this.setCompartmentCount(soluteType, "inside", 0);
          this.setCompartmentCount(soluteType, "outside", 0);
        }
      });
    });

    const sodiumCounts = this.getCountProperties(SoluteType.SODIUM);
    const potassiumCounts = this.getCountProperties(SoluteType.POTASSIUM);
    this.membranePotentialProperty = new DerivedProperty(
      [
        sodiumCounts.insideCountProperty,
        sodiumCounts.outsideCountProperty,
        potassiumCounts.insideCountProperty,
        potassiumCounts.outsideCountProperty,
      ],
      (sodiumInside, sodiumOutside, potassiumInside, potassiumOutside) => {
        const sodiumGradient = sodiumOutside - sodiumInside;
        const potassiumGradient = potassiumInside - potassiumOutside;
        return Math.max(
          -110,
          Math.min(60, -1.75 * sodiumGradient - 1.3 * potassiumGradient),
        );
      },
    );

    this.applyRestingPotentialPreset();
  }

  public getCountProperties(soluteType: SoluteType): CountProperties {
    const countProperties = this.countProperties.get(soluteType);
    if (!countProperties) {
      throw new Error(`Missing count properties for ${soluteType.key}`);
    }
    return countProperties;
  }

  public createProtein(
    kind: MembraneProtein["kind"],
    xPosition: number,
  ): MembraneProtein {
    if (kind === "leakage") {
      return new LeakageChannel(xPosition);
    }
    if (kind === "voltageGated") {
      return new VoltageGatedChannel(xPosition);
    }
    if (kind === "ligandGated") {
      return new LigandGatedChannel(xPosition);
    }
    return new SodiumPotassiumPump(xPosition);
  }

  public addProtein(protein: MembraneProtein): void {
    if (!this.proteins.includes(protein)) {
      this.proteins.add(protein);
    }
  }

  public removeProtein(protein: MembraneProtein): void {
    if (this.proteins.includes(protein)) {
      this.proteins.remove(protein);
      protein.dispose();
    }
  }

  public addDefaultPump(): void {
    this.addProtein(new SodiumPotassiumPump(55));
  }

  public applyRestingPotentialPreset(): void {
    this.isUpdatingCountsInternally = true;
    this.particles.clear();
    SoluteType.VALUES.forEach((soluteType) => {
      const countProperties = this.getCountProperties(soluteType);
      countProperties.presentProperty.value = true;
      countProperties.insideCountProperty.value = 0;
      countProperties.outsideCountProperty.value = 0;
    });
    this.isUpdatingCountsInternally = false;

    SoluteType.VALUES.forEach((soluteType) => {
      this.applyRestingCount(soluteType);
    });

    this.proteins.getArrayCopy().forEach((protein) => {
      this.removeProtein(protein);
    });
    this.addDefaultPump();
  }

  public setCompartmentCount(
    soluteType: SoluteType,
    compartment: Compartment,
    count: number,
  ): void {
    const boundedCount = Math.max(
      0,
      Math.min(
        MembraneTransportConstants.MAX_COMPARTMENT_COUNT,
        Math.round(count),
      ),
    );
    const property =
      compartment === "inside"
        ? this.getCountProperties(soluteType).insideCountProperty
        : this.getCountProperties(soluteType).outsideCountProperty;
    property.value = boundedCount;
  }

  public reset(): void {
    this.isPlayingProperty.reset();
    this.atpAvailableProperty.reset();
    this.ligandBoundProperty.reset();
    this.timeSpeedProperty.reset();
    this.applyRestingPotentialPreset();
  }

  public step(dt: number): void {
    if (!this.isPlayingProperty.value) {
      return;
    }

    const scaledDt = dt * this.getSpeedMultiplier();
    this.updateVoltageGatedChannels();
    this.stepParticles(scaledDt);
    this.stepPumps(scaledDt);
  }

  private getSpeedMultiplier(): number {
    if (this.timeSpeedProperty.value === TimeSpeed.SLOW) {
      return 0.45;
    }
    if (this.timeSpeedProperty.value === TimeSpeed.FAST) {
      return 2.2;
    }
    return 1;
  }

  private applyRestingCount(soluteType: SoluteType): void {
    const restingCount =
      MembraneTransportConstants.RESTING_COUNTS[
        soluteType.key as keyof typeof MembraneTransportConstants.RESTING_COUNTS
      ];
    this.setCompartmentCount(soluteType, "outside", restingCount.outside);
    this.setCompartmentCount(soluteType, "inside", restingCount.inside);
  }

  private syncParticlesToCount(
    soluteType: SoluteType,
    compartment: Compartment,
    count: number,
  ): void {
    if (this.isUpdatingCountsInternally) {
      return;
    }

    const roundedCount = Math.max(0, Math.round(count));
    const matchingParticles = this.particles.filter(
      (particle) =>
        particle.type === soluteType && particle.compartment === compartment,
    );
    const delta = roundedCount - matchingParticles.length;

    if (delta > 0) {
      this.addParticles(soluteType, compartment, delta);
    } else if (delta < 0) {
      matchingParticles.slice(0, -delta).forEach((particle) => {
        this.particles.remove(particle);
      });
    }
  }

  private addParticles(
    soluteType: SoluteType,
    compartment: Compartment,
    count: number,
  ): void {
    for (let index = 0; index < count; index += 1) {
      if (
        this.particles.length >= MembraneTransportConstants.MAX_TOTAL_PARTICLES
      ) {
        return;
      }
      this.particles.add(
        new Particle(
          soluteType,
          this.randomPosition(compartment),
          new Vector2(
            dotRandom.nextDoubleBetween(-6, 6),
            dotRandom.nextDoubleBetween(-6, 6),
          ),
          compartment,
        ),
      );
    }
  }

  private randomPosition(compartment: Compartment): Vector2 {
    const bounds = MembraneTransportConstants.MODEL_BOUNDS;
    const membraneHalfThickness =
      MembraneTransportConstants.MEMBRANE_HALF_THICKNESS;
    const y =
      compartment === "outside"
        ? dotRandom.nextDoubleBetween(
            bounds.minY + 4,
            -membraneHalfThickness - 3,
          )
        : dotRandom.nextDoubleBetween(
            membraneHalfThickness + 3,
            bounds.maxY - 4,
          );
    return new Vector2(
      dotRandom.nextDoubleBetween(bounds.minX + 4, bounds.maxX - 4),
      y,
    );
  }

  private stepParticles(dt: number): void {
    this.particles.getArrayCopy().forEach((particle) => {
      const oldY = particle.position.y;
      particle.velocity.x =
        (particle.velocity.x +
          dotRandom.nextDoubleBetween(
            -MembraneTransportConstants.BROWNIAN_ACCELERATION,
            MembraneTransportConstants.BROWNIAN_ACCELERATION,
          ) *
            dt) *
        MembraneTransportConstants.VELOCITY_DAMPING;
      particle.velocity.y =
        (particle.velocity.y +
          dotRandom.nextDoubleBetween(
            -MembraneTransportConstants.BROWNIAN_ACCELERATION,
            MembraneTransportConstants.BROWNIAN_ACCELERATION,
          ) *
            dt) *
        MembraneTransportConstants.VELOCITY_DAMPING;

      this.applyGradientDrift(particle, dt);

      particle.position.x += particle.velocity.x * dt;
      particle.position.y += particle.velocity.y * dt;
      this.reflectAtWalls(particle);
      this.handleMembraneEncounter(particle, oldY);
    });
  }

  private applyGradientDrift(particle: Particle, dt: number): void {
    const sourceCount = this.getCount(particle.type, particle.compartment);
    const targetCompartment = this.otherCompartment(particle.compartment);
    const targetCount = this.getCount(particle.type, targetCompartment);
    if (sourceCount <= targetCount) {
      return;
    }

    const directionToMembrane = particle.compartment === "outside" ? 1 : -1;
    const gradientScale = Math.min(1, (sourceCount - targetCount) / 25);
    particle.velocity.y += directionToMembrane * gradientScale * 10 * dt;
  }

  private reflectAtWalls(particle: Particle): void {
    const bounds = MembraneTransportConstants.MODEL_BOUNDS;
    if (particle.position.x < bounds.minX) {
      particle.position.x = bounds.minX;
      particle.velocity.x = Math.abs(particle.velocity.x);
    } else if (particle.position.x > bounds.maxX) {
      particle.position.x = bounds.maxX;
      particle.velocity.x = -Math.abs(particle.velocity.x);
    }

    if (particle.position.y < bounds.minY) {
      particle.position.y = bounds.minY;
      particle.velocity.y = Math.abs(particle.velocity.y);
    } else if (particle.position.y > bounds.maxY) {
      particle.position.y = bounds.maxY;
      particle.velocity.y = -Math.abs(particle.velocity.y);
    }
  }

  private handleMembraneEncounter(particle: Particle, oldY: number): void {
    const halfThickness = MembraneTransportConstants.MEMBRANE_HALF_THICKNESS;
    if (Math.abs(particle.position.y) < halfThickness) {
      const enteredFromOutside = oldY < -halfThickness;
      const enteredFromInside = oldY > halfThickness;
      if (!enteredFromOutside && !enteredFromInside) {
        return;
      }

      if (this.canCrossMembrane(particle)) {
        this.crossParticle(particle);
      } else {
        particle.position.y =
          particle.compartment === "outside"
            ? -halfThickness - MembraneTransportConstants.PARTICLE_RADIUS
            : halfThickness + MembraneTransportConstants.PARTICLE_RADIUS;
        particle.velocity.y *= -0.75;
      }
    }
  }

  private canCrossMembrane(particle: Particle): boolean {
    const targetCompartment = this.otherCompartment(particle.compartment);
    const sourceCount = this.getCount(particle.type, particle.compartment);
    const targetCount = this.getCount(particle.type, targetCompartment);
    if (sourceCount <= targetCount) {
      return false;
    }

    if (particle.type.transportMode === "facilitated") {
      const openProtein = this.findOpenCompatibleProtein(particle);
      if (!openProtein) {
        return false;
      }
    }

    const gradientBias = Math.min(1, (sourceCount - targetCount) / 20);
    return (
      dotRandom.nextDouble() <
      MembraneTransportConstants.BASE_PASSIVE_CROSSING_PROBABILITY *
        gradientBias
    );
  }

  private findOpenCompatibleProtein(
    particle: Particle,
  ): MembraneProtein | null {
    return (
      this.proteins.find((protein) => {
        return (
          protein.openProperty.value &&
          protein.supportsSolute(particle.type) &&
          Math.abs(protein.xPositionProperty.value - particle.position.x) <
            MembraneTransportConstants.PROTEIN_CAPTURE_RANGE
        );
      }) ?? null
    );
  }

  private crossParticle(particle: Particle): void {
    const sourceCompartment = particle.compartment;
    const targetCompartment = this.otherCompartment(sourceCompartment);
    this.incrementCount(particle.type, sourceCompartment, -1);
    this.incrementCount(particle.type, targetCompartment, 1);
    particle.compartment = targetCompartment;
    particle.position.y =
      targetCompartment === "outside"
        ? -MembraneTransportConstants.MEMBRANE_HALF_THICKNESS -
          MembraneTransportConstants.PARTICLE_RADIUS
        : MembraneTransportConstants.MEMBRANE_HALF_THICKNESS +
          MembraneTransportConstants.PARTICLE_RADIUS;
    particle.velocity.y *= -0.45;
    this.crossingEmitter.emit(particle);
  }

  private stepPumps(dt: number): void {
    this.proteins.getArrayCopy().forEach((protein) => {
      if (
        !(protein instanceof SodiumPotassiumPump) ||
        !protein.isActive ||
        !this.atpAvailableProperty.value
      ) {
        return;
      }

      protein.cycleAccumulator += dt;
      if (protein.cycleAccumulator < MembraneTransportConstants.PUMP_PERIOD) {
        return;
      }

      protein.cycleAccumulator = 0;
      if (
        this.getCount(SoluteType.SODIUM, "inside") >= 3 &&
        this.getCount(SoluteType.POTASSIUM, "outside") >= 2
      ) {
        this.moveParticles(SoluteType.SODIUM, "inside", "outside", 3);
        this.moveParticles(SoluteType.POTASSIUM, "outside", "inside", 2);
        this.pumpCycleEmitter.emit(protein);
      }
    });
  }

  private moveParticles(
    soluteType: SoluteType,
    sourceCompartment: Compartment,
    targetCompartment: Compartment,
    count: number,
  ): void {
    const matchingParticles = this.particles.filter(
      (particle) =>
        particle.type === soluteType &&
        particle.compartment === sourceCompartment,
    );
    matchingParticles.slice(0, count).forEach((particle) => {
      this.incrementCount(soluteType, sourceCompartment, -1);
      this.incrementCount(soluteType, targetCompartment, 1);
      particle.compartment = targetCompartment;
      particle.position.x += dotRandom.nextDoubleBetween(-2, 2);
      particle.position.y =
        targetCompartment === "outside"
          ? -MembraneTransportConstants.MEMBRANE_HALF_THICKNESS - 4
          : MembraneTransportConstants.MEMBRANE_HALF_THICKNESS + 4;
      particle.velocity.y = targetCompartment === "outside" ? -5 : 5;
    });
  }

  private updateVoltageGatedChannels(): void {
    this.proteins.getArrayCopy().forEach((protein) => {
      if (protein instanceof VoltageGatedChannel) {
        protein.updateFromPotential(this.membranePotentialProperty.value);
      } else if (protein instanceof LigandGatedChannel) {
        protein.ligandBoundProperty.value = this.ligandBoundProperty.value;
      }
    });
  }

  private incrementCount(
    soluteType: SoluteType,
    compartment: Compartment,
    delta: number,
  ): void {
    const property =
      compartment === "inside"
        ? this.getCountProperties(soluteType).insideCountProperty
        : this.getCountProperties(soluteType).outsideCountProperty;
    this.isUpdatingCountsInternally = true;
    property.value = Math.max(0, property.value + delta);
    this.isUpdatingCountsInternally = false;
  }

  private getCount(soluteType: SoluteType, compartment: Compartment): number {
    const countProperties = this.getCountProperties(soluteType);
    return compartment === "inside"
      ? countProperties.insideCountProperty.value
      : countProperties.outsideCountProperty.value;
  }

  private otherCompartment(compartment: Compartment): Compartment {
    return compartment === "outside" ? "inside" : "outside";
  }
}
