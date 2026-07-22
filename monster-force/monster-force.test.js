import {describe, test, expect} from 'vitest';
import {loadScenario, runAchievement} from 'cruncheevos-playtest/testing';
import set from './monster-force.js';

const achievement = (title) => Object.values(set.achievements).find((a) => a.title === title);
const scenario = (name) => loadScenario(new URL(`./scenarios/${name}`, import.meta.url));

describe('Progression: Welcome to Monsterland', () => {
  const cheevo = achievement('Welcome to Monsterland');

  test('pops exactly when the next level is unlocked at the save screen (crystal run)', () => {
    const s = scenario('cemetery1-finish-ranking-crystal');
    const result = runAchievement(cheevo, s);

    expect(result.triggeredFrame).toBe(s.marker('save-screen'));

    // The trigger happens later than the score screen's rank is written (can be 0)
    expect(result.triggeredFrame).toBeGreaterThan(s.marker('rank-written'));
  });

  test('pops on a rank-0 finish too (lowest Bronze)', () => {
    const s = scenario('cemetery1-finish-ranking-0');
    const result = runAchievement(cheevo, s);

    expect(result.triggeredFrame).toBe(s.marker('save-screen'));
  });

  test('locks (paused) from the moment the invincibility cheat is enabled', () => {
    const s = scenario('cemetery1-finish-cheat-invincibility');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(false);
    expect(result.stateAt(s.marker('cheat-enabled'))).toBe('paused');

    // Doesn't reset as cheat is still active
    expect(result.stateAt(s.marker('level-select-screen'))).toBe('paused');
  });

  test('stays locked even when the invincibility cheat is disabled again before the finish', () => {
    const s = scenario('cemetery1-finish-cheat-invincibility-inactive');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(false);

    // Cheevo should be paused until score screen
    expect(result.stateAt(s.marker('cheat-disabled'))).toBe('paused');
    expect(result.stateAt(s.marker('score-screen'))).toBe('paused');

    // At level-select, should be no longer paused
    expect(result.stateAt(s.marker('level-select-screen'))).toBe('active');
  });

  test('does not pop when the level is finished via the skip-level cheat', () => {
    const s = scenario('cemetery1-finish-cheat-level-skip');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(false);
    expect(result.wasEver('paused')).toBe(true);

    // At level-select, should be no longer paused
    expect(result.stateAt(s.marker('level-select-screen'))).toBe('active');
  });

  // As it is not possible to play with Mina (which is much stronger) without beating the game first,
  // Mina is not allowed for progression achievements
  test('does not pop when playing as cheat-unlocked Mina', () => {
    const s = scenario('cemetery1-finish-cheat-mina');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(false);
  });

  // Save protection: Loading a save which already has Cemetery 1 beaten should not unlock the achievement
  test('does not pop when loading a save where the level is already beaten', () => {
    const s = scenario('cemetery1-unlocked-save-state-loaded');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(false);
  });
});


describe('Progression: Cemetery', () => {
  const cheevo = achievement('No Time to Die');

  test('pops when Cemetery Shadow is defeated', () => {
    const s = scenario('cemetery-shadow-beat');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('save-game-screen'));
  });

  test('pops when playing in French', () => {
    const s = scenario('cemetery-shadow-beat-french');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('save-game-screen'));
  });

  test('pops when playing in Spanish', () => {
    const s = scenario('cemetery-shadow-beat-spanish');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('save-game-screen'));
  });

  test('pops when playing in German', () => {
    const s = scenario('cemetery-shadow-beat-german');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('save-game-screen'));
  });

  test('pops when playing in Italian', () => {
    const s = scenario('cemetery-shadow-beat-italian');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('save-game-screen'));
  });

  test('does not pop on Cemetery Level 1 finish', () => {
    const s = scenario('cemetery1-finish-ranking-crystal');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(false);
  });

  test('does not pop if cheat was used', () => {
    const s = scenario('cemetery-shadow-cheat');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(false);
    expect(result.stateAt(s.marker('cheat-enabled'))).toBe('paused');
  });

  test('does not pop on game over', () => {
    const s = scenario('cemetery-shadow-game-over');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('game-over'))).toBe('active');
  });
});

describe('Progression: Village', () => {
  const cheevo = achievement('It Takes a Village');

  test('pops when Village Shadow is defeated', () => {
    const s = scenario('village-shadow-without-atoms');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('save-game-screen'));
  });
});

describe('Progression: Garden', () => {
  const cheevo = achievement('Green Thumb');

  test('pops when Garden Shadow is defeated', () => {
    const s = scenario('garden-shadow-progression');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('save-game-screen'));
  });
});

describe('Progression: Atlantis', () => {
  const cheevo = achievement('Platonic Tale');

  test('pops when Atlantis Shadow is defeated', () => {
    const s = scenario('atlantis-shadow-progression');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('save-game-screen'));
  });
});

describe('Challenge: Diagonal Thinking', () => {
  const cheevo = achievement('Diagonal Thinking');

  test('pops when 800 Atoms are collected within 5 seconds', () => {
    const s = scenario('cemetery2-challenge-in-time');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-select'))).toBe('active');
    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-800'));
  });

  test('does not pop when collected, but too late', () => {
    const s = scenario('cemetery2-challenge-too-late');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-select'))).toBe('active');
    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('timer-5-seconds'))).toBe('paused');
    expect(result.stateAt(s.marker('score-800'))).toBe('paused');
  });
});

describe('Challenge: In the Blink of an Eye', () => {
  const cheevo = achievement('In the Blink of an Eye');

  test('pops when boss beaten in 10 seconds', () => {
    const s = scenario('cemetery-shadow-beat-10seconds');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop when too late', () => {
    const s = scenario('cemetery-shadow-beat');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(false);
    expect(result.stateAt(s.marker('score-screen'))).toBe('active');
  });

  test('does not pop when cheat was used', () => {
    const s = scenario('cemetery-shadow-beat-10seconds-cheated');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(false);
    expect(result.stateAt(s.marker('score-screen'))).toBe('paused');
  });
});

describe('Challenge: Shadow Business', () => {
  const cheevo = achievement('Shadow Business');

  test('pops when 1500 Atoms are collected', () => {
    const s = scenario('village-shadow-with-1500-atoms');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop with not enough atoms', () => {
    const s = scenario('village-shadow-without-atoms');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('score-screen'))).toBe('active');
  });
});

// TODO
// describe('Challenge: Divide & Conquer', () => {
//   const cheevo = achievement('Divide & Conquer');
//
//   test('pops no more than 4 pumpkin heads were active', () => {
//     const s = scenario('castle3-4-pumpkin-heads');
//     const result = runAchievement(cheevo, s);
//
//     expect(result.stateAt(s.marker('level-start'))).toBe('active');
//
//     expect(result.triggered).toBe(true);
//     expect(result.triggeredFrame).toBe(s.marker('score-screen'));
//   });
//
//   test('does not pop with more pumpkin heads', () => {
//     const s = scenario('castle3-5-pumpkin-heads');
//     const result = runAchievement(cheevo, s);
//
//     expect(result.stateAt(s.marker('level-start'))).toBe('active');
//     expect(result.triggered).toBe(false);
//
//     expect(result.stateAt(s.marker('score-screen'))).toBe('active');
//   });
// });

// TODO Clone Wars

describe('Challenge: Motion Sickness', () => {
  const cheevo = achievement('Motion Sickness');

  test('pops when only teleporting 2 times', () => {
    const s = scenario('village2-teleporting-2-times-and-finish');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop when teleported three times', () => {
    const s = scenario('village2-teleporting-3-times');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('after-third-teleport'))).toBe('paused');
  });
});


describe('Challenge: Blast Radius', () => {
  const cheevo = achievement('Blast Radius');

  test('pops when 12 enemies defeated with regular bomb', () => {
    const s = scenario('garden2-bomb-12defeated');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('bomb-explosion'));
  });

  test('pops when 12 enemies defeated with level 2 bomb', () => {
    const s = scenario('garden2-bomb-12defeated-level2');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('bomb-explosion'));
  });

  test('pops when 12 enemies defeated with level 3 bomb, and player tries to move during explosion', () => {
    const s = scenario('garden2-bomb-12defeated-level3-moving');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('bomb-explosion'));
  });

  test('does not pop when not enough enemies where defeated', () => {
    const s = scenario('garden2-bomb-less-than-12-defeated');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });

  test('does not pop when enemies where defeated without bomb', () => {
    const s = scenario('garden2-bomb-12defeated-by-shooting');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});


describe('Challenge: Energy Saver', () => {
  const cheevo = achievement('Energy Saver');

  test('pops when activating switches only 2 times', () => {
    const s = scenario('garden-trial-2-switch-activations');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop with 3 activations', () => {
    const s = scenario('garden-trial-3-switch-activations');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('after-third-activation'))).toBe('paused');
  });
});

// TODO Heart of the Clouds, collecting the heart directly when shooting & collecting it later

// describe('Challenge: Young and Restless', () => {
//   const cheevo = achievement('Young and Restless');
//
//   test('pops when finishing the level without standing still as Wolfie', () => {
//     const s = scenario('clouds-trial-wolfie-fast');
//
//     const result = runAchievement(cheevo, s);
//
//     expect(result.stateAt(s.marker('level-start'))).toBe('primed');
//
//     expect(result.triggered).toBe(true);
//     expect(result.triggeredFrame).toBe(s.marker('score-screen'));
//   });
//
//   test('does not pop with different character', () => {
//     const s = scenario('clouds-trial-drac-fast');
//
//     const result = runAchievement(cheevo, s);
//
//     expect(result.stateAt(s.marker('level-start'))).toBe('primed');
//     expect(result.triggered).toBe(false);
//
//     expect(result.stateAt(s.marker('after-third-activation'))).toBe('paused');
//   });
//
//   // TODO does not pop if slow
// });
