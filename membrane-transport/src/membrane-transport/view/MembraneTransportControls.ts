import { Multilink } from "scenerystack/axon";
import { Bounds2, Dimension2, Range } from "scenerystack/dot";
import { Checkbox, Slider, TextPushButton } from "scenerystack/sun";
import { Node, Rectangle, Text, VBox } from "scenerystack/scenery";
import MembraneTransportColors from "../MembraneTransportColors.js";
import MembraneTransportConstants from "../MembraneTransportConstants.js";
import MembraneTransportStrings from "../MembraneTransportStrings.js";
import MembraneTransportModel from "../model/MembraneTransportModel.js";
import SoluteType from "../model/SoluteType.js";

/**
 * Control panel for solute presence, counts, ATP, ligand, and scenario presets.
 */
export default class MembraneTransportControls extends Node {
  private readonly multilinks: Array<{ dispose: () => void }> = [];

  public constructor(model: MembraneTransportModel) {
    super({
      tagName: "section",
      accessibleHeading: MembraneTransportStrings.controlsStringProperty,
    });

    this.addChild(
      new Rectangle(0, 0, 220, 218, 8, 8, {
        fill: "#ffffff",
        stroke: MembraneTransportColors.panelStrokeProperty.value,
      }),
    );
    this.addChild(
      new Text(MembraneTransportStrings.controlsStringProperty, {
        font: "17px sans-serif",
        fill: "#1f2933",
        left: 12,
        top: 10,
      }),
    );

    const rowParent = new VBox({
      spacing: 3,
      left: 12,
      top: 40,
      children: SoluteType.VALUES.map((soluteType) =>
        this.createSoluteControlRow(model, soluteType),
      ),
    });
    this.addChild(rowParent);

    const atpCheckbox = new Checkbox(
      model.atpAvailableProperty,
      new Text(MembraneTransportStrings.atpStringProperty, {
        font: "12px sans-serif",
        fill: "#1f2933",
      }),
      {
        left: 12,
        top: 190,
        accessibleName: MembraneTransportStrings.atpStringProperty,
      },
    );
    this.addChild(atpCheckbox);

    const ligandCheckbox = new Checkbox(
      model.ligandBoundProperty,
      new Text(MembraneTransportStrings.addLigandStringProperty, {
        font: "12px sans-serif",
        fill: "#1f2933",
      }),
      {
        left: 118,
        top: 190,
        accessibleName: MembraneTransportStrings.addLigandStringProperty,
      },
    );
    this.addChild(ligandCheckbox);

    const presetButton = new TextPushButton(
      MembraneTransportStrings.restingPresetStringProperty,
      {
        listener: () => model.applyRestingPotentialPreset(),
        baseColor: "#e4eef8",
        textFill: "#1f2933",
        maxTextWidth: 94,
        minWidth: 110,
        minHeight: 24,
        left: 96,
        top: 8,
        accessibleName: MembraneTransportStrings.restingPresetStringProperty,
      },
    );
    this.addChild(presetButton);
  }

  private createSoluteControlRow(
    model: MembraneTransportModel,
    soluteType: SoluteType,
  ): Node {
    const countProperties = model.getCountProperties(soluteType);
    const row = new Node({ localBounds: new Bounds2(0, 0, 200, 27) });
    const checkbox = new Checkbox(
      countProperties.presentProperty,
      new Text(MembraneTransportControls.getSoluteLabel(soluteType), {
        font: "11px sans-serif",
        fill: "#1f2933",
        maxWidth: 52,
      }),
      {
        boxWidth: 13,
        spacing: 4,
        accessibleName: MembraneTransportControls.getSoluteLabel(soluteType),
      },
    );
    checkbox.left = 0;
    checkbox.centerY = 13.5;
    row.addChild(checkbox);

    const outsideSlider = new Slider(
      countProperties.outsideCountProperty,
      new Range(0, MembraneTransportConstants.MAX_COMPARTMENT_COUNT),
      {
        trackSize: new Dimension2(52, 4),
        thumbSize: new Dimension2(9, 13),
        left: 66,
        centerY: 7.5,
        accessibleName: `${MembraneTransportControls.getSoluteLabel(
          soluteType,
        )} ${MembraneTransportStrings.outsideCountStringProperty.value}`,
      },
    );
    row.addChild(outsideSlider);

    const insideSlider = new Slider(
      countProperties.insideCountProperty,
      new Range(0, MembraneTransportConstants.MAX_COMPARTMENT_COUNT),
      {
        trackSize: new Dimension2(52, 4),
        thumbSize: new Dimension2(9, 13),
        left: 66,
        centerY: 20.5,
        accessibleName: `${MembraneTransportControls.getSoluteLabel(
          soluteType,
        )} ${MembraneTransportStrings.insideCountStringProperty.value}`,
      },
    );
    row.addChild(insideSlider);

    const valueText = new Text("", {
      font: "10px sans-serif",
      fill: "#475569",
      left: 128,
      centerY: 14,
    });
    row.addChild(valueText);

    const multilink = Multilink.multilink(
      [
        countProperties.outsideCountProperty,
        countProperties.insideCountProperty,
      ],
      (outsideCount, insideCount) => {
        valueText.string = `${MembraneTransportStrings.outsideShortStringProperty.value} ${outsideCount} / ${MembraneTransportStrings.insideShortStringProperty.value} ${insideCount}`;
      },
    );
    this.multilinks.push(multilink);

    return row;
  }

  private static getSoluteLabel(soluteType: SoluteType): string {
    if (soluteType === SoluteType.OXYGEN) {
      return MembraneTransportStrings.solutes.oxygenStringProperty.value;
    }
    if (soluteType === SoluteType.CARBON_DIOXIDE) {
      return MembraneTransportStrings.solutes.carbonDioxideStringProperty.value;
    }
    if (soluteType === SoluteType.SODIUM) {
      return MembraneTransportStrings.solutes.sodiumStringProperty.value;
    }
    if (soluteType === SoluteType.POTASSIUM) {
      return MembraneTransportStrings.solutes.potassiumStringProperty.value;
    }
    return MembraneTransportStrings.solutes.glucoseStringProperty.value;
  }

  public override dispose(): void {
    this.multilinks.forEach((multilink) => multilink.dispose());
    super.dispose();
  }
}
