import { Node, Circle, Text, Path, Line } from "scenerystack/scenery";
import { Shape } from "scenerystack/kite";
import type { Color, ColorProperty } from "scenerystack/scenery";
import MembraneTransportColors from "../MembraneTransportColors.js";
import MembraneTransportStrings from "../MembraneTransportStrings.js";
import Particle from "../model/Particle.js";
import SoluteType from "../model/SoluteType.js";

/**
 * Shape- and color-coded visual representation of one model particle.
 */
export default class ParticleNode extends Node {
  private readonly colorProperty: ColorProperty;
  private readonly colorListener: (color: Color) => void;
  private readonly paintTargets: Array<Circle | Path>;

  public constructor(public readonly particle: Particle) {
    super({
      pickable: false,
      accessibleName: ParticleNode.getAccessibleName(particle.type),
    });

    this.paintTargets = [];
    this.colorProperty = ParticleNode.getColorProperty(particle.type);
    this.colorListener = (color) => {
      this.paintTargets.forEach((target) => {
        target.fill = color;
      });
    };

    this.createGlyph(particle.type);
    this.colorProperty.link(this.colorListener);
  }

  private createGlyph(soluteType: SoluteType): void {
    if (soluteType === SoluteType.OXYGEN) {
      const left = new Circle(4, { centerX: -3, stroke: "#1d4e6f" });
      const right = new Circle(4, { centerX: 3, stroke: "#1d4e6f" });
      this.paintTargets.push(left, right);
      this.addChild(left);
      this.addChild(right);
      return;
    }

    if (soluteType === SoluteType.CARBON_DIOXIDE) {
      const left = new Circle(3.5, { centerX: -5, stroke: "#38414b" });
      const center = new Circle(4.2, { stroke: "#38414b" });
      const right = new Circle(3.5, { centerX: 5, stroke: "#38414b" });
      this.paintTargets.push(left, center, right);
      this.addChild(left);
      this.addChild(center);
      this.addChild(right);
      return;
    }

    if (soluteType === SoluteType.GLUCOSE) {
      const hexagon = new Path(ParticleNode.createHexagonShape(6), {
        stroke: "#145f51",
        lineWidth: 1.4,
      });
      this.paintTargets.push(hexagon);
      this.addChild(hexagon);
      return;
    }

    const ionCircle = new Circle(6, {
      stroke: soluteType === SoluteType.SODIUM ? "#8a241f" : "#382a91",
      lineWidth: 1.4,
    });
    const label = new Text(
      soluteType === SoluteType.SODIUM
        ? MembraneTransportStrings.solutes.sodiumStringProperty
        : MembraneTransportStrings.solutes.potassiumStringProperty,
      {
        font: "8px sans-serif",
        fill: "white",
        center: ionCircle.center,
        pickable: false,
      },
    );
    this.paintTargets.push(ionCircle);
    this.addChild(ionCircle);
    this.addChild(label);
  }

  private static createHexagonShape(radius: number): Shape {
    const shape = new Shape();
    for (let index = 0; index < 6; index += 1) {
      const angle = (Math.PI / 3) * index + Math.PI / 6;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (index === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    return shape.close();
  }

  private static getColorProperty(soluteType: SoluteType): ColorProperty {
    if (soluteType === SoluteType.OXYGEN) {
      return MembraneTransportColors.oxygenProperty;
    }
    if (soluteType === SoluteType.CARBON_DIOXIDE) {
      return MembraneTransportColors.carbonDioxideProperty;
    }
    if (soluteType === SoluteType.SODIUM) {
      return MembraneTransportColors.sodiumProperty;
    }
    if (soluteType === SoluteType.POTASSIUM) {
      return MembraneTransportColors.potassiumProperty;
    }
    return MembraneTransportColors.glucoseProperty;
  }

  private static getAccessibleName(soluteType: SoluteType): string {
    if (soluteType === SoluteType.OXYGEN) {
      return MembraneTransportStrings.solutes.oxygenAccessibleStringProperty
        .value;
    }
    if (soluteType === SoluteType.CARBON_DIOXIDE) {
      return MembraneTransportStrings.solutes
        .carbonDioxideAccessibleStringProperty.value;
    }
    if (soluteType === SoluteType.SODIUM) {
      return MembraneTransportStrings.solutes.sodiumAccessibleStringProperty
        .value;
    }
    if (soluteType === SoluteType.POTASSIUM) {
      return MembraneTransportStrings.solutes.potassiumAccessibleStringProperty
        .value;
    }
    return MembraneTransportStrings.solutes.glucoseAccessibleStringProperty
      .value;
  }

  public addVelocityFlash(): void {
    this.addChild(
      new Line(-5, 0, 5, 0, {
        stroke: "#ffffff",
        lineWidth: 1,
        opacity: 0.75,
        pickable: false,
      }),
    );
  }

  public override dispose(): void {
    this.colorProperty.unlink(this.colorListener);
    super.dispose();
  }
}
