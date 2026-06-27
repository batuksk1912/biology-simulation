import { Bounds2, Vector2 } from "scenerystack/dot";
import {
  DragListener,
  HBox,
  KeyboardDragListener,
  Node,
  Rectangle,
  Text,
  VBox,
} from "scenerystack/scenery";
import MembraneTransportColors from "../MembraneTransportColors.js";
import MembraneTransportStrings from "../MembraneTransportStrings.js";
import MembraneTransportModel from "../model/MembraneTransportModel.js";
import MembraneProtein, { type ProteinKind } from "../model/MembraneProtein.js";

type DropValidator = (viewPoint: Vector2) => boolean;

/**
 * Toolbox of draggable creator icons for membrane proteins.
 */
export default class SoluteToolbox extends Node {
  public constructor(
    private readonly model: MembraneTransportModel,
    private readonly dropValidator: DropValidator,
    private readonly viewToModelX: (viewX: number) => number,
    bounds: Bounds2,
  ) {
    super({
      tagName: "section",
      accessibleHeading: MembraneTransportStrings.toolboxStringProperty,
      accessibleHelpText: MembraneTransportStrings.toolboxHelpStringProperty,
    });

    this.addChild(
      new Rectangle(bounds, 8, 8, {
        fill: "#f8fafc",
        stroke: MembraneTransportColors.panelStrokeProperty.value,
        lineWidth: 1.5,
      }),
    );
    this.addChild(
      new Text(MembraneTransportStrings.toolboxStringProperty, {
        font: "17px sans-serif",
        fill: "#1f2933",
        left: bounds.minX + 12,
        top: bounds.minY + 10,
      }),
    );

    const iconRow = new HBox({
      spacing: 10,
      left: bounds.minX + 12,
      top: bounds.minY + 42,
      children: [
        this.createCreatorIcon(
          "leakage",
          MembraneTransportStrings.channelShortStringProperty.value,
          MembraneTransportStrings.leakageChannelStringProperty.value,
        ),
        this.createCreatorIcon(
          "sodiumPotassiumPump",
          MembraneTransportStrings.pumpShortStringProperty.value,
          MembraneTransportStrings.sodiumPotassiumPumpStringProperty.value,
        ),
        this.createCreatorIcon(
          "voltageGated",
          MembraneTransportStrings.voltageShortStringProperty.value,
          MembraneTransportStrings.voltageChannelStringProperty.value,
        ),
        this.createCreatorIcon(
          "ligandGated",
          MembraneTransportStrings.ligandShortStringProperty.value,
          MembraneTransportStrings.ligandChannelStringProperty.value,
        ),
      ],
    });
    this.addChild(iconRow);
  }

  private createCreatorIcon(
    kind: ProteinKind,
    shortLabel: string,
    accessibleName: string,
  ): Node {
    let activeProtein: MembraneProtein | null = null;
    const icon = new VBox({
      spacing: 5,
      align: "center",
      cursor: "pointer",
      focusable: true,
      accessibleName,
      accessibleHelpText: MembraneTransportStrings.toolboxHelpStringProperty,
      children: [
        new Rectangle(-18, -18, 36, 36, 6, 6, {
          fill:
            kind === "sodiumPotassiumPump"
              ? MembraneTransportColors.pumpProperty.value
              : MembraneTransportColors.channelProperty.value,
          stroke: "#26313d",
          lineWidth: 1.3,
        }),
        new Text(shortLabel, {
          font: "10px sans-serif",
          fill: "#1f2933",
          maxWidth: 56,
        }),
      ],
    });

    const placeProteinAtViewPoint = (viewPoint: Vector2): void => {
      if (!activeProtein) {
        activeProtein = this.model.createProtein(
          kind,
          this.clampProteinX(this.viewToModelX(viewPoint.x)),
        );
        this.model.addProtein(activeProtein);
      }
      activeProtein.xPositionProperty.value = this.clampProteinX(
        this.viewToModelX(viewPoint.x),
      );
    };

    const dragListener = new DragListener({
      start: (_event, listener) =>
        placeProteinAtViewPoint(listener.globalPoint),
      drag: (_event, listener) => placeProteinAtViewPoint(listener.globalPoint),
      end: (_event, listener) => {
        if (activeProtein && !this.dropValidator(listener.globalPoint)) {
          this.model.removeProtein(activeProtein);
        }
        activeProtein = null;
      },
      translateNode: false,
    });

    const keyboardDragListener = new KeyboardDragListener({
      dragDelta: 7,
      shiftDragDelta: 2,
      start: () => {
        activeProtein = this.model.createProtein(kind, 50);
        this.model.addProtein(activeProtein);
      },
      drag: (_event, listener) => {
        if (activeProtein) {
          activeProtein.xPositionProperty.value = this.clampProteinX(
            activeProtein.xPositionProperty.value + listener.modelDelta.x / 6,
          );
        }
      },
      end: () => {
        activeProtein = null;
      },
      translateNode: false,
    });

    icon.addInputListener(dragListener);
    icon.addInputListener(keyboardDragListener);
    return icon;
  }

  private clampProteinX(x: number): number {
    return Math.max(3, Math.min(97, x));
  }
}
