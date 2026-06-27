import { Bounds2, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import {
  DragListener,
  KeyboardDragListener,
  Line,
  Node,
  Path,
  Rectangle,
  Text,
} from "scenerystack/scenery";
import MembraneTransportColors from "../MembraneTransportColors.js";
import MembraneTransportStrings from "../MembraneTransportStrings.js";
import MembraneProtein from "../model/MembraneProtein.js";

type KeepProteinCallback = (viewPoint: Vector2) => boolean;
type RemoveProteinCallback = (protein: MembraneProtein) => void;

/**
 * Draggable visual for a model membrane protein.
 */
export default class MembraneProteinNode extends Node {
  private readonly dragListener: DragListener;
  private readonly keyboardDragListener: KeyboardDragListener;
  private readonly openListener: (open: boolean) => void;
  private readonly xPositionListener: (x: number) => void;
  private readonly bodyNode: Rectangle | Path;
  private readonly gateNode: Line;

  public constructor(
    private readonly protein: MembraneProtein,
    private readonly modelViewTransform: ModelViewTransform2,
    private readonly membraneModelBounds: Bounds2,
    keepProtein: KeepProteinCallback,
    removeProtein: RemoveProteinCallback,
  ) {
    super({
      cursor: "pointer",
      focusable: true,
      accessibleName: MembraneProteinNode.getAccessibleName(protein),
      accessibleHelpText: MembraneTransportStrings.toolboxHelpStringProperty,
    });

    this.bodyNode = this.createBodyNode();
    this.gateNode = new Line(-9, 0, 9, 0, {
      stroke: "#1f2933",
      lineWidth: 3,
      visible: !protein.openProperty.value,
    });
    this.addChild(this.bodyNode);
    this.addChild(this.gateNode);
    this.addChild(
      new Text(MembraneProteinNode.getShortLabel(protein), {
        font: "10px sans-serif",
        fill: "white",
        center: new Vector2(0, 0),
        pickable: false,
      }),
    );

    this.xPositionListener = (x) => {
      this.centerX = this.modelViewTransform.modelToViewX(x);
      this.centerY = this.modelViewTransform.modelToViewY(0);
    };
    this.openListener = (open) => {
      this.gateNode.visible = !open;
      this.opacity = open ? 1 : 0.72;
    };

    protein.xPositionProperty.link(this.xPositionListener);
    protein.openProperty.link(this.openListener);

    this.dragListener = new DragListener({
      start: (_event, listener) => {
        this.updateProteinPositionFromViewPoint(listener.globalPoint);
      },
      drag: (_event, listener) => {
        this.updateProteinPositionFromViewPoint(listener.globalPoint);
      },
      end: (_event, listener) => {
        if (!keepProtein(listener.globalPoint)) {
          removeProtein(protein);
        }
      },
      translateNode: false,
    });

    this.keyboardDragListener = new KeyboardDragListener({
      dragDelta: 8,
      shiftDragDelta: 2,
      drag: (_event, listener) => {
        const modelDelta = this.modelViewTransform.viewToModelDeltaX(
          listener.modelDelta.x,
        );
        protein.xPositionProperty.value = this.clampProteinX(
          protein.xPositionProperty.value + modelDelta,
        );
      },
      translateNode: false,
    });

    this.addInputListener(this.dragListener);
    this.addInputListener(this.keyboardDragListener);
  }

  private createBodyNode(): Rectangle | Path {
    if (this.protein.kind === "sodiumPotassiumPump") {
      return new Path(this.createPumpShape(), {
        fill: MembraneTransportColors.pumpProperty.value,
        stroke: "#74420f",
        lineWidth: 1.5,
      });
    }

    const fill =
      this.protein.kind === "leakage"
        ? MembraneTransportColors.channelProperty.value
        : MembraneTransportColors.closedProteinProperty.value;
    return new Rectangle(-12, -28, 24, 56, 7, 7, {
      fill,
      stroke: "#1d3550",
      lineWidth: 1.5,
    });
  }

  private createPumpShape(): Shape {
    return new Shape()
      .moveTo(-15, -26)
      .lineTo(10, -26)
      .quadraticCurveTo(18, -8, 8, 0)
      .quadraticCurveTo(18, 8, 10, 26)
      .lineTo(-15, 26)
      .quadraticCurveTo(-8, 8, -16, 0)
      .quadraticCurveTo(-8, -8, -15, -26)
      .close();
  }

  private updateProteinPositionFromViewPoint(viewPoint: Vector2): void {
    this.protein.xPositionProperty.value = this.clampProteinX(
      this.modelViewTransform.viewToModelX(viewPoint.x),
    );
  }

  private clampProteinX(x: number): number {
    return Math.max(
      this.membraneModelBounds.minX + 3,
      Math.min(this.membraneModelBounds.maxX - 3, x),
    );
  }

  private static getAccessibleName(protein: MembraneProtein): string {
    if (protein.kind === "leakage") {
      return MembraneTransportStrings.leakageChannelStringProperty.value;
    }
    if (protein.kind === "voltageGated") {
      return MembraneTransportStrings.voltageChannelStringProperty.value;
    }
    if (protein.kind === "ligandGated") {
      return MembraneTransportStrings.ligandChannelStringProperty.value;
    }
    return MembraneTransportStrings.sodiumPotassiumPumpStringProperty.value;
  }

  private static getShortLabel(protein: MembraneProtein): string {
    if (protein.kind === "leakage") {
      return MembraneTransportStrings.channelShortStringProperty.value;
    }
    if (protein.kind === "voltageGated") {
      return MembraneTransportStrings.voltageShortStringProperty.value;
    }
    if (protein.kind === "ligandGated") {
      return MembraneTransportStrings.ligandShortStringProperty.value;
    }
    return MembraneTransportStrings.pumpShortStringProperty.value;
  }

  public override dispose(): void {
    this.removeInputListener(this.dragListener);
    this.removeInputListener(this.keyboardDragListener);
    this.protein.xPositionProperty.unlink(this.xPositionListener);
    this.protein.openProperty.unlink(this.openListener);
    super.dispose();
  }
}
