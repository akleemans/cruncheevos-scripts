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
  GameOver: 0x14
};

const PlayerStateEnum = {
  Standing: 0x02,
  Moving: 0x03,
  Hover: 0x04,
  BombArmed: 0x05,
  Teleporting: 0x0c
};

const CharacterActive = {
  Frank: 0x00,
  Drac: 0x01,
  Wolfie: 0x02,
  Mina: 0x03,
  Drew: 0x04
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
  TempleShadow: 0x13,
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

const gameState = 0x0770;
const playerState = 0x077c;
const currentLevel = 0x34dd;
const maxLevelUnlocked = 0x34df;

const invincibilityCheat = 0x3598;

const atomsInCurrentLevel = 0x35a4;
const levelTime = 0x359c;
const characterActive = 0x0878;

const toolSlot1 = 0x07fc;
const toolSlot2 = 0x07fd;
const toolSlot3 = 0x07fe;
const toolSlot4 = 0x07ff;

/* ========= PROGRESSION ========= */

const progression = (levelId) => {
  return [
    ['', 'Delta', '8bit', maxLevelUnlocked, '=',  'Value', '', levelId],
    ['', 'Mem',   '8bit', maxLevelUnlocked, '=',  'Value', '', levelId + 1],
    ['', 'Mem',   '8bit', currentLevel,     '=',  'Value', '', levelId + 1],
    // Cheat protection - progression can not be unlocked with Mina or Drew, as they are only unlocked after beating the game
    ['', 'Mem',   '8bit', characterActive,  '<=', 'Value', '', 2],
    // Save protection - must just have finished the level and reached level end / save screen
    ['', 'Mem',   '8bit', gameState,        '=',  'Value', '', GameStateEnum.SaveGameOption],
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
  description: 'Finish Atlantis Zone',
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
      ...progression(LevelEnum.TempleShadow),
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

// TODO if this behaves the same - or check Mina unlock?
set.addAchievement({
  id: 625436,
  title: 'Pumpkin Mash',
  description: 'Finish the Castle Zone by defeating Sergeant Smash and beat the game',
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

set.addAchievement({
  id: 625437,
  title: 'Walking Through Walls',
  description: 'Find and destroy all 6 pumpkins in the hidden area in Cemetery Level 1',
  points: 2,
  conditions: {
    core: $(
      ['AddSource', 'Delta', '16bit', 0x1820],
      ['AddSource', 'Delta', '16bit', 0x1824],
      ['AddSource', 'Delta', '16bit', 0x1828],
      ['AddSource', 'Delta', '16bit', 0x182c],
      ['AddSource', 'Delta', '16bit', 0x1838],
      ['AddSource', 'Delta', '16bit', 0x183c],
      ['AddSource', 'Delta', '16bit', 0x1840],
      ['',          'Delta', '16bit', 0x1844,       '>', 'Value', '', 0],
      ['AddSource', 'Mem',   '16bit', 0x1820],
      ['AddSource', 'Mem',   '16bit', 0x1824],
      ['AddSource', 'Mem',   '16bit', 0x1828],
      ['AddSource', 'Mem',   '16bit', 0x182c],
      ['AddSource', 'Mem',   '16bit', 0x1838],
      ['AddSource', 'Mem',   '16bit', 0x183c],
      ['AddSource', 'Mem',   '16bit', 0x1840],
      ['',          'Mem',   '16bit', 0x1844,       '=', 'Value', '', 0],
      ['',          'Mem',   '8bit',  gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['',          'Mem',   '8bit',  currentLevel, '=', 'Value', '', LevelEnum.Cemetery1],
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
  points: 2,
  conditions: {
    core: $(
      // Lock if more than 5 seconds into Cemetery2
      ['AndNext', 'Mem',   '8bit',  currentLevel,        '=',  'Value', '', LevelEnum.Cemetery2],
      ['AddHits', 'Mem',   '8bit',  gameState,           '=',  'Value', '', GameStateEnum.InGame],
      ['PauseIf', 'Value', '',      0,                   '=',  'Value', '', 1,                    300],
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
  description: 'Collect all 100 Atoms and finish the Cemetery Trial in time',
  points: 5,
  conditions: {
    core: $(
      ['', 'Mem',   '8bit',  currentLevel,        '=',  'Value', '', LevelEnum.CemeteryTrial],
      ['', 'Delta', '8bit',  gameState,           '=',  'Value', '', GameStateEnum.InGame],
      ['', 'Mem',   '8bit',  gameState,           '=',  'Value', '', GameStateEnum.ScoreScreen],
      ['', 'Mem',   '32bit', atomsInCurrentLevel, '>=', 'Value', '', 100],
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
      ['',        'Mem',   '8bit',  currentLevel, '=', 'Value', '', LevelEnum.CemeteryShadow],
      // Trigger here on reaching score screen (as opposed to progression, when we have to wait for maxLevel to go up at save screen)
      ['',        'Delta', '8bit',  gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit',  gameState,    '=', 'Value', '', GameStateEnum.ScoreScreen],
      ['',        'Mem',   '16bit', levelTime,    '<', 'Value', '', 600],
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
  description: 'Beat the Village Level 1 by carrying at most 1 key at once',
  points: 5,
  conditions: {
    core: $(
      // PauseLock if key count ever reaches > 1
      ['AndNext', 'Mem',   '8bit', currentLevel,       '=', 'Value', '', LevelEnum.Village1],
      ['AndNext', 'Mem',   '8bit', gameState,          '=', 'Value', '', GameStateEnum.InGame],
      ['AddHits', 'Mem',   '8bit', keysCollectedCount, '>', 'Value', '', 1],
      ['PauseIf', 'Value', '',     0,                  '=', 'Value', '', 1,                         1],
      // Pop condition
      ['',        'Mem',   '8bit', currentLevel,       '=', 'Value', '', LevelEnum.Village1],
      ['',        'Delta', '8bit', gameState,          '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,          '=', 'Value', '', GameStateEnum.ScoreScreen],
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
      // Add Hits if player is teleporting, and lock if teleported 3 times
      ['AndNext', 'Mem',   '8bit', currentLevel, '=',  'Value', '', LevelEnum.Village2],
      ['AndNext', 'Mem',   '8bit', gameState,    '=',  'Value', '', GameStateEnum.InGame],
      ['AndNext', 'Delta', '8bit', playerState,  '!=', 'Value', '', PlayerStateEnum.Teleporting],
      ['AddHits', 'Mem',   '8bit', playerState,  '=',  'Value', '', PlayerStateEnum.Teleporting],
      ['PauseIf', 'Value', '',     0,            '=',  'Value', '', 1,                           3],
      // Pop condition
      ['',        'Mem',   '8bit', currentLevel, '=',  'Value', '', LevelEnum.Village2],
      ['',        'Delta', '8bit', gameState,    '=',  'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,    '=',  'Value', '', GameStateEnum.ScoreScreen],
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
  points: 5,
  conditions: {
    core: $(
      ['',         'Mem',   '8bit',  currentLevel,        '=',  'Value', '', LevelEnum.VillageShadow],
      ['',         'Delta', '8bit',  gameState,           '=',  'Value', '', GameStateEnum.InGame],
      ['',         'Mem',   '8bit',  gameState,           '=',  'Value', '', GameStateEnum.ScoreScreen],
      ['Measured', 'Mem',   '32bit', atomsInCurrentLevel, '>=', 'Value', '', 1500],
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
  // Slot was empty and is now Health lvl. 3 (checkpoint hit)
  return [
    ['AndNext', 'Delta', '8bit', toolSlot, '=', 'Value', '', 0x00],
    ['AddHits', 'Mem',   '8bit', toolSlot, '=', 'Value', '', 0x09],
    ['',        'Value', '',     0,        '=', 'Value', '', 1,    1],
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
      ['', 'Mem', '8bit',  currentLevel,   '=', 'Value', '', LevelEnum.Clouds1],
      ['', 'Mem', '8bit',  gameState,      '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
      ['', 'Value', '',  0, '=', 'Value', '', 1],
    ),
    alt2: $(
      ...greenHeartCollectedInSlot(toolSlot1)
    ),
    alt3: $(
      ...greenHeartCollectedInSlot(toolSlot2)
    ),
    alt4: $(
      ...greenHeartCollectedInSlot(toolSlot3)
    ),
    alt5: $(
      ...greenHeartCollectedInSlot(toolSlot4)
    ),
  },
});
// TODO check if there's no other green heart to collect in Clouds1
// TODO test cases: 1. Destroy pumpkin, collect heart. 2. Collect heart before pumpkin is marked as destroyed

const decoyActive = 0x08dc;

set.addAchievement({
  id: 625446,
  title: 'Clone Wars',
  description: 'Create a shadow clone of yourself in Clouds Level 2',
  points: 2,
  conditions: {
    core: $(
      // Pop if decoy created
      ['', 'Delta', '8bit', decoyActive,  '=', 'Value', '', 0x00],
      ['', 'Mem',   '8bit', decoyActive,  '=', 'Value', '', 0x02],
      // Context
      ['', 'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Clouds2],
      ['', 'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const objectsEnemiesDestroyed = 0x35a0
const invulnerabilityTimer = 0x07ea;

set.addAchievement({
  id: 625445,
  title: 'Blast Radius',
  description: 'Defeat 12 enemies at once without shooting, but using an effective tool in Garden Level 2',
  points: 5,
  conditions: {
    core: $(
      // Make sure bomb was activated and player invulnerability was active in last frame
      ['',          'Delta', '8bit',  playerState,             '=',  'Value', '', PlayerStateEnum.BombArmed],
      ['',          'Delta', '16bit', invulnerabilityTimer,    '=',  'Value', '', 0xffff],
      // Using SubSource to check if increase of enemies killed is >= 12
      ['SubSource', 'Delta', '8bit',  objectsEnemiesDestroyed],
      ['',          'Mem',   '8bit',  objectsEnemiesDestroyed, '>=', 'Value', '', 12],
      // Context conditions
      ['',          'Mem',   '8bit',  currentLevel,            '=',  'Value', '', LevelEnum.Garden2],
      ['',          'Mem',   '8bit',  gameState,               '=',  'Value', '', GameStateEnum.InGame],
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
      ['AndNext', 'Mem',   '8bit', currentLevel,      '=', 'Value', '',     LevelEnum.GardenTrial],
      ['AndNext', 'Mem',   '8bit', gameState,         '=', 'Value', '',     GameStateEnum.InGame],
      // Add hit if counter increased (= activated)
      ['AddHits', 'Delta', '8bit', switchTimerActive, '<', 'Mem',   '8bit', switchTimerActive],
      // Lock if 3 (= allowed+1) activations
      ['PauseIf', 'Value', '',     0,                 '=', 'Value', '',     1,                         3],
      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel,      '=', 'Value', '',     LevelEnum.GardenTrial],
      ['',        'Delta', '8bit', gameState,         '=', 'Value', '',     GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,         '=', 'Value', '',     GameStateEnum.ScoreScreen],
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
      ['', 'Mem',   '8bit',  currentLevel,    '=', 'Value', '', LevelEnum.GardenTrial],
      ['', 'Mem',   '8bit',  gameState,       '=', 'Value', '', GameStateEnum.InGame],
      // Pop if door to locked garden part was opened
      ['', 'Delta', '16bit', gardenTrialDoor, '>', 'Value', '', 0x00],
      ['', 'Mem',   '16bit', gardenTrialDoor, '=', 'Value', '', 0x00],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});

const playerPositionX = 0x078c;
const playerPositionY = 0x0790;

set.addAchievement({
  id: 625449,
  title: 'Young and Restless',
  description: 'As Wolfie, beat the Clouds Trial without standing still more than 2 seconds',
  points: 10,
  conditions: {
    core: $(
      // Add a checkpoint hit when starting the level
      ['AndNext', 'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.CloudsTrial],
      ['AndNext', 'Delta', '8bit', gameState,    '=', 'Value', '', GameStateEnum.LevelStart],
      ['',        'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame,     1],

      // Reset hits of global ResetIf below (so it restarts accumulating hits) if moving
      ['OrNext',      'Mem', '32bit', playerPositionX, '!=', 'Delta', '32bit', playerPositionX],
      ['AndNext',     'Mem', '32bit', playerPositionY, '!=', 'Delta', '32bit', playerPositionY],
      ['ResetNextIf', 'Mem', '8bit',  currentLevel,    '=',  'Value', '',      LevelEnum.CloudsTrial],

      // Reset checkpoint hit if accumulated enough hits
      ['AndNext', 'Mem', '8bit', currentLevel, '=', 'Value', '', LevelEnum.CloudsTrial],
      ['ResetIf', 'Mem', '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame,  120],

      // Pop on score screen
      ['',        'Mem',   '8bit', characterActive, '=', 'Value', '', CharacterActive.Wolfie],
      ['',        'Mem',   '8bit', currentLevel,    '=', 'Value', '', LevelEnum.CloudsTrial],
      ['',        'Delta', '8bit', gameState,       '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,       '=', 'Value', '', GameStateEnum.ScoreScreen],

      ...invincibilityCheatProtection(),
      ...skipLevelCheatProtection()
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
      ['AndNext', 'Mem',   '8bit', currentLevel,    '=', 'Value', '', LevelEnum.Castle3],
      ['AndNext', 'Mem',   '8bit', gameState,       '=', 'Value', '', GameStateEnum.InGame],
      ['AddHits', 'Mem',   '8bit', liveObjectCount, '>', 'Value', '', 5],
      ['PauseIf', 'Value', '',     0,               '=', 'Value', '', 1,                         1],
      // Pop on score screen
      ['',        'Mem',   '8bit', currentLevel,    '=', 'Value', '', LevelEnum.Castle3],
      ['',        'Delta', '8bit', gameState,       '=', 'Value', '', GameStateEnum.InGame],
      ['Trigger', 'Mem',   '8bit', gameState,       '=', 'Value', '', GameStateEnum.ScoreScreen],
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
  0x1a48,
];

const addHitsPerAddress = (addresses) => {
  const result = [];
  for (let address of addresses) {
    result.push(['AndNext', 'Mem', '8bit', gameState, '=', 'Value', '', GameStateEnum.InGame],);
    result.push(['AndNext', 'Delta', '16bit', address, '>', 'Value', '', 0]);
    result.push(['AddHits', 'Mem', '16bit', address, '=', 'Value', '', 0]);
  }
  return result;
};

set.addAchievement({
  id: 626069,
  title: 'Halloween\'s Over',
  description: 'Find and destroy all pumpkins in Atlantis Level 2',
  points: 5,
  conditions: {
    core: $(
      // We have to use AddHits here, because only on destruction the level object type will go to 0x0000 (from 1, 2 or 3).
      // After that, it might become 0xfffa, so we can not just use AddSource = 0.
      // Instead, we add a hit for every pumpkin destroyed,
      ...addHitsPerAddress(atlantis2pumpkinAddresses),
      ['Measured%', 'Value', '',     0,            '=', 'Value', '', 1,                    atlantis2pumpkinAddresses.length],
      // Context
      ['',          'Mem',   '8bit', currentLevel, '=', 'Value', '', LevelEnum.Atlantis2],
      ['',          'Mem',   '8bit', gameState,    '=', 'Value', '', GameStateEnum.InGame],
      ...invincibilityCheatProtection(),
    ),
    alt1: $(
      ...levelSelectReset(),
    ),
  },
});
// TODO tests: 1. entering level should not pop cheevo (AddHits without ingame-check)


/* ========= DUMMY ========= */

// const countBadges = (tier) => {
//   const conditions = [];
//   for (let i = 0; i <= LevelEnum.CastleSergeantSmash; i++) {
//     conditions.push(['AddSource', 'Mem', '8bit', 0x35b8 + i, '/', 'Value', '', tier]);
//   }
//   conditions.push(['Measured', 'Value', '', 0, '!=', 'Value', '', 0]);
//   return conditions;
// };
//
// set.addAchievement({
//   title: '(dummy) Calculate amount of Silver/Gold/Crystal rankings',
//   description: '',
//   points: 0,
//   conditions: {
//     core: $(
//       ...countBadges(4)
//     ),
//   },
// });

/* ========= LEADERBOARDS ========= */


export default set;
