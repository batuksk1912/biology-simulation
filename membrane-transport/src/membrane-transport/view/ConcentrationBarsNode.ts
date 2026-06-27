import { Multilink } from "scenerystack/axon";
import { Range, Vector2 } from "scenerystack/dot";
import { BarPlot, ChartTransform } from "scenerystack/bamboo";
import { Node, Rectangle, Text, VBox } from "scenerystack/scenery";
import MembraneTransportColors from "../MembraneTransportColors.js";
import MembraneTransportConstants from "../MembraneTransportConstants.js";
import MembraneTransportStrings from "../MembraneTransportStrings.js";
import MembraneTransportModel from "../model/MembraneTransportModel.js";
import SoluteType from "../model/SoluteType.js";

/**
 * Live inside/outside concentration bar plots for all solutes.
 */
export default class ConcentrationBarsNode extends Node {
  private readonly multilinks: Array<{ dispose: () => void }> = [];
  private readonly chartTransforms: ChartTransform[] = [];

  public constructor(model: MembraneTransportModel) {
    super({
      tagName: "section",
      accessibleHeading: MembraneTransportStrings.concentrationsStringProperty,
    });

    this.addChild(
      new Rectangle(0, 0, 260, 320, 8, 8, {
        fill: "#ffffff",
        stroke: MembraneTransportColors.panelStrokeProperty.value,
      }),
    );
    this.addChild(
      new Text(MembraneTransportStrings.concentrationsStringProperty, {
        font: "17px sans-serif",
        fill: "#1f2933",
        left: 12,
        top: 10,
      }),
    );

    const rows = new VBox({
      spacing: 8,
      left: 12,
      top: 42,
      children: SoluteType.VALUES.map((soluteType) =>
        this.createSoluteRow(model, soluteType),
      ),
    });
    this.addChild(rows);
  }

  private createSoluteRow(
    model: MembraneTransportModel,
    soluteType: SoluteType,
  ): Node {
    const countProperties = model.getCountProperties(soluteType);
    const row = new Node();
    const label = new Text(ConcentrationBarsNode.getSoluteLabel(soluteType), {
      font: "12px sans-serif",
      fill: "#1f2933",
      left: 0,
      centerY: 24,
      maxWidth: 58,
    });
    row.addChild(label);

    const chartTransform = new ChartTransform({
      viewWidth: 120,
      viewHeight: 44,
      modelXRange: new Range(0, 3),
      modelYRange: new Range(
        0,
        MembraneTransportConstants.MAX_COMPARTMENT_COUNT,
      ),
    });
    this.chartTransforms.push(chartTransform);
    const barPlot = new BarPlot(
      chartTransform,
      [
        new Vector2(1, countProperties.outsideCountProperty.value),
        new Vector2(2, countProperties.insideCountProperty.value),
      ],
      {
        barWidth: 28,
        pointToPaintableFields: (point) => ({
          fill:
            point.x < 1.5
              ? "#7db9d8"
              : ConcentrationBarsNode.getSoluteFill(soluteType),
          stroke: "#334155",
          lineWidth: 0.8,
        }),
        left: 70,
        top: 0,
      },
    );
    row.addChild(
      new Rectangle(70, 0, 120, 44, {
        fill: "#f8fafc",
        stroke: "#d5dde6",
      }),
    );
    row.addChild(barPlot);

    const valuesText = new Text("", {
      font: "11px sans-serif",
      fill: "#1f2933",
      left: 198,
      centerY: 22,
    });
    row.addChild(valuesText);

    const multilink = Multilink.multilink(
      [
        countProperties.insideCountProperty,
        countProperties.outsideCountProperty,
      ],
      (insideCount, outsideCount) => {
        barPlot.setDataSet([
          new Vector2(1, outsideCount),
          new Vector2(2, insideCount),
        ]);
        valuesText.string = `${outsideCount}/${insideCount}`;
      },
    );
    this.multilinks.push(multilink);

    row.localBounds = row.bounds;
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

  private static getSoluteFill(soluteType: SoluteType): string {
    if (soluteType === SoluteType.OXYGEN) {
      return MembraneTransportColors.oxygenProperty.value.toCSS();
    }
    if (soluteType === SoluteType.CARBON_DIOXIDE) {
      return MembraneTransportColors.carbonDioxideProperty.value.toCSS();
    }
    if (soluteType === SoluteType.SODIUM) {
      return MembraneTransportColors.sodiumProperty.value.toCSS();
    }
    if (soluteType === SoluteType.POTASSIUM) {
      return MembraneTransportColors.potassiumProperty.value.toCSS();
    }
    return MembraneTransportColors.glucoseProperty.value.toCSS();
  }

  public override dispose(): void {
    this.multilinks.forEach((multilink) => multilink.dispose());
    this.chartTransforms.forEach((chartTransform) => chartTransform.dispose());
    super.dispose();
  }
}
