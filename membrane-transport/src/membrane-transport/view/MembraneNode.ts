import { Bounds2 } from "scenerystack/dot";
import {
  Circle,
  LinearGradient,
  Line,
  Node,
  Rectangle,
} from "scenerystack/scenery";
import MembraneTransportColors from "../MembraneTransportColors.js";
import MembraneTransportStrings from "../MembraneTransportStrings.js";

/**
 * Draws the phospholipid bilayer across the observation window.
 */
export default class MembraneNode extends Node {
  public constructor(
    viewBounds: Bounds2,
    membraneY: number,
    thickness: number,
  ) {
    super({
      pickable: false,
      accessibleName: MembraneTransportStrings.membraneStringProperty,
    });

    const coreGradient = new LinearGradient(
      0,
      membraneY - thickness / 2,
      0,
      membraneY + thickness / 2,
    )
      .addColorStop(0, MembraneTransportColors.membraneHeadProperty.value)
      .addColorStop(0.5, MembraneTransportColors.membraneCoreProperty.value)
      .addColorStop(1, MembraneTransportColors.membraneHeadProperty.value);

    this.addChild(
      new Rectangle(
        viewBounds.minX,
        membraneY - thickness / 2,
        viewBounds.width,
        thickness,
        {
          fill: coreGradient,
          stroke: "#9f7b43",
          lineWidth: 1,
        },
      ),
    );

    const lipidSpacing = 20;
    const headRadius = 5;
    for (
      let x = viewBounds.minX + lipidSpacing / 2;
      x < viewBounds.maxX;
      x += lipidSpacing
    ) {
      const topHeadY = membraneY - thickness / 2 + headRadius;
      const bottomHeadY = membraneY + thickness / 2 - headRadius;
      this.addChild(
        new Circle(headRadius, {
          centerX: x,
          centerY: topHeadY,
          fill: MembraneTransportColors.membraneHeadProperty.value,
          stroke: "#946f32",
        }),
      );
      this.addChild(
        new Circle(headRadius, {
          centerX: x,
          centerY: bottomHeadY,
          fill: MembraneTransportColors.membraneHeadProperty.value,
          stroke: "#946f32",
        }),
      );
      this.addChild(
        new Line(x - 2.5, topHeadY + 5, x - 2.5, membraneY - 1, {
          stroke: MembraneTransportColors.membraneTailProperty.value,
          lineWidth: 1.5,
        }),
      );
      this.addChild(
        new Line(x + 2.5, topHeadY + 5, x + 2.5, membraneY - 1, {
          stroke: MembraneTransportColors.membraneTailProperty.value,
          lineWidth: 1.5,
        }),
      );
      this.addChild(
        new Line(x - 2.5, bottomHeadY - 5, x - 2.5, membraneY + 1, {
          stroke: MembraneTransportColors.membraneTailProperty.value,
          lineWidth: 1.5,
        }),
      );
      this.addChild(
        new Line(x + 2.5, bottomHeadY - 5, x + 2.5, membraneY + 1, {
          stroke: MembraneTransportColors.membraneTailProperty.value,
          lineWidth: 1.5,
        }),
      );
    }
  }
}
