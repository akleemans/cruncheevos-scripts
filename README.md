cruncheevos-scripts
===================

My [cruncheevos](https://github.com/suXinjke/cruncheevos) scripts
for [RetroAchievements](https://retroachievements.org/).

Sets:

* [The Rugrats Movie](https://retroachievements.org/game/2563)
* [Turok: Battle of the Bionosaurs](https://retroachievements.org/game/13955)
* [Monster Force](https://retroachievements.org/game/5260)

## Setup

1. Install dependencies: `npm install`
2. Create `.env` file with `RACACHE=C:\path\to\RALibretro`

## Usage

See [@cruncheevos/cli](https://github.com/suXinjke/cruncheevos/tree/master/packages/cli) for details.

* Import set: `npx cruncheevos generate 5260 monster-force/monster-force.js` (possibly with `--include-unofficial`)
* Diff set: `npx cruncheevos diff monster-force/monster-force.js`
* Save to local: `npx cruncheevos save monster-force/monster-force.js`
* Lint: `npx eslint monster-force/monster-force.js --fix`
* Format: `npm run format`
* Run tests: `npm run test`
* Open viewer: `npm run viewer`
* Run tests: `npm run test`
* Sync code notes to scenarios: `npm run sync`

## Tests

Some sets have extensive scenario tests (recorded emulator sequences with expectations), based
on [https://www.npmjs.com/package/cruncheevos-playtest](cruncheevos-playtest).

See for example the Monster Force set.
