import { DerivedProperty } from "scenerystack/axon";
import { Node, Rectangle, Text } from "scenerystack/scenery";
import MembraneTransportColors from "../MembraneTransportColors.js";
import MembraneTransportStrings from "../MembraneTransportStrings.js";
import MembraneTransportModel from "../model/MembraneTransportModel.js";

/**
 * Numeric membrane-potential readout bound to the model's derived property.
 */
export default class MembranePotentialMeterNode extends Node {
  private readonly potentialStringProperty: DerivedProperty<
    string,
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
    never,
    never,
    never,
    never
  >;

  public constructor(model: MembraneTransportModel) {
    super({
      tagName: "section",
      accessibleHeading: MembraneTransportStrings.potentialStringProperty,
    });
    this.addChild(
      new Rectangle(0, 0, 260, 64, 8, 8, {
        fill: "#ffffff",
        stroke: MembraneTransportColors.panelStrokeProperty.value,
      }),
    );
    this.addChild(
      new Text(MembraneTransportStrings.potentialStringProperty, {
        font: "15px sans-serif",
        fill: "#1f2933",
        left: 12,
        top: 9,
      }),
    );

    this.potentialStringProperty = new DerivedProperty(
      [model.membranePotentialProperty],
      (potential) =>
        `${potential.toFixed(0)} ${MembraneTransportStrings.millivoltStringProperty.value}`,
    );

    this.addChild(
      new Text(this.potentialStringProperty, {
        font: "26px sans-serif",
        fill: "#0f4c81",
        right: 240,
        centerY: 39,
      }),
    );
  }

  public override dispose(): void {
    this.potentialStringProperty.dispose();
    super.dispose();
  }
}
