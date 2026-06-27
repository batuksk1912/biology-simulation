import { Bounds2, Vector2 } from "scenerystack/dot";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Rectangle, Text } from "scenerystack/scenery";
import MembraneTransportColors from "../MembraneTransportColors.js";
import MembraneTransportConstants from "../MembraneTransportConstants.js";
import MembraneTransportStrings from "../MembraneTransportStrings.js";
import MembraneTransportModel from "../model/MembraneTransportModel.js";
import MembraneProtein from "../model/MembraneProtein.js";
import Particle from "../model/Particle.js";
import MembraneNode from "./MembraneNode.js";
import MembraneProteinNode from "./MembraneProteinNode.js";
import ParticleNode from "./ParticleNode.js";

type RemoveProteinCallback = (protein: MembraneProtein) => void;

/**
 * Framed play area showing outside, membrane, cytosol, particles, and proteins.
 */
export default class ObservationWindow extends Node {
  public readonly modelViewTransform: ModelViewTransform2;
  private readonly particleLayer = new Node();
  private readonly proteinLayer = new Node();
  private readonly particleNodes = new Map<Particle, ParticleNode>();
  private readonly proteinNodes = new Map<
    MembraneProtein,
    MembraneProteinNode
  >();
  private readonly particleAddedListener: (particle: Particle) => void;
  private readonly particleRemovedListener: (particle: Particle) => void;
  private readonly proteinAddedListener: (protein: MembraneProtein) => void;
  private readonly proteinRemovedListener: (protein: MembraneProtein) => void;

  public constructor(
    private readonly model: MembraneTransportModel,
    public readonly viewBounds: Bounds2,
    removeProtein: RemoveProteinCallback,
  ) {
    super({
      tagName: "section",
      accessibleHeading: MembraneTransportStrings.membraneStringProperty,
      accessibleHelpText: MembraneTransportStrings.playAreaHelpStringProperty,
    });

    this.modelViewTransform = ModelViewTransform2.createRectangleMapping(
      MembraneTransportConstants.MODEL_BOUNDS,
      viewBounds,
    );

    const membraneY = this.modelViewTransform.modelToViewY(0);
    const membraneThickness = Math.abs(
      this.modelViewTransform.modelToViewDeltaY(
        MembraneTransportConstants.MEMBRANE_HALF_THICKNESS * 2,
      ),
    );

    this.addChild(
      new Rectangle(
        viewBounds.minX,
        viewBounds.minY,
        viewBounds.width,
        viewBounds.height / 2,
        {
          fill: MembraneTransportColors.extracellularFluidProperty.value,
        },
      ),
    );
    this.addChild(
      new Rectangle(
        viewBounds.minX,
        viewBounds.centerY,
        viewBounds.width,
        viewBounds.height / 2,
        {
          fill: MembraneTransportColors.cytosolProperty.value,
        },
      ),
    );
    this.addChild(
      new Text(MembraneTransportStrings.outsideStringProperty, {
        font: "18px sans-serif",
        fill: "#25566f",
        left: viewBounds.minX + 14,
        top: viewBounds.minY + 10,
      }),
    );
    this.addChild(
      new Text(MembraneTransportStrings.insideStringProperty, {
        font: "18px sans-serif",
        fill: "#2d6132",
        left: viewBounds.minX + 14,
        bottom: viewBounds.maxY - 10,
      }),
    );
    this.addChild(new MembraneNode(viewBounds, membraneY, membraneThickness));
    this.addChild(this.particleLayer);
    this.addChild(this.proteinLayer);
    this.addChild(
      new Rectangle(viewBounds, 8, 8, {
        fill: null,
        stroke: MembraneTransportColors.panelStrokeProperty.value,
        lineWidth: 2,
      }),
    );

    this.particleAddedListener = (particle) => this.addParticleNode(particle);
    this.particleRemovedListener = (particle) =>
      this.removeParticleNode(particle);
    this.proteinAddedListener = (protein) => {
      this.addProteinNode(protein, removeProtein);
    };
    this.proteinRemovedListener = (protein) => this.removeProteinNode(protein);

    model.particles.addItemAddedListener(this.particleAddedListener);
    model.particles.addItemRemovedListener(this.particleRemovedListener);
    model.proteins.addItemAddedListener(this.proteinAddedListener);
    model.proteins.addItemRemovedListener(this.proteinRemovedListener);
    model.particles.forEach((particle) => this.addParticleNode(particle));
    model.proteins.forEach((protein) =>
      this.addProteinNode(protein, removeProtein),
    );
  }

  public isProteinDropInMembrane(viewPoint: Vector2): boolean {
    if (
      viewPoint.x < this.viewBounds.minX ||
      viewPoint.x > this.viewBounds.maxX ||
      viewPoint.y < this.viewBounds.minY ||
      viewPoint.y > this.viewBounds.maxY
    ) {
      return false;
    }
    const modelPoint = this.modelViewTransform.viewToModelPosition(viewPoint);
    return (
      Math.abs(modelPoint.y) <= MembraneTransportConstants.PROTEIN_DROP_Y_RANGE
    );
  }

  public step(): void {
    this.particleNodes.forEach((node, particle) => {
      const viewPosition = this.modelViewTransform.modelToViewPosition(
        particle.position,
      );
      node.center = viewPosition;
      node.visible = this.model.getCountProperties(
        particle.type,
      ).presentProperty.value;
    });
  }

  private addParticleNode(particle: Particle): void {
    const node = new ParticleNode(particle);
    this.particleNodes.set(particle, node);
    this.particleLayer.addChild(node);
  }

  private removeParticleNode(particle: Particle): void {
    const node = this.particleNodes.get(particle);
    if (node) {
      this.particleLayer.removeChild(node);
      node.dispose();
      this.particleNodes.delete(particle);
    }
  }

  private addProteinNode(
    protein: MembraneProtein,
    removeProtein: RemoveProteinCallback,
  ): void {
    const node = new MembraneProteinNode(
      protein,
      this.modelViewTransform,
      MembraneTransportConstants.MODEL_BOUNDS,
      (viewPoint) => this.isProteinDropInMembrane(viewPoint),
      removeProtein,
    );
    this.proteinNodes.set(protein, node);
    this.proteinLayer.addChild(node);
  }

  private removeProteinNode(protein: MembraneProtein): void {
    const node = this.proteinNodes.get(protein);
    if (node) {
      this.proteinLayer.removeChild(node);
      node.dispose();
      this.proteinNodes.delete(protein);
    }
  }

  public override dispose(): void {
    this.model.particles.removeItemAddedListener(this.particleAddedListener);
    this.model.particles.removeItemRemovedListener(
      this.particleRemovedListener,
    );
    this.model.proteins.removeItemAddedListener(this.proteinAddedListener);
    this.model.proteins.removeItemRemovedListener(this.proteinRemovedListener);
    this.particleNodes.forEach((node) => node.dispose());
    this.proteinNodes.forEach((node) => node.dispose());
    super.dispose();
  }
}
