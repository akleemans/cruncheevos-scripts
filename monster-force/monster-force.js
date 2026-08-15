import {AchievementSet, define as $} from '@cruncheevos/core';

const set = new AchievementSet({gameId: 5260, title: 'Monster Force'});

// Addresses and helpers

const GameStateEnum = {
  LevelSelect: 0x0c,
  LevelStart: 0x0e,
  InGame: 0x0f,
  ScoreScreen: 0x11,
  ShopOptions: 0x12,
  SaveGameOption: 0x13,
  GameOver: 0x14,
};

const PlayerStateEnum = {
  Standing: 0x02,
  Moving: 0x03,
  Hover: 0x04,
  BombArmed: 0x05,
  Teleporting: 0x0c,
  LevelFinishedAnimation: 0x0d,
  Dying: 0x0e,
};

const CharacterActive = {
  Frank: 0x00,
  Drac: 0x01,
  Wolfie: 0x02,
  Mina: 0x03,
  Drew: 0x04,
};

const BadgeTier = {
  Silver: 0x04,
  Gold: 0x05,
  Crystal: 0x06,
};

const LevelEnum = {
  Cemetery1: 0x00,
  Cemetery2: 0x01,
  CemeteryTrial: 0x02,
  CemeteryShadow: 0x03,
  Village1: 0x04,
  Village2: 0x05,
  VillageTrial: 0x06,
  VillageShadow: 0x07,
  Garden1: 0x08,
  Garden2: 0x09,
  GardenTrial: 0x0a,
  GardenShadow: 0x0b,
  Atlantis1: 0x0c,
  Atlantis2: 0x0d,
  AtlantisTrial: 0x0e,
  AtlantisShadow: 0x0f,
  Temple1: 0x10,
  Temple2: 0x11,
  TempleTrial: 0x12,
  TempleDragonShadow: 0x13,
  Desert1: 0x14,
  Desert2: 0x15,
  DesertTrial: 0x16,
  DesertShadow: 0x17,
  Clouds1: 0x18,
  Clouds2: 0x19,
  CloudsTrial: 0x1a,
  CloudsShadow: 0x1b,
  Factory1: 0x1c,
  Factory2: 0x1d,
  FactoryTrial: 0x1e,
  FactoryShadow: 0x1f,
  Castle1: 0x20,
  Castle2: 0x21,
  Castle3: 0x22,
  Castle4: 0x23,
  CastleSergeantSmash: 0x24,
};

// 16 regular levels (8x Level 1 + 2, Cemetery-Factory)
const regularLevels = [
  LevelEnum.Cemetery1, LevelEnum.Cemetery2, LevelEnum.Village1, LevelEnum.Village2,
  LevelEnum.Garden1, LevelEnum.Garden2, LevelEnum.Atlantis1, LevelEnum.Atlantis2,
  LevelEnum.Temple1, LevelEnum.Temple2, LevelEnum.Desert1, LevelEnum.Desert2,
  LevelEnum.Clouds1, LevelEnum.Clouds2, LevelEnum.Factory1, LevelEnum.Factory2,
];

// 8 time trial levels (Cemetery-Factory)
const timeTrialLevels = [
  LevelEnum.CemeteryTrial, LevelEnum.VillageTrial, LevelEnum.GardenTrial, LevelEnum.AtlantisTrial,
  LevelEnum.TempleTrial, LevelEnum.DesertTrial, LevelEnum.CloudsTrial, LevelEnum.FactoryTrial,
];

// 13 boss levels (8 + 5 boss levels in Castle)
const bossLevels = [
  LevelEnum.CemeteryShadow, LevelEnum.VillageShadow, LevelEnum.GardenShadow, LevelEnum.AtlantisShadow,
  LevelEnum.TempleDragonShadow, LevelEnum.DesertShadow, LevelEnum.CloudsShadow, LevelEnum.FactoryShadow,
  LevelEnum.Castle1, LevelEnum.Castle2, LevelEnum.Castle3, LevelEnum.Castle4,
  LevelEnum.CastleSergeantSmash,
];

const gameState = 0x0770;
const playerState = 0x077c;
const currentLevel = 0x34dd;
const maxLevelUnlocked = 0x34df;

const invincibilityCheat = 0x3598;

const atomsInCurrentLevel = 0x35a4;
const totalAtomsInBank = 0x07f8;
const levelTime = 0x359c;
const characterActive = 0x0878;

const toolSlot1 = 0x07fc;
const toolSlot2 = 0x07fd;
const toolSlot3 = 0x07fe;
const toolSlot4 = 0x07ff;
const toolSlots = [toolSlot1, toolSlot2, toolSlot3, toolSlot4];

const objectsEnemiesDestroyed = 0x35a0;
const invincibilityTimer = 0x07ea;

const totalShotsFired = 0x35a8;

const baseHealth = 0x0850;
const baseAttackPower = 0x0852;
const baseForcePower = 0x0853;

const currentHealth = 0x07f0;

// const relicHealthBonus = 0x0855;
// const relicLuckBonus = 0x0856;
const relicAttackBonus = 0x0857;
const relicForceBonus = 0x0858;

const relicSlot1 = 0x0800;
const relicSlot2 = 0x0801;
const relicSlot3 = 0x0802;
const relicSlot4 = 0x0803;
const relicSlots = [relicSlot1, relicSlot2, relicSlot3, relicSlot4];

const getLevelRequirement = (levels) => {
  const arr = [];
  for (let i = 0; i < levels.length; i++) {
    const flag = i === levels.length - 1 ? '' : 'OrNext';
    arr.push([flag, 'Mem', '8bit', currentLevel, '=', 'Value', '', levels[i]]);
  }
  return arr;
};

/* ========= PROGRESSION ========= */

const progression = (levelId) => {
  return [
    // Pop on reaching score screen in correct level, with max level = current level (will be incremented later, on save game screen)
    // This is also save-protection - must just have finished the level and reached score screen
    ['', 'Mem',   '8bit', maxLevelUnlocked, '=', 'Value', '', levelId],
    ['', 'Mem',   '8bit', currentLevel,     '=', 'Value', '', levelId],
    ['', 'Delta', '8bit', gameState,        '=', 'Value', '', GameStateEnum.InGame],
    ['', 'Mem',   '8bit', gameState,        '=', 'Value', '', GameStateEnum.ScoreScreen],

    // Cheat protection - progression can not be unlocked with Mina or Drew, as they are only unlocked after beating the game
    ['', 'Mem', '8bit', characterActive, '<=', 'Value', '', CharacterActive.Wolfie],
  ];
};

const invincibilityCheatProtection = () => {
  return [
    // Pause if the invincibility cheat was ever turned on. Needs levelSelectReset in alt.
    ['PauseIf', 'Mem', '8bit', invincibilityCheat, '=', 'Value', '', 3, 1],
  ];
};

const buttonsPressed = 0x360c;
const shoulderButtonsPressed = 0x360d;

const skipLevelCheatProtection = () => {
  return [
    // The game itself also listens to these button presses to detect cheats entered in-game - there is no other way of detecting it.
    // 0x41 = A + Up pressed. Other buttons can be pressed too (and the cheat will still work),
    // so we have to apply a bitmask. Needs levelSelectReset in alt.
    ['AddSource', 'Mem',   '8bit', buttonsPressed,         '&', 'Value', '', 0x41],
    ['AndNext',   'Value', '',     0,                      '=', 'Value', '', 0x41],
    ['PauseIf',   'Mem',   '8bit', shoulderButtonsPressed, '=', 'Value', '', 0xff, 1],
  ];
};

const levelSelectReset = () => {
  return [['ResetIf', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.LevelSelect]];
};


set.addAchievement({
  id: 625427,
  title: 'Welcome to Monsterland',
  description: 'Complete the introduction by finishing Cemetery Level 1',
  points: 2,
  type: 'progression',
  conditions: {
    core: $(
      ...progression(LevelEnum.Cemetery1),
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      // Reset has to be in a separate alt (and PauseIf can't be), because the reset will not trigger if
      // the Pause in the same group has accumulated a hit
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625428,
  title: 'No Time to Die',
  description: 'Finish the Cemetery Zone',
  points: 5,
  type: 'progression',
  conditions: {
    core: $(
      ...progression(LevelEnum.CemeteryShadow),
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625429,
  title: 'It Takes a Village',
  description: 'Finish the Village Zone',
  points: 5,
  type: 'progression',
  conditions: {
    core: $(
      ...progression(LevelEnum.VillageShadow),
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625430,
  title: 'Green Thumb',
  description: 'Finish the Garden Zone',
  points: 5,
  type: 'progression',
  conditions: {
    core: $(
      ...progression(LevelEnum.GardenShadow),
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625431,
  title: 'Platonic Tale',
  description: 'Finish the Atlantis Zone',
  points: 5,
  type: 'progression',
  conditions: {
    core: $(
      ...progression(LevelEnum.AtlantisShadow),
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625432,
  title: 'Temple Tantrum',
  description: 'Finish the Temple Zone',
  points: 10,
  type: 'progression',
  conditions: {
    core: $(
      ...progression(LevelEnum.TempleDragonShadow),
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625433,
  title: 'Rise of the Mummies',
  description: 'Finish the Desert Zone',
  points: 10,
  type: 'progression',
  conditions: {
    core: $(
      ...progression(LevelEnum.DesertShadow),
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625434,
  title: 'Sky High',
  description: 'Finish the Clouds Zone',
  points: 10,
  type: 'progression',
  conditions: {
    core: $(
      ...progression(LevelEnum.CloudsShadow),
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625435,
  title: 'Industrial Revolution',
  description: 'Finish the Factory Zone',
  points: 10,
  type: 'progression',
  conditions: {
    core: $(
      ...progression(LevelEnum.FactoryShadow),
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625436,
  title: 'Pumpkin Mash',
  description: 'Finish the Castle Zone by defeating Sergeant Smash and beating the game',
  points: 25,
  type: 'win_condition',
  conditions: {
    core: $(
      ...progression(LevelEnum.CastleSergeantSmash),
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

/* ========= CHALLENGES ========= */

// A pumpkin's health lands on 0 when shot (1 damage per hit) but on a negative value when
// bombed (8/16/32 damage, depending on tier), so we test "no longer alive" instead of "exactly 0"
const allPumpkinsDestroyed = (addresses) => {
  const conditions = [];
  // Every pumpkin is destroyed now (only works for "simple" type 1 pumpkins, not for black or multi-hit ones)
  for (const address of addresses) {
    conditions.push(['', 'Mem', '16bit', address, '!=', 'Value', '', 1]);
  }
  // One of them was still alive in the last frame
  addresses.forEach((address, i) => {
    const flag = (i === addresses.length - 1 ? '' : 'OrNext');
    conditions.push([flag, 'Delta', '16bit', address, '=', 'Value', '', 1]);
  });
  return conditions;
};

const cemetery1HiddenPumpkins = [0x1820, 0x1824, 0x1828, 0x182c, 0x1838, 0x183c, 0x1840, 0x1844];

set.addAchievement({
  id: 625437,
  title: 'Walking Through Walls',
  description: 'Find and destroy all 8 pumpkins in the hidden area in Cemetery Level 1',
  points: 2,
  conditions: {
    core: $(
      ...allPumpkinsDestroyed(cemetery1HiddenPumpkins),

      // Context
      ['', 'Mem', '8bit', currentLevel, '=', 'Value', '', LevelEnum.Cemetery1],
      ['', 'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625438,
  title: 'Diagonal Thinking',
  description: 'Get 800 Atoms or more in the first 5 seconds of Cemetery Level 2',
  points: 3,
  conditions: {
    core: $(
      // Lock if more than 5 seconds into Cemetery2
      ['AndNext', 'Mem',   '8bit',  currentLevel,        '=',  'Value', '', LevelEnum.Cemetery2],
      ['PauseIf', 'Mem',   '8bit',  gameState,           '=',  'Value', '', GameStateEnum.InGame, 300],
      // Atoms >= 800 as Trigger condition
      ['',        'Delta', '32bit', atomsInCurrentLevel, '<',  'Value', '', 800],
      ['Trigger', 'Mem',   '32bit', atomsInCurrentLevel, '>=', 'Value', '', 800],
      // Needed, so Trigger shows up in the correct level
      ['',        'Mem',   '8bit',  currentLevel,        '=',  'Value', '', LevelEnum.Cemetery2],
      ['',        'Mem',   '8bit',  gameState,           '=',  'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625439,
  title: 'Every Atom Counts',
  description: 'Collect 100 Atoms and finish the Cemetery Trial in time',
  points: 5,
  conditions: {
    core: $(
      // Only Atoms need to be checked, Trial will fail (and not reach Score screen) if not within time limit
      ['', 'Mem',   '32bit', atomsInCurrentLevel, '>=', 'Value', '', 100],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.CemeteryTrial],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625440,
  title: 'In the Blink of an Eye',
  description: 'Defeat the Cemetery Shadow in less than 10 seconds',
  points: 3,
  conditions: {
    core: $(
      ['',        'Mem',   '16bit', levelTime,    '<', 'Value', '', 600],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.CemeteryShadow],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const keysCollectedCount = 0x07e0;

set.addAchievement({
  id: 625443,
  title: 'One at a Time',
  description: 'Beat Village Level 1 by carrying at most 1 key at once',
  points: 5,
  conditions: {
    core: $(
      // PauseLock if key count ever reaches > 1
      ['PauseIf', 'Mem',   '8bit', keysCollectedCount, '>', 'Value', '', 1, 1],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Village1],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625444,
  title: 'Motion Sickness',
  description: 'Beat Village Level 2 while teleporting at most twice',
  points: 5,
  conditions: {
    core: $(
      // PauseLock: Add Hits if player is teleporting, and lock if teleported 3 times
      ['AndNext', 'Delta', '8bit', playerState, '!=', 'Value', '', PlayerStateEnum.Teleporting],
      ['PauseIf', 'Mem',   '8bit', playerState, '=',  'Value', '', PlayerStateEnum.Teleporting, 3],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Village2],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629000,
  title: 'Slowly but Steady',
  description: 'Pass the Village Trial as Frank within the given bonus time limit',
  points: 5,
  conditions: {
    core: $(
      // Use the timer directly, "time bonus" only gets set later.
      // 7200 frames = 120 seconds, which is the required time limit to get the bonus
      ['', 'Mem', '16bit', levelTime,       '<=', 'Value', '', 7200],

      // Character must be Frank
      ['', 'Mem', '8bit',  characterActive, '=',  'Value', '', CharacterActive.Frank],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.VillageTrial],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625441,
  title: 'Shadow Business',
  description: 'Defeat the Village Shadow with at least 1500 Atoms collected',
  points: 3,
  conditions: {
    core: $(
      ['Measured',   'Mem', '32bit', atomsInCurrentLevel, '>=', 'Value', '', 1500],

      // Pop on score screen
      ['MeasuredIf', 'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.VillageShadow],
      ['',           'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['',           'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

// There are multiple barriers which can be passed by using bombs.
set.addAchievement({
  id: 629236,
  title: 'You Only Got One Shot',
  description: 'Beat Garden Level 1 by firing a single shot at most',
  points: 5,
  conditions: {
    core: $(
      // Total shots fired (=normal + power shots) must be at most 1.
      ['',        'Mem',   '16bit', totalShotsFired, '<=', 'Value', '', 1],
      // Pop on score screen
      ['',        'Mem',   '8bit',  currentLevel,    '=',  'Value', '', LevelEnum.Garden1],
      ['',        'Delta', '8bit',  gameState,       '=',  'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit',  gameState,       '=',  'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629237,
  title: 'Dracula\'s Favorite',
  description: 'Beat Garden Level 2 as Drac with initial base stats',
  points: 5,
  type: 'missable',
  conditions: {
    core: $(
      // Base Drac levels must be untouched
      ['', 'Mem', '8bit', baseHealth,      '=', 'Value', '', 9],
      ['', 'Mem', '8bit', baseAttackPower, '=', 'Value', '', 2],
      ['', 'Mem', '8bit', baseForcePower,  '=', 'Value', '', 3],

      // Character must be Drac
      ['',        'Mem',   '8bit', characterActive, '=', 'Value', '', CharacterActive.Drac],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Garden2],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});


const clouds1Pumpkin = 0x1884;

const greenHeartCollectedInSlot = (toolSlot) => {
  // Slot was empty (or contained another item - immediate switching is possible) and is now Health lvl. 3 (checkpoint hit)
  return [
    ['AndNext', 'Delta', '8bit', toolSlot, '!=', 'Value', '', 0x09],
    ['',        'Mem',   '8bit', toolSlot, '=',  'Value', '', 0x09, 1],
  ];
};


// As it is possible to pick up heart before the pumpkin is marked as destroyed,
// we have to use a checkpoint hit for collecting the heart (instead of a simple Mem/Delta check in the function above).
// This way the cheevo will pop regardless of what happened first.
set.addAchievement({
  id: 626068,
  title: 'Heart of the Clouds',
  description: 'Collect the secluded Heart in Clouds Level 1',
  points: 2,
  conditions: {
    core: $(
      // Pumpkin with heart must be destroyed
      ['', 'Mem', '16bit', clouds1Pumpkin, '=', 'Value', '', 0x00],

      // Context
      ['', 'Mem', '8bit', currentLevel, '=', 'Value', '', LevelEnum.Clouds1],
      ['', 'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
      ['', 'Value', '',  0, '=', 'Value', '', 1],
    ),
    alt2: $(
      ...greenHeartCollectedInSlot(toolSlot1),
    ),
    alt3: $(
      ...greenHeartCollectedInSlot(toolSlot2),
    ),
    alt4: $(
      ...greenHeartCollectedInSlot(toolSlot3),
    ),
    alt5: $(
      ...greenHeartCollectedInSlot(toolSlot4),
    ),
  },
});

const decoyActive = 0x08dc;

set.addAchievement({
  id: 625446,
  title: 'Clone Wars',
  description: 'Create a shadow clone of yourself in Clouds Level 2',
  points: 2,
  conditions: {
    core: $(
      // Pop if decoy created
      ['', 'Delta', '8bit', decoyActive, '=', 'Value', '', 0x00],
      ['', 'Mem',   '8bit', decoyActive, '=', 'Value', '', 0x02],

      // Context
      ['', 'Mem', '8bit', currentLevel, '=', 'Value', '', LevelEnum.Clouds2],
      ['', 'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 625445,
  title: 'Blast Radius',
  description: 'Find and use the right tool to defeat 12 enemies and pumpkins at once in Garden Level 2',
  points: 5,
  conditions: {
    core: $(
      // Make sure bomb was activated and player invincibility was active in last frame
      ['',          'Delta', '8bit',  playerState,             '=',  'Value', '', PlayerStateEnum.BombArmed],
      ['',          'Delta', '16bit', invincibilityTimer,      '=',  'Value', '', 0xffff],
      // Using SubSource to check if increase of enemies killed is >= 12
      ['SubSource', 'Delta', '8bit',  objectsEnemiesDestroyed],
      ['',          'Mem',   '8bit',  objectsEnemiesDestroyed, '>=', 'Value', '', 12],

      // Context
      ['', 'Mem', '8bit', currentLevel, '=', 'Value', '', LevelEnum.Garden2],
      ['', 'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const switchTimerActive = 0x3540;

set.addAchievement({
  id: 625447,
  title: 'Energy Saver',
  description: 'Beat the Garden Trial by only activating timer switches 2 times total',
  points: 10,
  conditions: {
    core: $(
      // Add hit if counter increased (= activated), lock if 3 (= allowed+1) activations
      ['PauseIf', 'Delta', '8bit', switchTimerActive, '<', 'Mem',   '8bit', switchTimerActive, 3],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.GardenTrial],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const gardenTrialDoor = 0x18fc;

set.addAchievement({
  id: 625448,
  title: 'Monet\'s Garden',
  description: 'Visit the locked part in the northwest of the Garden Trial',
  points: 2,
  conditions: {
    core: $(
      // Pop if door to locked garden part was opened
      ['', 'Delta', '16bit', gardenTrialDoor, '>', 'Value', '', 0x00],
      ['', 'Mem',   '16bit', gardenTrialDoor, '=', 'Value', '', 0x00],
      // Context
      ['', 'Mem',   '8bit',  currentLevel,    '=', 'Value', '', LevelEnum.GardenTrial],
      ['', 'Mem',   '8bit',  gameState,       '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629238,
  title: 'Wolfskin',
  description: 'Beat Atlantis Level 1 as Wolfie without healing',
  points: 3,
  conditions: {
    core: $(
      // Lock if healing occurred - needs timer > 2 check, in the first two frames the health is initialized
      ['AndNext', 'Mem',   '16bit', levelTime,     '>=', 'Value', '',     2],
      ['PauseIf', 'Delta', '8bit',  currentHealth, '<',  'Mem',   '8bit', currentHealth, 1],

      // Character must be Wolfie
      ['',        'Mem',   '8bit', characterActive, '=', 'Value', '', CharacterActive.Wolfie],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Atlantis1],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629349,
  title: 'Metal Detector',
  description: 'Beat the Atlantis Trial without getting damaged by mines',
  points: 10,
  conditions: {
    core: $(
      // Lock if damage occurred - needs timer > 2 check, in the first two frames the health is initialized
      ['AndNext', 'Mem',   '16bit', levelTime,     '>=', 'Value', '',     2],
      ['PauseIf', 'Delta', '8bit',  currentHealth, '>',  'Mem',   '8bit', currentHealth, 1],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.AtlantisTrial],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629351,
  title: 'Blood Thirst',
  description: 'Destroy at least 50 enemies and pumpkins as Drac in Temple Level 1',
  points: 3,
  conditions: {
    core: $(
      // Pop if 50 or more enemies & pumpkins destroyed
      ['',          'Delta', '8bit', objectsEnemiesDestroyed, '<',  'Value', '', 50],
      ['Measured%', 'Mem',   '8bit', objectsEnemiesDestroyed, '>=', 'Value', '', 50],

      // Only show Measured on correct character and level
      ['AndNext',    'Mem', '8bit', currentLevel,    '=', 'Value', '', LevelEnum.Temple1],
      ['MeasuredIf', 'Mem', '8bit', characterActive, '=', 'Value', '', CharacterActive.Drac],

      // Character must be Drac
      ['',        'Mem',   '8bit', characterActive, '=', 'Value', '', CharacterActive.Drac],

      // Context
      ['', 'Mem', '8bit', currentLevel, '=', 'Value', '', LevelEnum.Temple1],
      ['', 'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const totalMaxHealth = 0x0830;
const totalAttackPower = 0x0832;
const totalForcePower = 0x0834;

set.addAchievement({
  id: 630022,
  title: 'Minimal Force',
  description: 'Beat Temple Level 2 with all stats including relics at 15%/HP or lower',
  points: 5,
  type: 'missable',
  conditions: {
    core: $(
      // Total health/attack/force must be <= 15
      ['', 'Mem', '8bit', totalMaxHealth,   '<=', 'Value', '', 15],
      ['', 'Mem', '8bit', totalAttackPower, '<=', 'Value', '', 15],
      ['', 'Mem', '8bit', totalForcePower,  '<=', 'Value', '', 15],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Temple2],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630023,
  title: 'Here Be Dragons',
  description: 'Defeat the Dragon Shadow as Frank without taking damage, no invincibility allowed',
  points: 10,
  conditions: {
    core: $(
      // Lock on invincibility timer - this handles taking damage and also invincibility
      ['AndNext', 'Mem', '8bit',  playerState,        '<',  'Value', '', PlayerStateEnum.LevelFinishedAnimation],
      ['PauseIf', 'Mem', '16bit', invincibilityTimer, '!=', 'Value', '', 0,                                      1],

      // Character must be Frank
      ['',        'Mem',   '8bit', characterActive, '=', 'Value', '', CharacterActive.Frank],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.TempleDragonShadow],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const normalShotsFired = 0x085a;

set.addAchievement({
  id: 630024,
  title: 'Power Is All You Need',
  description: 'Beat Desert Level 1 by only firing power shots, no normal shots',
  points: 10,
  conditions: {
    core: $(
      // No normal shots allowed
      ['',   'Mem', '16bit', normalShotsFired, '=',  'Value', '', 0],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Desert1],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const hiddenPumpkinSwitch = 0x3501;

set.addAchievement({
  id: 630025,
  title: 'Pumpkin Arrow',
  description: 'Follow the pumpkin arrow and unlock the hidden bounty area in Desert Level 2',
  points: 5,
  conditions: {
    core: $(
      // Activating the switch will grant access to hidden area
      ['', 'Delta', '8bit', hiddenPumpkinSwitch, '=', 'Value', '', 0],
      ['', 'Mem',   '8bit', hiddenPumpkinSwitch, '=', 'Value', '', 1],

      // Context
      ['', 'Mem', '8bit', currentLevel, '=', 'Value', '', LevelEnum.Desert2],
      ['', 'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

/*
Force combo enhancing tools:
- Reflect Shot
- X-Ray Shot
- Doom Shot (tiers 1, 2, 3)
- Leech Shot (tiers 1, 2, 3)
- Magnet Shot
- Three-Way Shot
- Drain Shot (tiers 1, 2, 3)
- Double Shot
 */
const shotModifiers1 = 0x080c;
const shotModifiers2 = 0x080d;
const shotModifiers3 = 0x080e;

set.addAchievement({
  id: 630198,
  title: 'Superpowers',
  description: 'Beat the Desert Trial by having 3 or more force combo enhancing tools active at the same time',
  points: 3,
  conditions: {
    core: $(
      // Sum of flags must be at least 3 at one point
      ['AddSource', 'Mem', 'Bit4', shotModifiers1],
      ['AddSource', 'Mem', 'Bit5', shotModifiers1],
      ['AddSource', 'Mem', 'Bit6', shotModifiers1],
      ['AddSource', 'Mem', 'Bit7', shotModifiers1],
      ['AddSource', 'Mem', 'Bit0', shotModifiers2],
      ['AddSource', 'Mem', 'Bit1', shotModifiers2],
      ['AddSource', 'Mem', 'Bit2', shotModifiers2],
      ['AddSource', 'Mem', 'Bit3', shotModifiers2],
      ['AddSource', 'Mem', 'Bit7', shotModifiers2],
      ['AddSource', 'Mem', 'Bit0', shotModifiers3],
      ['AddSource', 'Mem', 'Bit1', shotModifiers3],
      ['AddSource', 'Mem', 'Bit2', shotModifiers3],
      ['AddSource', 'Mem', 'Bit3', shotModifiers3],
      ['',          'Mem', 'Bit4', shotModifiers3, '>=', 'Value', '', 3, 1],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.DesertTrial],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630026,
  title: 'Relicless',
  description: 'Beat the Desert Shadow without carrying any relics at any time',
  points: 5,
  conditions: {
    core: $(
      // Lock if any relic slot not empty
      ['OrNext',  'Mem', '8bit', relicSlot1, '!=', 'Value', '', 0],
      ['OrNext',  'Mem', '8bit', relicSlot2, '!=', 'Value', '', 0],
      ['OrNext',  'Mem', '8bit', relicSlot3, '!=', 'Value', '', 0],
      ['PauseIf', 'Mem', '8bit', relicSlot4, '!=', 'Value', '', 0, 1],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.DesertShadow],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const playerPositionX = 0x078c;
const playerPositionY = 0x0790;

// Wolfie's level finish animation takes 143 frames, so we go with 2.5 seconds (150 frames)
set.addAchievement({
  id: 625449,
  title: 'Young and Restless',
  description: 'As Wolfie, beat the Clouds Trial while never standing still for 2.5 seconds or more',
  points: 10,
  conditions: {
    core: $(
      // Add a checkpoint hit when starting the level
      ['AndNext', 'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.CloudsTrial],
      ['AndNext', 'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.LevelStart],
      ['',        'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame,     1],

      // Reset hits of global ResetIf below (so it restarts accumulating hits) if moving
      ['OrNext',      'Delta', '32bit', playerPositionX, '!=', 'Mem',   '32bit', playerPositionX],
      ['AndNext',     'Delta', '32bit', playerPositionY, '!=', 'Mem',   '32bit', playerPositionY],
      ['ResetNextIf', 'Mem',   '8bit',  currentLevel,    '=',  'Value', '',      LevelEnum.CloudsTrial],

      // Reset checkpoint hit if accumulated enough hits
      ['AndNext', 'Mem', '8bit', currentLevel, '=', 'Value', '', LevelEnum.CloudsTrial],
      ['ResetIf', 'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame,  150],

      // Character must be Wolfie
      ['',        'Mem',   '8bit', characterActive, '=', 'Value', '', CharacterActive.Wolfie],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.CloudsTrial],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],

      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630027,
  title: 'Marksman',
  description: 'Beat the 4 Clouds Shadow Mini-bosses with a total of 8 shots or less',
  points: 5,
  conditions: {
    core: $(
      // Require total shots to be at max 8
      ['',   'Mem',   '16bit', totalShotsFired, '<=', 'Value', '', 8],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.CloudsShadow],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630028,
  title: 'Big Drops',
  description: 'Collect 500 or more Atoms at once, 40 times, in Factory Level 1',
  points: 3,
  conditions: {
    core: $(
      // Only evaluate SubSource if value actually went up (avoid Underflow)
      ['AndNext',   'Delta', '32bit', atomsInCurrentLevel, '<=', 'Mem',   '32bit', atomsInCurrentLevel],
      // Collect 40 hits of 500+ Atoms collected
      ['SubSource', 'Delta', '32bit', atomsInCurrentLevel],
      ['Measured',  'Mem',   '32bit', atomsInCurrentLevel, '>=', 'Value', '',      500,                 40],

      // Context
      ['MeasuredIf', 'Mem', '8bit', currentLevel, '=', 'Value', '', LevelEnum.Factory1],
      ['',           'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const factory2Pumpkin1 = 0x1958;
const factory2Pumpkin2 = 0x195c;
const factory2Pumpkin3 = 0x1978;
const factory2Pumpkin4 = 0x197c;
const factory2ScarecrowPumpkins = [factory2Pumpkin1, factory2Pumpkin2, factory2Pumpkin3, factory2Pumpkin4];

set.addAchievement({
  id: 630029,
  title: 'Under the Watch',
  description: 'Destroy the 4 pumpkins guarded by the scarecrow in Factory Level 2',
  points: 2,
  conditions: {
    core: $(
      ...allPumpkinsDestroyed(factory2ScarecrowPumpkins),

      // Context
      ['', 'Mem', '8bit', currentLevel, '=', 'Value', '', LevelEnum.Factory2],
      ['', 'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const ailmentBitflags = 0x07e5;

set.addAchievement({
  id: 630199,
  title: 'Shadow Boxing',
  description: 'Beat the Factory Shadow without suffering from the confused status effect at any time',
  points: 5,
  conditions: {
    core: $(
      // Lock if confused
      ['PauseIf', 'Mem',   'Bit4', ailmentBitflags, '=', 'Value', '', 1, 1],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.FactoryShadow],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const liveObjectCount = 0x3544;

set.addAchievement({
  id: 625442,
  title: 'Divide & Conquer',
  description: 'Do not allow more than 4 Pumpkin heads at one time in Castle Level 3',
  points: 3,
  conditions: {
    core: $(
      // Lock if more than a maximum amount of objects are in live object array. This level only has one enemy type.
      // During the explosion of a bigger head (which will be split into 2 smaller ones) there is a short time when
      // the old and the 2 new co-exist, making the count 1 higher, so the PauseLock check is "> 5" instead of "> 4"
      ['PauseIf', 'Mem',   '8bit', liveObjectCount, '>', 'Value', '', 5, 1],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Castle3],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630200,
  title: 'Boss Rush',
  description: 'Beat the boss rush in Castle Levels 1 to 4 in 60 seconds total in-game time',
  points: 10,
  conditions: {
    core: $(
      // Checkpoint hit if entering Castle 1 (to avoid entering at Castle 2 or 3, which would also lead to Castle 4)
      ['AndNext', 'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Castle1],
      ['AndNext', 'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.LevelStart],
      ['',        'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame,     1],

      // Timer adds hits while in-game, so in-between score screens don't count
      ['AddHits', 'Mem',   '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
      ['PauseIf', 'Value', '',     0,         '=', 'Value', '', 1,                    3600],

      // Pop on score screen of Castle 4
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Castle4],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630201,
  title: 'Stand Your Ground',
  description: 'Defeat Sergeant Smash without moving left or right',
  points: 5,
  conditions: {
    core: $(
      // Add hit if moved left or right while in-game
      ['AndNext', 'Delta', '8bit',  gameState,       '=',  'Value', '',      GameStateEnum.InGame],
      ['PauseIf', 'Delta', '32bit', playerPositionX, '!=', 'Mem',   '32bit', playerPositionX,      1],

      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.CastleSergeantSmash],
      ['',        'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

// Health tools are the contiguous range 0x07 (Lv. 1, red) to 0x0a (Maximum, black), Medicine (0x54) does not restore health.
// Tool slots never change during the level start phase, so one gameState check is enough.
const checkToolSlotsForAnyHealthAtStartOfLevel = () => {
  const conditions = [];
  // For all 4 tool slots
  for (let toolSlot of toolSlots) {
    conditions.push(...[
      ['AndNext', 'Mem', '8bit', toolSlot,  '>=', 'Value', '', 0x07],
      ['AndNext', 'Mem', '8bit', toolSlot,  '<=', 'Value', '', 0x0a],
      ['PauseIf', 'Mem', '8bit', gameState, '=',  'Value', '', GameStateEnum.LevelStart, 1],
    ]);
  }
  return conditions;
};

set.addAchievement({
  id: 630202,
  title: 'It\'s All About Balance',
  description: 'As Wolfie, finish a level while healing yourself 3 or more times without carrying health items at the start of the level',
  points: 3,
  conditions: {
    core: $(
      // Lock if brought any health into level
      ...checkToolSlotsForAnyHealthAtStartOfLevel(),

      // Require 3 healing hits - needs timer > 2 check, in the first two frames the health is initialized
      ['AndNext', 'Mem',   '16bit', levelTime,     '>=', 'Value', '',     2],
      ['',        'Delta', '8bit',  currentHealth, '<',  'Mem',   '8bit', currentHealth, 3],

      // Character must be Wolfie
      ['',        'Mem',   '8bit', characterActive, '=', 'Value', '', CharacterActive.Wolfie],

      // Pop on any score screen
      ['',        'Delta', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState, '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630203,
  title: 'Frankly Harmless',
  description: 'As Frank, finish any Trial without defeating any enemies or pumpkins at all',
  points: 5,
  conditions: {
    core: $(
      // No enemies killed or pumpkins destroyed
      ['', 'Mem', '8bit', objectsEnemiesDestroyed, '=', 'Value', '', 0],

      // Character must be Frank
      ['', 'Mem', '8bit', characterActive, '=', 'Value', '', CharacterActive.Frank],

      // Level can be any Trial
      ...getLevelRequirement(timeTrialLevels),

      // Pop on any score screen
      ['',        'Delta', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState, '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const atlantis2pumpkinAddresses = [
  0x17d8, 0x17dc, 0x17e0, 0x17e4, 0x17e8, 0x17ec, 0x17f0, 0x17f4, 0x17f8,
  0x17fc, 0x1800, 0x1804, 0x1808, 0x180c, 0x1820, 0x1824, 0x1828, 0x182c,
  0x1830, 0x1834, 0x1838, 0x183c, 0x1844, 0x1848, 0x1870, 0x1874, 0x1878,
  0x187c, 0x1888, 0x1898, 0x189c, 0x18a0, 0x18a8, 0x18ac, 0x18b0, 0x18b4,
  0x18e4, 0x18fc, 0x1918, 0x1924, 0x1928, 0x192c, 0x1930, 0x1934, 0x1938,
  0x193c, 0x1940, 0x1944, 0x1948, 0x194c, 0x1950, 0x1954, 0x1958, 0x195c,
  0x1964, 0x1968, 0x196c, 0x1970, 0x1980, 0x1984, 0x1988, 0x1990, 0x199c,
  0x19a0, 0x19a8, 0x19ac, 0x1a00, 0x1a30, 0x1a34, 0x1a38, 0x1a40, 0x1a44,
  0x1a48, 0x198c, 0x197c,
];

const addHitsPerAddress = (addresses) => {
  const result = [];
  for (let address of addresses) {
    // In-Game check is needed, else a lot of hits are added on level entry / level object load
    result.push(['AndNext', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame]);
    // Narrow to 1-3, pumpkins will always be in this range
    result.push(['AndNext', 'Delta', '16bit', address, '>=', 'Value', '', 1]);
    result.push(['AndNext', 'Delta', '16bit', address, '<=', 'Value', '', 3]);
    // Mem = 0 also excludes bomb kills, bomb damage will let value overflow.
    result.push(['AddHits', 'Mem', '16bit', address, '=', 'Value', '', 0]);
  }
  return result;
};

set.addAchievement({
  id: 626069,
  title: 'Halloween\'s Over',
  description: 'Find and destroy 70 or more pumpkins in Atlantis Level 2 without using bombs',
  points: 5,
  conditions: {
    core: $(
      // We have to use AddHits here, on destruction the level object hit points will go to 0x0000 (from 1, 2 or 3 - depending on pumpkin type).
      // If destroyed with a bomb, pumpkins take e.g. 8 damage (depending on bomb) and the value wraps around to a large value like 0xfffa, so we can not just use AddSource = 0.
      // Pumpkins will only take exactly one HP damage from shots.
      ...addHitsPerAddress(atlantis2pumpkinAddresses),
      ['Measured%',  'Value', '',     0,            '=', 'Value', '', 1,                   70],

      // Reset Hits (also for Measured% UX)
      ['ResetIf', 'Mem', '8bit', playerState, '=', 'Value', '', PlayerStateEnum.BombArmed],

      // Context
      ['MeasuredIf', 'Mem', '8bit', currentLevel, '=', 'Value', '', LevelEnum.Atlantis2],
      ['',           'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630030,
  title: 'Second Life',
  description: 'Reach the end of any level after cheating death',
  points: 2,
  conditions: {
    core: $(
      // Store hit if revived from death (only possible with Reanimator - changes player status from dying to standing)
      ['AndNext', 'Mem',   '8bit', gameState,   '=', 'Value', '', GameStateEnum.InGame],
      ['AndNext', 'Delta', '8bit', playerState, '=', 'Value', '', PlayerStateEnum.Dying],
      ['',        'Mem',   '8bit', playerState, '=', 'Value', '', PlayerStateEnum.Standing, 1],

      // Pop on score screen of any level
      ['',        'Delta', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState, '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

// No Measured here, as it would show up always in every Trial
set.addAchievement({
  id: 630031,
  title: 'Worth the Money',
  description: 'Collect 25,000 Atoms in any Trial in a single run and finish it',
  points: 5,
  conditions: {
    core: $(
      // 25k Atoms collected
      ['', 'Mem', '32bit', atomsInCurrentLevel, '>=', 'Value', '', 25000],

      // Level must be any Trial
      ...getLevelRequirement(timeTrialLevels),

      // Pop on score screen
      ['',        'Delta', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState, '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630204,
  title: 'Shop \'Til You Drop',
  description: 'Buy 6 items in Igor\'s shop in a single shop visit',
  points: 2,
  conditions: {
    core: $(
      // Add hit if Atoms in bank decreased while in shop, the only way this can happen is by buying a Tool or Relic.
      // 6 Hits are required for cheevo to pop. Hits are reset when going back to level select screen.
      ['', 'Delta', '32bit', totalAtomsInBank, '>', 'Mem', '32bit', totalAtomsInBank, 6],

      // Context: Must be in shop
      ['', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.ShopOptions],
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630205,
  title: 'Ninja Skills',
  description: 'Defeat an enemy or pumpkin with a wall-piercing shot while being invincible',
  points: 3,
  conditions: {
    core: $(
      // While invincible and X-Ray modifier is active, enemy/pumpkin desytroyed count should go up
      ['', 'Mem',   '16bit', invincibilityTimer,      '>', 'Value', '',     0],
      ['', 'Mem',   'Bit5',  shotModifiers1,          '=', 'Value', '',     1],
      ['', 'Delta', '8bit',  objectsEnemiesDestroyed, '<', 'Mem',   '8bit', objectsEnemiesDestroyed],

      // Context: Must be in in-game
      ['', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

// "No tools equipped" at start of level is required, as tools can be dropped and picked up in another slot.
// There would be no way to distinguish between a genuinely found tool and one dropped and later picked up again.
set.addAchievement({
  id: 630206,
  title: 'Saving for Later',
  description: 'Enter a level with no tools equipped, and fill up all tool slots before finishing the level',
  points: 5,
  conditions: {
    core: $(
      // Lock if entered level with tool equipped in slots 1 or 2
      ['OrNext',  'Mem',   '8bit', toolSlot1, '!=', 'Value', '', 0],
      ['AndNext', 'Mem',   '8bit', toolSlot2, '!=', 'Value', '', 0],
      ['AndNext', 'Delta', '8bit', gameState, '=',  'Value', '', GameStateEnum.LevelStart],
      ['PauseIf', 'Mem',   '8bit', gameState, '=',  'Value', '', GameStateEnum.InGame,     1],

      // Lock if entered level with tool equipped in slots 3 or 4
      ['OrNext',  'Mem',   '8bit', toolSlot3, '!=', 'Value', '', 0],
      ['AndNext', 'Mem',   '8bit', toolSlot4, '!=', 'Value', '', 0],
      ['AndNext', 'Delta', '8bit', gameState, '=',  'Value', '', GameStateEnum.LevelStart],
      ['PauseIf', 'Mem',   '8bit', gameState, '=',  'Value', '', GameStateEnum.InGame,     1],

      // Any slot was not filled last frame
      ['OrNext', 'Delta', '8bit', toolSlot1, '=',  'Value', '', 0],
      ['OrNext', 'Delta', '8bit', toolSlot2, '=',  'Value', '', 0],
      ['OrNext', 'Delta', '8bit', toolSlot3, '=',  'Value', '', 0],
      ['',       'Delta', '8bit', toolSlot4, '=',  'Value', '', 0],
      // Now all slots are filled with tools
      ['',       'Mem',   '8bit', toolSlot1, '!=', 'Value', '', 0],
      ['',       'Mem',   '8bit', toolSlot2, '!=', 'Value', '', 0],
      ['',       'Mem',   '8bit', toolSlot3, '!=', 'Value', '', 0],
      ['',       'Mem',   '8bit', toolSlot4, '!=', 'Value', '', 0],

      // Context: Must be in in-game
      ['', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630032,
  title: 'Self Improvement',
  description: 'Consume a stat-increasing Scroll',
  points: 2,
  conditions: {
    core: $(
      // Context: Must be in-game
      ['', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
    ),
    alt1: $(
      // Attack power: +2%
      ['SubSource', 'Delta', '8bit', baseAttackPower],
      ['',          'Mem',   '8bit', baseAttackPower, '=', 'Value', '', 2],
    ),
    alt2: $(
      // Force power: +4%
      ['SubSource', 'Delta', '8bit', baseForcePower],
      ['',          'Mem',   '8bit', baseForcePower, '=', 'Value', '', 4],
    ),
    alt3: $(
      // Health: +2 HP
      ['SubSource', 'Delta', '8bit', baseHealth],
      ['',          'Mem',   '8bit', baseHealth, '=', 'Value', '', 2],
    ),
  },
});

const luckGauntletRelic = 0x12;
const armorGauntletRelic = 0x15;
const attackGauntletRelic = 0x19;
const forceGauntletRelic = 0x1d;
const blueRelics = [luckGauntletRelic, armorGauntletRelic, attackGauntletRelic, forceGauntletRelic];

const levelUpConditions = () => {
  const conditions = {
    core: $(
      // Context: Relics bought in shop or found in-game
      ['OrNext', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
      ['',       'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.ShopOptions],
    ),
  };
  let count = 1;
  for (let currentSlot of relicSlots) {
    for (let currentRelic of blueRelics) {
      // currentRelic was picked up in currentSlot
      const arr = [
        ['', 'Delta', '8bit', currentSlot, '!=', 'Value', '', currentRelic],
        ['', 'Mem',   '8bit', currentSlot, '=',  'Value', '', currentRelic],
      ];
      conditions['alt' + count] = $(...arr);
      count += 1;
    }
  }
  return conditions;
};

// Relics can be bought in shop or acquired via "???" Gauntlet drops in-game
set.addAchievement({
  id: 630207,
  title: 'Level Up',
  description: 'Get your first blue-tier relic',
  points: 2,
  // This will create 16 alts (4 possible slots x 4 possible blue relics).
  // Taking the safe route here, before there was a version which had 4 alts, with Delta = 0 and then
  // all 4 possible relics OrNext'ed for a slot, but relics can be dropped and instantly replaced, so slots never have to be 0.
  conditions: levelUpConditions(),
});

set.addAchievement({
  id: 630033,
  title: 'Relics to the Rescue',
  description: 'Use Relics to improve your stats by either +20% Attack Power or +40% Force Power',
  points: 3,
  conditions: {
    core: $(
      // Context: Relics can be bought (and equipped) in shop or found in-game (via "???" Gauntlet drops)
      ['OrNext', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
      ['',       'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.ShopOptions],
    ),
    alt1: $(
      // Attack power
      ['', 'Delta', '8bit', relicAttackBonus, '<',  'Value', '', 20],
      ['', 'Mem',   '8bit', relicAttackBonus, '>=', 'Value', '', 20],
    ),
    alt2: $(
      // Force power
      ['', 'Delta', '8bit', relicForceBonus, '<',  'Value', '', 40],
      ['', 'Mem',   '8bit', relicForceBonus, '>=', 'Value', '', 40],
    ),
  },
});


const greenRelics = [0x13, 0x16, 0x1a, 0x1e];

// Deliberately no cheat protection here, as no cheat helps in reaching this achievement.
// The main use case is the shop ("???" drops are very rare), where the relics can be bought with enough Atoms.
set.addAchievement({
  id: 630034,
  title: 'All Green',
  description: 'Have a full set of 4 maxed-out green relics',
  points: 10,
  conditions: {
    core: $(
      // Relic slot 1 can contain any green relic
      ['OrNext', 'Mem', '8bit', relicSlot1, '=', 'Value', '', greenRelics[0]],
      ['OrNext', 'Mem', '8bit', relicSlot1, '=', 'Value', '', greenRelics[1]],
      ['OrNext', 'Mem', '8bit', relicSlot1, '=', 'Value', '', greenRelics[2]],
      ['', 'Mem', '8bit', relicSlot1, '=', 'Value', '', greenRelics[3]],
      // Same for slots 2, 3, 4
      ['OrNext', 'Mem', '8bit', relicSlot2, '=', 'Value', '', greenRelics[0]],
      ['OrNext', 'Mem', '8bit', relicSlot2, '=', 'Value', '', greenRelics[1]],
      ['OrNext', 'Mem', '8bit', relicSlot2, '=', 'Value', '', greenRelics[2]],
      ['', 'Mem', '8bit', relicSlot2, '=', 'Value', '', greenRelics[3]],
      ['OrNext', 'Mem', '8bit', relicSlot3, '=', 'Value', '', greenRelics[0]],
      ['OrNext', 'Mem', '8bit', relicSlot3, '=', 'Value', '', greenRelics[1]],
      ['OrNext', 'Mem', '8bit', relicSlot3, '=', 'Value', '', greenRelics[2]],
      ['', 'Mem', '8bit', relicSlot3, '=', 'Value', '', greenRelics[3]],
      ['OrNext', 'Mem', '8bit', relicSlot4, '=', 'Value', '', greenRelics[0]],
      ['OrNext', 'Mem', '8bit', relicSlot4, '=', 'Value', '', greenRelics[1]],
      ['OrNext', 'Mem', '8bit', relicSlot4, '=', 'Value', '', greenRelics[2]],
      ['', 'Mem', '8bit', relicSlot4, '=', 'Value', '', greenRelics[3]],

      // Context: Relics bought in shop or found in-game (via "???" Gauntlet drops)
      ['OrNext', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
      ['',       'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.ShopOptions],
    ),
    alt1: $(
      ['', 'Delta', '8bit', relicSlot1, '!=', 'Mem', '8bit', relicSlot1],
    ),
    alt2: $(
      ['', 'Delta', '8bit', relicSlot2, '!=', 'Mem', '8bit', relicSlot2],
    ),
    alt3: $(
      ['', 'Delta', '8bit', relicSlot3, '!=', 'Mem', '8bit', relicSlot3],
    ),
    alt4: $(
      ['', 'Delta', '8bit', relicSlot4, '!=', 'Mem', '8bit', relicSlot4],
    ),
  },
});


// No pause-lock here, doesn't matter if player reached shop via skip-level
set.addAchievement({
  id: 630035,
  title: 'Cloak of Safety',
  description: 'Acquire the Cloak of Safety, the ultimate defense',
  points: 3,
  conditions: {
    core: $(
      // Context: Either picked up in game (via "???" Amulet drop), or bought in shop
      ['OrNext', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],
      ['',       'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.ShopOptions],
    ),
    alt1: $(
      ['', 'Delta', '8bit', relicSlot1, '!=', 'Value', '', 0x23],
      ['', 'Mem',   '8bit', relicSlot1, '=',  'Value', '', 0x23],
    ),
    alt2: $(
      ['', 'Delta', '8bit', relicSlot2, '!=', 'Value', '', 0x23],
      ['', 'Mem',   '8bit', relicSlot2, '=',  'Value', '', 0x23],
    ),
    alt3: $(
      ['', 'Delta', '8bit', relicSlot3, '!=', 'Value', '', 0x23],
      ['', 'Mem',   '8bit', relicSlot3, '=',  'Value', '', 0x23],
    ),
    alt4: $(
      ['', 'Delta', '8bit', relicSlot4, '!=', 'Value', '', 0x23],
      ['', 'Mem',   '8bit', relicSlot4, '=',  'Value', '', 0x23],
    ),
  },
});

set.addAchievement({
  id: 630036,
  title: 'Using the Force',
  description: 'Reach a base Force Level stat of at least 20% without Relics',
  points: 5,
  conditions: {
    core: $(
      // Pop if base force level was increased to >= 20%
      ['', 'Delta', '8bit', baseForcePower, '<',  'Value', '', 20],
      ['', 'Mem',   '8bit', baseForcePower, '>=', 'Value', '', 20],

      // Context - upgrade is always applied in-game
      ['',        'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630037,
  title: 'This Isn\'t Even My Final Form',
  description: 'Reach a base Attack Level stat of at least 30% without Relics',
  points: 5,
  conditions: {
    core: $(
      // Pop if base attack level was increased to >= 30%
      ['', 'Delta', '8bit', baseAttackPower, '<',  'Value', '', 30],
      ['', 'Mem',   '8bit', baseAttackPower, '>=', 'Value', '', 30],

      // Context - upgrade is always applied in-game
      ['',        'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630038,
  title: 'A Pumpkin a Day',
  description: 'Increase your base health stat to at least 40 HP without Relics',
  points: 5,
  conditions: {
    core: $(
      // Pop if base force level was increased to >= 40 HP
      ['', 'Delta', '8bit', baseHealth, '<',  'Value', '', 40],
      ['', 'Mem',   '8bit', baseHealth, '>=', 'Value', '', 40],

      // Context - upgrade is always applied in-game
      ['',        'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 630039,
  title: 'Igor\'s Favorite',
  description: 'Hold a bank total of 50,000 Atoms',
  points: 5,
  conditions: {
    core: $(
      // Pop if total atoms reached 50k
      ['', 'Delta', '32bit', totalAtomsInBank, '<',  'Value', '', 50000],
      ['', 'Mem',   '32bit', totalAtomsInBank, '>=', 'Value', '', 50000],

      // Context - total number of atoms is updated on score screen
      ['',        'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const countBadges = (levelIds, tier, amount) => {
  const conditions = [];
  // Delta
  for (let levelId of levelIds) {
    conditions.push(['AddSource', 'Delta', '8bit', 0x35b8 + levelId, '/', 'Value', '', tier]);
  }
  conditions.push(['', 'Value', '', 0, '=', 'Value', '', amount - 1]);

  // Mem
  for (let levelId of levelIds) {
    conditions.push(['AddSource', 'Mem', '8bit', 0x35b8 + levelId, '/', 'Value', '', tier]);
  }
  conditions.push(['', 'Value', '', 0, '=', 'Value', '', amount]);
  return conditions;
};


set.addAchievement({
  id: 629093,
  title: 'Silver Lining',
  description: 'Finish all 16 regular levels on Silver or higher',
  points: 10,
  conditions: {
    core: $(
      ...countBadges(regularLevels, BadgeTier.Silver, regularLevels.length),
      // Pop on score screen
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629094,
  title: 'Silver Sweep',
  description: 'Finish all 8 time trials and 13 boss levels on Silver or higher',
  points: 10,
  conditions: {
    core: $(
      ...countBadges([...timeTrialLevels, ...bossLevels], BadgeTier.Silver, timeTrialLevels.length + bossLevels.length),
      // Pop on score screen
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629095,
  title: 'Gold Medal',
  description: 'Finish all 16 regular levels on Gold or higher',
  points: 10,
  conditions: {
    core: $(
      ...countBadges(regularLevels, BadgeTier.Gold, regularLevels.length),
      // Pop on score screen
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629096,
  title: 'Gold Rush',
  description: 'Finish all 8 time trials on Gold or higher',
  points: 10,
  conditions: {
    core: $(
      ...countBadges(timeTrialLevels, BadgeTier.Gold, timeTrialLevels.length),
      // Pop on score screen
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629097,
  title: 'Gold Standard',
  description: 'Finish all 13 boss levels on Gold or higher',
  points: 10,
  conditions: {
    core: $(
      ...countBadges(bossLevels, BadgeTier.Gold, bossLevels.length),
      // Pop on score screen
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629092,
  title: 'First Crystal',
  description: 'Achieve your first Crystal ranking',
  points: 2,
  conditions: {
    core: $(
      ...countBadges([...regularLevels, ...timeTrialLevels, ...bossLevels], BadgeTier.Crystal, 1),
      // Pop on score screen
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629098,
  title: 'Crystal Collection',
  description: 'Achieve 10 Crystal ranking',
  points: 10,
  conditions: {
    core: $(
      ...countBadges([...regularLevels, ...timeTrialLevels, ...bossLevels], BadgeTier.Crystal, 10),
      // Pop on score screen
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629099,
  title: 'Crystallized',
  description: 'Achieve 20 Crystal rankings',
  points: 10,
  conditions: {
    core: $(
      ...countBadges([...regularLevels, ...timeTrialLevels, ...bossLevels], BadgeTier.Crystal, 20),
      // Pop on score screen
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629100,
  title: 'Five of a Kind',
  description: 'Achieve all Crystal rankings and unlock a new character',
  points: 25,
  conditions: {
    core: $(
      ...countBadges([...regularLevels, ...timeTrialLevels, ...bossLevels], BadgeTier.Crystal, regularLevels.length + timeTrialLevels.length + bossLevels.length),
      // Pop on score screen
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});


set.addAchievement({
  id: 629101,
  title: 'Different Perspective',
  description: 'Beat the Cemetery Zone on a new game with an unlocked character',
  points: 3,
  conditions: {
    core: $(
      // Character must be Mina or Drew
      ['OrNext', 'Mem', '8bit', characterActive, '=', 'Value', '', CharacterActive.Mina],
      ['',       'Mem', '8bit', characterActive, '=', 'Value', '', CharacterActive.Drew],

      // Pop on score screen
      ['', 'Mem',   '8bit', maxLevelUnlocked, '=', 'Value', '', LevelEnum.CemeteryShadow],
      ['', 'Mem',   '8bit', currentLevel,     '=', 'Value', '', LevelEnum.CemeteryShadow],
      ['', 'Delta', '8bit', gameState,        '=', 'Value', '', GameStateEnum.InGame],
      ['', 'Mem',   '8bit', gameState,        '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

set.addAchievement({
  id: 629102,
  title: 'New Game Plus',
  description: 'Beat the game with an unlocked character',
  points: 25,
  conditions: {
    core: $(
      // Character must be Mina or Drew
      ['OrNext', 'Mem', '8bit', characterActive, '=', 'Value', '', 3],
      ['',       'Mem', '8bit', characterActive, '=', 'Value', '', 4],

      // Pop on score screen
      ['', 'Mem',   '8bit', maxLevelUnlocked, '=', 'Value', '', LevelEnum.CastleSergeantSmash],
      ['', 'Mem',   '8bit', currentLevel,     '=', 'Value', '', LevelEnum.CastleSergeantSmash],
      ['', 'Delta', '8bit', gameState,        '=', 'Value', '', GameStateEnum.InGame],
      ['', 'Mem',   '8bit', gameState,        '=', 'Value', '', GameStateEnum.ScoreScreen],
      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});


/* ========= LEADERBOARDS ========= */

// Timed leaderboards
const timedLeaderboards = [
  [LevelEnum.CemeteryTrial,       'Cemetery Trial'],
  [LevelEnum.VillageTrial,        'Village Trial'],
  [LevelEnum.GardenTrial,         'Garden Trial'],
  [LevelEnum.AtlantisTrial,       'Atlantis Trial'],
  [LevelEnum.TempleTrial,         'Temple Trial'],
  [LevelEnum.DesertTrial,         'Desert Trial'],
  [LevelEnum.CloudsTrial,         'Clouds Trial'],
  [LevelEnum.FactoryTrial,        'Factory Trial'],
  [LevelEnum.CemeteryShadow,      'Cemetery Shadow'],
  [LevelEnum.VillageShadow,       'Village Shadow'],
  [LevelEnum.GardenShadow,        'Pumpkin Boss'],
  [LevelEnum.AtlantisShadow,      'Atlantis Shadow'],
  [LevelEnum.TempleDragonShadow,  'Dragon Boss'],
  [LevelEnum.DesertShadow,        'Desert Shadow'],
  [LevelEnum.CloudsShadow,        'Clouds Shadow'],
  [LevelEnum.FactoryShadow,       'Factory Shadow'],
  [LevelEnum.CastleSergeantSmash, 'Sergeant Smash'],
];

/*
Manually tested cases:
[x] Finish level submits LB
[x] Finish special level Castle 1-4 submits LB
[x] Invincibility Cheat cancels LB
[x] Level Skip Cheat cancels LB
[x] Level Exit Code cancels LB
[x] Game Over with Continue (back to Level select) cancels LB
[x] Game Over without Continue (Game restart) cancels LB
*/
for (let timedLeaderboard of timedLeaderboards) {
  const levelId = timedLeaderboard[0];
  let name = timedLeaderboard[1];
  let prefix = name.includes('Trial') ? 'Finish the ' : 'Beat the ';
  if (LevelEnum.CastleSergeantSmash) {
    prefix = 'Beat ';
  }
  let counter = 0;

  set.addLeaderboard({
    id: 169229 + counter,
    title: name + ' Speedrun',
    description: prefix + name + ' as fast as possible',
    lowerIsBetter: true,
    type: 'FRAMES',
    conditions: {
      start: $(
        ['', 'Mem',   '8bit', currentLevel, '=', 'Value', '', levelId],
        ['', 'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.LevelStart],
        ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ),
      cancel: {
        core: $(
          ['', 'Value', '', 1, '=', 'Value', '', 1],
        ),
        alt1: $(
          // If player leaves the level with code or dies
          ['', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.LevelSelect],
        ),
        alt2: $(
          // If player uses invincibility cheat
          ['', 'Mem', '8bit', invincibilityCheat, '=', 'Value', '', 3],
        ),
        alt3: $(
          // If player uses "Skip level" cheat
          ['AddSource', 'Mem',   '8bit', buttonsPressed,         '&', 'Value', '', 0x41],
          ['AndNext',   'Value', '',     0,                      '=', 'Value', '', 0x41],
          ['',          'Mem',   '8bit', shoulderButtonsPressed, '=', 'Value', '', 0xff],
        ),
      },
      submit: $(
        ['', 'Mem',   '8bit', currentLevel, '=', 'Value', '', levelId],
        ['', 'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
        ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ),
      value: $(
        ['Measured', 'Mem', '16bit', levelTime],
      ),
    },
  });
  counter += 1;
}

// Special case: Boss Rush Leaderboard - sum of 4 levels, so we can not just take the levelTime of the last level
/*
Manually tested cases:
[ ] Finish level submits LB with total time, not only last level time
[ ] Entering in Castle 2 does not trigger the LB
*/
set.addLeaderboard({
  id: 169246,
  title: 'Castle Boss Rush Speedrun',
  description: 'Beat the Castle Boss Rush as fast as possible',
  lowerIsBetter: true,
  type: 'FRAMES',
  conditions: {
    start: $(
      ['', 'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Castle1],
      ['', 'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.LevelStart],
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
    ),
    cancel: {
      core: $(
        ['', 'Value', '', 1, '=', 'Value', '', 1],
      ),
      alt1: $(
        // If player leaves the level with code or dies
        ['', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.LevelSelect],
      ),
      alt2: $(
        // If player uses invincibility cheat
        ['', 'Mem', '8bit', invincibilityCheat, '=', 'Value', '', 3],
      ),
      alt3: $(
        // If player uses "Skip level" cheat
        ['AddSource', 'Mem',   '8bit', buttonsPressed,         '&', 'Value', '', 0x41],
        ['AndNext',   'Value', '',     0,                      '=', 'Value', '', 0x41],
        ['',          'Mem',   '8bit', shoulderButtonsPressed, '=', 'Value', '', 0xff],
      ),
    },
    submit: $(
      ['', 'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Castle4],
      ['', 'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
    ),
    value: $(
      // Measure total in-game time for all 4 levels
      ['Measured','Mem','8bit',gameState,'=','Value','',GameStateEnum.InGame],
    ),
  },
});

// Atom leaderboards
const atomLeaderboards = [
  [LevelEnum.Cemetery1, 'Cemetery Level 1'],
  [LevelEnum.Cemetery2, 'Cemetery Level 2'],
  [LevelEnum.Village1,  'Village Level 1'],
  [LevelEnum.Village2,  'Village Level 2'],
  [LevelEnum.Garden1,   'Garden Level 1'],
  [LevelEnum.Garden2,   'Garden Level 2'],
  [LevelEnum.Atlantis1, 'Atlantis Level 1'],
  [LevelEnum.Atlantis2, 'Atlantis Level 2'],
  [LevelEnum.Temple1,   'Temple Level 1'],
  [LevelEnum.Temple2,   'Temple Level 2'],
  [LevelEnum.Desert1,   'Desert Level 1'],
  [LevelEnum.Desert2,   'Desert Level 2'],
  [LevelEnum.Clouds1,   'Clouds Level 1'],
  [LevelEnum.Clouds2,   'Clouds Level 2'],
  [LevelEnum.Factory1,  'Factory Level 1'],
  [LevelEnum.Factory2,  'Factory Level 2'],
];

/*
Manually tested cases:
[x] Finish level submits LB
[x] Invincibility Cheat does not instant submit LB
[x] Level Skip Cheat does not instant submit LB
[x] Level Exit Code does not instant submit LB
[x] Game Over with Continue (back to Level select) does not instant submit LB
[x] Game Over without Continue (Game restart) does not instant submit LB
*/
for (let atomLeaderboard of atomLeaderboards) {
  const levelId = atomLeaderboard[0];
  const name = atomLeaderboard[1];
  let counter = 0;

  set.addLeaderboard({
    id: 169122 + counter,
    title: name + ' Atoms',
    description: 'Collect as many Atoms as possible in ' + name,
    lowerIsBetter: false,
    type: 'SCORE',
    conditions: {
      start: {
        core: $(
          // Trigger at end of level
          ['', 'Mem',   '8bit', currentLevel, '=', 'Value', '', levelId],
          ['', 'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
          ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
          ...invincibilityCheatProtection(),
          ...skipLevelCheatProtection(),
        ),
        alt1: $(
          // Reset if player exits level with code or dies
          ...levelSelectReset(),
        ),
      },
      cancel: '0=1',
      submit: '1=1',
      value: $(
        ['Measured', 'Mem', '32bit', atomsInCurrentLevel],
      ),
    },
  });
  counter += 1;
}

export default set;
