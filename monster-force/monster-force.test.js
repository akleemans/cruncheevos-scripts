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

  test('stays locked when the cheat is disabled again before the finish', () => {
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

  /* Mina protection: the core requires character <= 2 (Frank/Drac/Wolfie);
   * this run plays as cheat-unlocked Mina (0x0878 = 3) throughout. */
  test('does not pop when playing as cheat-unlocked Mina', () => {
    const s = scenario('cemetery1-finish-cheat-mina');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(false);
  });

  /* Save protection: loading an in-game save that already has Cemetery 1
   * beaten bumps maxLevelUnlocked 0->1 during the load sequence, that should not trigger the cheevo */
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

  test('does not pop on Cemetery 1 finish', () => {
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

  test('does not pop when too late', () => {
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

describe('Challenge: Motion Sickness', () => {
  const cheevo = achievement('Motion Sickness');

  test('pops when only teleporting 2 times', () => {
    const s = scenario('village2-teleporting-2-times-and-finish');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop with not enough atoms', () => {
    const s = scenario('village2-teleporting-3-times');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('after-third-teleport'))).toBe('paused');
  });
});