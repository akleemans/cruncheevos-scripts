cruncheevos-scripts
===================

My scripts [cruncheevos](https://github.com/suXinjke/cruncheevos) scripts to
create [achievements](https://retroachievements.org/).

My sets:

* [The Rugrats Movie](https://retroachievements.org/game/2563): rugrats.js
* wip - [Turok: Battle of the Bionosaurs](https://retroachievements.org/game/13955): turok.js

## Setup

1. Install dependencies: `npm install`
2. Create `.env` file with `RACACHE=C:\path\to\RALibretro`

## Usage

See [@cruncheevos/cli](https://github.com/suXinjke/cruncheevos/tree/master/packages/cli) for details.

* Import set: `npx cruncheevos generate 2563 rugrats.js`
* Diff set: `npx cruncheevos diff rugrats.js`
* Save to local: `npx cruncheevos save rugrats.js`
