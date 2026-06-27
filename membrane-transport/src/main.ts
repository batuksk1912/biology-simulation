// NOTE: brand.js needs to be the first import. This is because SceneryStack for sims needs a very specific loading
// order: init.ts => assert.ts => splash.ts => brand.ts => everything else (here)
import "./brand.js";

import { onReadyToLaunch, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import MembraneTransportScreen from "./membrane-transport/MembraneTransportScreen.js";
import MembraneTransportStrings from "./membrane-transport/MembraneTransportStrings.js";

onReadyToLaunch(() => {
  const screens = [
    new MembraneTransportScreen({
      tandem: Tandem.ROOT.createTandem("membraneTransportScreen"),
    }),
  ];

  const sim = new Sim(MembraneTransportStrings.titleStringProperty, screens);
  sim.start();
});
