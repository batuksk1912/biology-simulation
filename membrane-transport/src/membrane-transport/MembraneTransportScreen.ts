import { Screen, type ScreenOptions } from "scenerystack/sim";
import MembraneTransportModel from "./model/MembraneTransportModel.js";
import MembraneTransportScreenView from "./view/MembraneTransportScreenView.js";

/**
 * Single PhET-style screen for exploring membrane transport mechanisms.
 */
export default class MembraneTransportScreen extends Screen<
  MembraneTransportModel,
  MembraneTransportScreenView
> {
  public constructor(options: ScreenOptions) {
    super(
      () => new MembraneTransportModel(),
      (model) =>
        new MembraneTransportScreenView(
          model,
          options.tandem.createTandem("view"),
        ),
      options,
    );
  }
}
