import {AchievementSet, define as $} from '@cruncheevos/core';
const set = new AchievementSet({gameId: 5260, title: 'Monster Force'});

// Addresses and helpers

const GameStateEnum = {
  InGame: 0x0f,
  LevelEndScreen: 0x11
}

const gameState = 0x0770;
const maxLevelUnlocked = 0x34df;

/* ========= PROGRESSION ========= */

set.addAchievement({
  // id: TODO,
  // badge: 'TODO',
  title: 'Welcome to Monsterland',
  description: 'Complete the introduction by finishing Cemetery Level 1',
  points: 2,
  type: 'progression',
  conditions: $(
    ['', 'Delta', '8bit', 0x35b8, '=', 'Value', '', 0],
    ['', 'Mem', '8bit', 0x35b8, '>', 'Value', '', 0],
    // Save protection - must just have finished the level
    ['', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.LevelEndScreen],
    // Save protection - level must not be unlocked yet
    ['', 'Mem', '8bit', maxLevelUnlocked, '=', 'Value', '', 0x00],
  ),
});

set.addAchievement({
  // id: TODO,
  // badge: 'TODO',
  title: 'No Time to Die',
  description: 'Finish the Cemetery Zone',
  points: 5,
  type: 'progression',
  conditions: $(
    ['', 'Delta', '8bit', 0x35bb, '=', 'Value', '', 0],
    ['', 'Mem', '8bit', 0x35bb, '>', 'Value', '', 0],
    ['', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.LevelEndScreen],
    ['', 'Mem', '8bit', maxLevelUnlocked, '=', 'Value', '', 0x03],
  ),
});


/* ========= CHALLENGES ========= */

/* ========= LEADERBOARDS ========= */


export default set;

/* ========= RICH PRESENCE ========= */

/*

*/
