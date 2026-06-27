# Membrane Transport

Interactive SceneryStack simulation of cell membrane transport. The model includes simple diffusion of O2 and CO2, facilitated diffusion of Na+, K+, and glucose through open membrane proteins, and active Na/K pumping that exports 3 Na+ and imports 2 K+ per ATP cycle.

## Install and Run

```sh
npm install
npm start
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

## Verify

```sh
npm run typecheck
npm run lint
npm run build
```

`npm run format` applies Prettier.

## Model Summary

Particles move with bounded Brownian motion in extracellular fluid, cytosol, and the membrane boundary. O2 and CO2 can cross the bilayer only when moving down their concentration gradients. Na+, K+, and glucose reflect from the bilayer unless a compatible open protein is nearby. Pumps consume ATP availability and periodically move 3 Na+ outward and 2 K+ inward, maintaining a resting-potential preset near -70 mV. Membrane potential is a simplified derived readout from Na+ and K+ distributions, not a full electrochemical solver.

## File Map

- `src/main.ts` launches the SceneryStack `Sim`.
- `src/membrane-transport/MembraneTransportScreen.ts` creates the screen model and view.
- `src/membrane-transport/model/` contains solutes, particles, proteins, and transport rules.
- `src/membrane-transport/view/` contains the observation window, bilayer, particles, toolbox, charts, controls, and readouts.
- `src/membrane-transport/MembraneTransportStrings.ts` centralizes user-facing strings as string properties.
- `src/membrane-transport/MembraneTransportColors.ts` centralizes color properties.

## Notes

The official template version used here exposes Vite, ESLint, and Prettier dependencies but did not generate separate prompt choices after Custom Setup. The template also does not scaffold a Fluent repository, so strings are routed through SceneryStack `StringProperty` instances in one module. Stretch behavior included: voltage-gated and ligand-gated channels, plus the resting-potential preset.
