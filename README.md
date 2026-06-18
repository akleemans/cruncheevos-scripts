cruncheevos-scripts
===================

My [cruncheevos](https://github.com/suXinjke/cruncheevos) scripts for
creating [achievements](https://retroachievements.org/).

Sets:

* [The Rugrats Movie](https://retroachievements.org/game/2563): rugrats.js
* wip - [Turok: Battle of the Bionosaurs](https://retroachievements.org/game/13955): turok.js

## Setup

1. Install dependencies: `npm install`
2. Create `.env` file with `RACACHE=C:\path\to\RALibretro`

## Usage

See [@cruncheevos/cli](https://github.com/suXinjke/cruncheevos/tree/master/packages/cli) for details.

* Import set: `npx cruncheevos generate 13955 turok.js` (possibly with `--include-unofficial`)
* Diff set: `npx cruncheevos diff turok.js`
* Save to local: `npx cruncheevos save turok.js`
* Lint: `npx eslint turok.js --fix`
