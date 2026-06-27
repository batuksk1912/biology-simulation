import { DerivedProperty } from "scenerystack/axon";
import { Bounds2 } from "scenerystack/dot";
import {
  ResetAllButton,
  TimeControlNode,
  TimeSpeed,
} from "scenerystack/scenery-phet";
import { ScreenSummaryContent, ScreenView } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { Node, Text } from "scenerystack/scenery";
import MembraneTransportConstants from "../MembraneTransportConstants.js";
import MembraneTransportStrings from "../MembraneTransportStrings.js";
import MembraneTransportModel from "../model/MembraneTransportModel.js";
import SoluteType from "../model/SoluteType.js";
import ObservationWindow from "./ObservationWindow.js";
import SoluteToolbox from "./SoluteToolbox.js";
import ConcentrationBarsNode from "./ConcentrationBarsNode.js";
import MembranePotentialMeterNode from "./MembranePotentialMeterNode.js";
import MembraneTransportControls from "./MembraneTransportControls.js";

/**
 * Main screen view for the membrane transport simulation.
 */
export default class MembraneTransportScreenView extends ScreenView {
  private readonly observationWindow: ObservationWindow;
  private readonly stateDescriptionProperty: DerivedProperty<
    string,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown,
    unknown
  >;

  public constructor(
    private readonly model: MembraneTransportModel,
    tandem: Tandem,
  ) {
    super({
      layoutBounds: new Bounds2(
        0,
        0,
        MembraneTransportConstants.SCREEN_WIDTH,
        MembraneTransportConstants.SCREEN_HEIGHT,
      ),
      screenSummaryContent: new ScreenSummaryContent({
        playAreaContent: MembraneTransportStrings.playAreaHelpStringProperty,
        controlAreaContent: MembraneTransportStrings.toolboxHelpStringProperty,
        currentDetailsContent:
          MembraneTransportStrings.stateDescriptionStringProperty,
      }),
    });

    this.observationWindow = new ObservationWindow(
      model,
      new Bounds2(30, 72, 760, 562),
      (protein) => model.removeProtein(protein),
    );
    this.addChild(this.observationWindow);

    const title = new Text(MembraneTransportStrings.titleStringProperty, {
      font: "28px sans-serif",
      fill: "#152238",
      left: 30,
      top: 22,
    });
    this.addChild(title);

    const toolbox = new SoluteToolbox(
      model,
      (viewPoint) => this.observationWindow.isProteinDropInMembrane(viewPoint),
      (viewX) => this.observationWindow.modelViewTransform.viewToModelX(viewX),
      new Bounds2(30, 584, 460, 666),
    );
    this.addChild(toolbox);

    const concentrationBarsNode = new ConcentrationBarsNode(model);
    concentrationBarsNode.left = 810;
    concentrationBarsNode.top = 72;
    this.addChild(concentrationBarsNode);

    const potentialMeterNode = new MembranePotentialMeterNode(model);
    potentialMeterNode.left = 810;
    potentialMeterNode.top = 402;
    this.addChild(potentialMeterNode);

    const controls = new MembraneTransportControls(model);
    controls.left = 810;
    controls.top = 476;
    this.addChild(controls);

    const timeControlNode = new TimeControlNode(model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST],
      tandem: tandem.createTandem("timeControlNode"),
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => model.step(1 / 12),
        },
      },
      centerX: this.layoutBounds.centerX,
      bottom: this.layoutBounds.maxY - 18,
    });
    this.addChild(timeControlNode);

    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - 18,
      bottom: this.layoutBounds.maxY - 18,
    });
    this.addChild(resetAllButton);

    this.stateDescriptionProperty = DerivedProperty.deriveAny(
      [
        model.getCountProperties(SoluteType.SODIUM).outsideCountProperty,
        model.getCountProperties(SoluteType.SODIUM).insideCountProperty,
        model.getCountProperties(SoluteType.POTASSIUM).outsideCountProperty,
        model.getCountProperties(SoluteType.POTASSIUM).insideCountProperty,
        model.membranePotentialProperty,
      ],
      () =>
        `${MembraneTransportStrings.sodiumStateStringProperty.value} ${MembraneTransportStrings.isStateStringProperty.value} ${this.describeGradient(
          SoluteType.SODIUM,
        )}; ${MembraneTransportStrings.potassiumStateStringProperty.value} ${MembraneTransportStrings.isStateStringProperty.value} ${this.describeGradient(
          SoluteType.POTASSIUM,
        )}; ${MembraneTransportStrings.potentialStateStringProperty.value} ${model.membranePotentialProperty.value.toFixed(
          0,
        )} ${MembraneTransportStrings.millivoltStringProperty.value}.`,
    );
    const stateDescriptionNode = new Node({
      tagName: "p",
      innerContent: this.stateDescriptionProperty,
    });
    this.addChild(stateDescriptionNode);
    this.pdomPlayAreaNode.pdomOrder = [
      this.observationWindow,
      stateDescriptionNode,
    ];
    this.pdomControlAreaNode.pdomOrder = [
      toolbox,
      concentrationBarsNode,
      potentialMeterNode,
      controls,
      timeControlNode,
      resetAllButton,
    ];
  }

  public reset(): void {
    this.observationWindow.step();
  }

  public override step(): void {
    this.observationWindow.step();
  }

  private describeGradient(soluteType: SoluteType): string {
    const countProperties = this.model.getCountProperties(soluteType);
    if (
      countProperties.outsideCountProperty.value >
      countProperties.insideCountProperty.value
    ) {
      return MembraneTransportStrings.higherOutsideStringProperty.value;
    }
    if (
      countProperties.insideCountProperty.value >
      countProperties.outsideCountProperty.value
    ) {
      return MembraneTransportStrings.higherInsideStringProperty.value;
    }
    return MembraneTransportStrings.balancedStringProperty.value;
  }

  public override dispose(): void {
    this.stateDescriptionProperty.dispose();
    super.dispose();
  }
}
