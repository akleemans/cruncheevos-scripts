import {describe, test, expect} from 'vitest';
import {loadScenario, runAchievement} from 'cruncheevos-playtest/testing';
import set from './monster-force.js';

const achievement = (title) => Object.values(set.achievements).find((a) => a.title === title);
const scenario = (name) => loadScenario(new URL(`./scenarios/${name}`, import.meta.url));
const lastFrame = (s) => s.frameNumberAt(s.length - 1);

// Object-slot addresses used by the "all pumpkins destroyed" achievements, for the regression guards below
const currentLevel = 0x34dd;
const levelCemetery1 = 0x00;
const levelFactory2 = 0x1d;
const cemetery1HiddenPumpkins = [0x1820, 0x1824, 0x1828, 0x182c, 0x1838, 0x183c, 0x1840, 0x1844];
const factory2ScarecrowPumpkins = [0x1958, 0x195c, 0x1978, 0x197c];

describe('Progression: Welcome to Monsterland', () => {
  const cheevo = achievement('Welcome to Monsterland');

  test('pops exactly when the next level is unlocked at the save screen (crystal run)', () => {
    const s = scenario('cemetery1-finish-ranking-crystal');
    const result = runAchievement(cheevo, s);

    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('pops on a rank-0 finish too (lowest Bronze)', () => {
    const s = scenario('cemetery1-finish-ranking-0');
    const result = runAchievement(cheevo, s);

    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
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
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('pops when playing in French', () => {
    const s = scenario('cemetery-shadow-beat-french');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('pops when playing in Spanish', () => {
    const s = scenario('cemetery-shadow-beat-spanish');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('pops when playing in German', () => {
    const s = scenario('cemetery-shadow-beat-german');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('pops when playing in Italian', () => {
    const s = scenario('cemetery-shadow-beat-italian');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
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
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });
});

describe('Progression: Garden', () => {
  const cheevo = achievement('Green Thumb');

  test('pops when Garden Shadow is defeated', () => {
    const s = scenario('garden-shadow-progression');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });
});

describe('Progression: Atlantis', () => {
  const cheevo = achievement('Platonic Tale');

  test('pops when Atlantis Shadow is defeated', () => {
    const s = scenario('atlantis-shadow-progression');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });
});

describe('Progression: Temple', () => {
  const cheevo = achievement('Temple Tantrum');

  test('pops when Temple Dragon Boss is defeated', () => {
    const s = scenario('temple-shadow-progression');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop on cheated finish', () => {
    const s = scenario('temple-shadow-cheat-finish');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('score-screen'))).toBe('paused');
    expect(result.stateAt(s.marker('level-select-screen'))).toBe('active');
  });
});

describe('Progression: Desert', () => {
  const cheevo = achievement('Rise of the Mummies');

  test('pops when Desert Shadow is defeated', () => {
    const s = scenario('desert-shadow-progression');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop on cheated finish, but properly resets', () => {
    const s = scenario('desert-shadow-cheat-finish');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('score-screen'))).toBe('paused');
    expect(result.stateAt(s.marker('level-select-screen'))).toBe('active');
  });

  test('does not pop on game over', () => {
    const s = scenario('desert-shadow-game-over');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('continue-screen'))).toBe('active');
  });
});

describe('Progression: Clouds', () => {
  const cheevo = achievement('Sky High');

  test('pops when Clouds Shadow is defeated', () => {
    const s = scenario('clouds-shadow-progression');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });
});

describe('Progression: Factory', () => {
  const cheevo = achievement('Industrial Revolution');

  test('pops when Factory Shadow is defeated', () => {
    const s = scenario('factory-shadow-progression');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });
});

describe('Progression: Castle', () => {
  const cheevo = achievement('Pumpkin Mash');

  test('pops when Sergeant Smash is defeated', () => {
    const s = scenario('castle-shadow-progression');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop on game over', () => {
    const s = scenario('castle-shadow-game-over');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('continue-screen'))).toBe('active');
  });

  test('does not pop on cheated finish', () => {
    const s = scenario('castle-shadow-cheat-finish');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('score-screen'))).toBe('paused');
  });

  test('does not pop on loading save-state', () => {
    const s = scenario('load-completed-save-state');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(false);
  });
});

/* ========= CHALLENGES ========= */

// Test for allPumpkinsDestroyed() - checks if a slot that was already destroyed goes back to 1 before the last pumpkin is destroyed
const slotsThatCameBackAlive = (s, addresses, levelId) => {
  const destroyed = (new Set);
  const violations = [];

  for (let frame = s.firstFrame; frame <= s.lastFrame; frame++) {
    if (s.valueAt(frame, currentLevel) !== levelId) continue;

    for (const address of addresses) {
      const value = s.valueAt(frame, address);
      if (value === 1 && destroyed.has(address)) violations.push(`0x${address.toString(16)}@${frame}`);
      if (value !== 1) destroyed.add(address);
    }
  }
  return violations;
};

describe('Walking Through Walls', () => {
  const cheevo = achievement('Walking Through Walls');

  test('pops when pumpkins are destroyed', () => {
    const s = scenario('cemetery1-hidden-pumpkins');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('pumpkins-destroyed'));
  });

  test('pops when pumpkins destroyed with bomb', () => {
    const s = scenario('cemetery1-hidden-pumpkins-bomb');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('pumpkins-destroyed'));
  });

  test('pops when pumpkins destroyed with bomb 2', () => {
    const s = scenario('cemetery1-hidden-pumpkins-bomb2');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('pumpkins-destroyed'));
  });

  test('pops when destroyed with high stats (AP/FP)', () => {
    const s = scenario('cemetery1-hidden-pumpkins-high-stats');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('pumpkins-destroyed'));
  });

  test('does not pop with only 5 destroyed pumpins', () => {
    const s = scenario('cemetery1-hidden-pumpkins-only-5');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('score-screen'))).toBe('active');
  });

  test('does not pop on level finish without pumpkins destroyed', () => {
    const s = scenario('cemetery1-finish-ranking-0');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('score-screen'))).toBe('active');

    expect(result.triggered).toBe(false);
  });

  test('no destroyed pumpkin slot ever returns to 1 while in the level', () => {
    for (const name of [
      'cemetery1-hidden-pumpkins', 'cemetery1-hidden-pumpkins-bomb',
      'cemetery1-hidden-pumpkins-bomb2', 'cemetery1-hidden-pumpkins-high-stats',
      'cemetery1-hidden-pumpkins-only-5',
    ]) {
      expect(slotsThatCameBackAlive(scenario(name), cemetery1HiddenPumpkins, levelCemetery1)).toEqual([]);
    }
  });
});

describe('Diagonal Thinking', () => {
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

describe('Every Atom Counts', () => {
  const cheevo = achievement('Every Atom Counts');

  test('pops when finished level with at least 100 Atoms collected', () => {
    const s = scenario('cemetery-trial-with-100-atoms');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.stateAt(s.marker('collected-100-atoms'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop when Trial failed, even if 100 Atoms collected', () => {
    const s = scenario('cemetery-trial-failed');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.stateAt(s.marker('collected-100-atoms'))).toBe('primed');

    expect(result.triggered).toBe(false);
  });

  test('does not pop when Trial successful, but Atoms not collected', () => {
    const s = scenario('cemetery-trial-with-less-than-100-atoms');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('score-screen'))).toBe('active');
  });
});

describe('In the Blink of an Eye', () => {
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

describe('One at a Time', () => {
  const cheevo = achievement('One at a Time');

  test('pops when Village Level 1 is beaten carrying at most 1 key', () => {
    const s = scenario('village1-only-one-key');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.stateAt(s.marker('pause-menu'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop (and no longer prime) if picked up second key before using first', () => {
    const s = scenario('village1-picked-up-2-keys');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.stateAt(s.marker('picked-up-second-key'))).toBe('paused');

    expect(result.triggered).toBe(false);
  });

  test('does not pop when cheat was used', () => {
    const s = scenario('village1-cheated');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(false);
    expect(result.stateAt(s.marker('score-screen'))).toBe('paused');
  });
});

describe('Shadow Business', () => {
  const cheevo = achievement('Shadow Business');

  test('pops when 1500 Atoms are collected', () => {
    const s = scenario('village-shadow-with-1500-atoms');
    const result = runAchievement(cheevo, s);

    // No measuredAt value at start
    expect(result.measuredAt(s.marker('level-select-before'))).toBe(0);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    // Measured tracks the Atoms collected in the level, capped at the 1500 target
    expect(result.measuredTarget).toBe(1500);
    expect(result.measuredAt(s.marker('level-start'))).toBe(0);
    expect(result.measuredAt(s.marker('score-screen'))).toBe(1500);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop with not enough atoms', () => {
    const s = scenario('village-shadow-without-atoms');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);

    // Progress is shown but stays short of the target
    expect(result.measuredAt(s.marker('score-screen'))).toBe(500);

    expect(result.stateAt(s.marker('score-screen'))).toBe('active');
  });
});

describe('You Only Got One Shot', () => {
  const cheevo = achievement('You Only Got One Shot');

  test('pops when level finished with only 1 shot fired', () => {
    const s = scenario('garden1-one-shot');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not prime/pop when multiple shots fired', () => {
    const s = scenario('garden1-multiple-shots');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('multiple-shots-fired'))).toBe('active');
  });
});

describe('Dracula\'s Favorite', () => {
  const cheevo = achievement('Dracula\'s Favorite');

  test('pops when defeating Garden 2 as Drac with initial stats', () => {
    const s = scenario('garden2-drac-initial-stats');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not prime/pop if stats were upgraded', () => {
    const s = scenario('garden2-drac-upgraded-attack-power');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Divide & Conquer', () => {
  const cheevo = achievement('Divide & Conquer');

  test('pops if only 4 pumpkin heads are active', () => {
    const s = scenario('castle3-4-pumpkin-heads');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('doesnt get locked if 6 enemies in previous level, Castle 2', () => {
    const s = scenario('castle3-should-not-lock-from-castle2');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('castle2-start'))).toBe('active');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('5-enemies-present-castle2'))).toBe('active');
    expect(result.stateAt(s.marker('castle3-start'))).toBe('primed');
  });

  test('does not pop with more pumpkin heads', () => {
    const s = scenario('castle3-5-pumpkin-heads');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-select-before'))).toBe('active');
    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('5-pumpkin-heads'))).toBe('paused');
  });

  test('does not pop if level finished with cheat', () => {
    const s = scenario('castle3-finished-cheat');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('cheat-used'))).toBe('paused');
  });
});

describe('Boss Rush', () => {
  const cheevo = achievement('Boss Rush');

  test('pops if bosses defeated fast enough', () => {
    const s = scenario('castle1-boss-rush-fast');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('castle1-start'))).toBe('active');
    expect(result.stateAt(s.marker('castle4-start'))).toBe('primed');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop if too slow', () => {
    const s = scenario('castle1-boss-rush-slow');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('castle1-start'))).toBe('active');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('after-60-seconds'))).toBe('paused');
  });

  test('does not pop if any level finished with cheat', () => {
    const s = scenario('castle1-boss-rush-cheat');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('castle1-start'))).toBe('active');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('cheat-used'))).toBe('paused');
  });

  test('does not prime/pop if started from Castle 2', () => {
    const s = scenario('castle2-fast');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('castle4-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Stand Your Ground', () => {
  const cheevo = achievement('Stand Your Ground');

  test('pops if only moved vertically', () => {
    const s = scenario('castle-sergeant-smash-no-left-right');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop if moved left or right', () => {
    const s = scenario('castle-sergeant-smash-mina');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('moved-right'))).toBe('paused');
  });
});

describe('It\'s All About Balance', () => {
  const cheevo = achievement('It\'s All About Balance');

  test('pops if healed 3 times with no initial health tools', () => {
    const s = scenario('factory1-multiple-healing-wolfie2');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.stateAt(s.marker('3rd-healing-used'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop if only 2 healings', () => {
    const s = scenario('factory1-multiple-healing-wolfie');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });

  test('does not prime/pop if brought health1 tool into level (slot3)', () => {
    const s = scenario('factory1-brought-health1-into-level');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('paused');
    expect(result.triggered).toBe(false);
  });

  test('does not prime/pop if brought health2 tool into level (slot4)', () => {
    const s = scenario('factory1-brought-health2-into-level');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('paused');
    expect(result.triggered).toBe(false);
  });

  test('does not prime/pop if brought health3 tool into level (slot1)', () => {
    const s = scenario('factory1-brought-health3-into-level');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('paused');
    expect(result.triggered).toBe(false);
  });

  test('does not prime/pop if brought health4 tool into level (slot2) and resets again on score screen', () => {
    const s = scenario('factory1-brought-health4-into-level');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('paused');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('level-screen-after'))).toBe('active');
  });

  test('does not prime/pop if not Wolfie', () => {
    const s = scenario('factory1-drac-multiple-healings');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('3rd-healing-used'))).toBe('active');
  });
});

describe('Frankly Harmless', () => {
  const cheevo = achievement('Frankly Harmless');

  test('pops if level finished without killing enemies', () => {
    const s = scenario('desert-trial-frank-no-harm');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop if defeated enemy', () => {
    const s = scenario('desert-trial-defeated-enemy');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('defeated-enemy'))).toBe('active');
  });

  test('does not pop if not Frank', () => {
    const s = scenario('desert-trial-drac-no-harm');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Halloween\'s Over', () => {
  const cheevo = achievement('Halloween\'s Over');

  test('pops if all pumpkins destroyed by shooting', () => {
    const s = scenario('atlantis2-all-pumpkins-destroyed-by-shooting');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    // Measured% counts destroyed pumpkins towards 70 (of the 75 in the level)
    expect(result.measuredTarget).toBe(70);
    expect(result.measuredAt(s.marker('level-start'))).toBe(0);
    expect(result.measuredAt(s.marker('70th-pumpkin-destroyed'))).toBe(70);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('70th-pumpkin-destroyed'));
  });

  test('does not pop if pumpkins destroyed but bomb was used', () => {
    const s = scenario('atlantis2-all-pumpkins-destroyed-bomb-used');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);

    // Real progress had accumulated, and arming the bomb wipes it back to zero
    expect(result.measuredAt(s.marker('bomb-used') - 1)).toBe(38);
    expect(result.measuredAt(s.marker('bomb-used'))).toBe(0);
    expect(result.measuredAt(lastFrame(s))).toBe(0);

    expect(result.stateAt(s.marker('bomb-used'))).toBe('reset');
  });
});

describe('Motion Sickness', () => {
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

describe('Slowly but Steady', () => {
  const cheevo = achievement('Slowly but Steady');

  test('pops when finishing within time limit with Frank', () => {
    const s = scenario('village-trial-with-time-bonus');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop when trial failed', () => {
    const s = scenario('village-trial-failed');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);
  });

  test('does not pop when cheated', () => {
    const s = scenario('village-trial-cheated');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('score-screen'))).toBe('paused');
  });

  test('does not prime when not using Frank', () => {
    const s = scenario('village-trial-drac');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Blast Radius', () => {
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


describe('Energy Saver', () => {
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

describe('Monet\'s Garden', () => {
  const cheevo = achievement('Monet\'s Garden');

  test('pops when opening door to hidden garden area', () => {
    const s = scenario('garden-trial-hidden-garden');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('door-opened'));
  });

  test('does not pop if finished level without visiting hidden garden', () => {
    const s = scenario('garden-trial-2-switch-activations');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Wolfskin', () => {
  const cheevo = achievement('Wolfskin');

  test('pops when finishing Atlantis 1 as Wolfie without healing', () => {
    const s = scenario('atlantis1-wolfie-no-healing');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does no longer prime if healed', () => {
    const s = scenario('atlantis1-wolfie-healed');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('after-healing'))).toBe('paused');
  });

  test('does not prime if wrong character', () => {
    const s = scenario('atlantis1-drac-start');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });

  test('does not pop if level end cheat is used, but pause and reset on level select', () => {
    const s = scenario('atlantis1-wolfie-cheat');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('cheat-used'))).toBe('paused');
    expect(result.stateAt(s.marker('level-select-after'))).toBe('active');
  });
});

describe('Metal Detector', () => {
  const cheevo = achievement('Metal Detector');

  test('pops when finishing Atlantis Trial without taking damage', () => {
    const s = scenario('atlantis-trial-no-damage');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });


  test('does not pop if damage was taken', () => {
    const s = scenario('atlantis-trial-damage-taken');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('damage-taken'))).toBe('paused');
  });
});

describe('Blood Thirst', () => {
  const cheevo = achievement('Blood Thirst');

  test('pops when 50 enemies are defeated in Temple Level 1', () => {
    const s = scenario('temple1-enemies-killed');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    // Measured% counts destroyed enemies/pumpkins towards 50 - the recording picks up at 49
    expect(result.measuredTarget).toBe(50);
    expect(result.measuredAt(s.marker('scenario-start'))).toBe(49);
    expect(result.measuredAt(s.marker('50-enemies-killed'))).toBe(50);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('50-enemies-killed'));
  });

  test('does not pop with other character', () => {
    const s = scenario('temple1-enemies-mina');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');
    // No Measured if wrong character
    expect(result.measuredAt(s.marker('scenario-start'))).toBe(0);
    expect(result.triggered).toBe(false);
  });
});


describe('Minimal Force', () => {
  const cheevo = achievement('Minimal Force');

  test('pops when Temple 2 finished with stats below or equal to 15', () => {
    const s = scenario('temple2-stats-below-15');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not prime if stats below 15, but relics push it over 15', () => {
    const s = scenario('temple2-stats-below-15-but-relics-push-attack');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });

  test('does not prime if one stat above 15', () => {
    const s = scenario('temple2-health-above-15');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Here Be Dragons', () => {
  const cheevo = achievement('Here Be Dragons');

  test('pops when defeating Temple Dragon Boss', () => {
    const s = scenario('temple-dragon-shadow-defeated');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not prime/pop when damage taken', () => {
    const s = scenario('temple-dragon-shadow-damage');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('damage-taken'))).toBe('paused');
  });

  test('does not prime/pop when invincibility used', () => {
    const s = scenario('temple-dragon-shadow-invincibility');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('invincibility-enabled'))).toBe('paused');
  });
});

describe('Power Is All You Need', () => {
  const cheevo = achievement('Power Is All You Need');

  test('pops when finished Desert 1 without normal shots', () => {
    const s = scenario('desert1-no-normal-shots');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not prime anymore if normal shot fired', () => {
    const s = scenario('desert1-normal-shot-fired');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('normal-shot-fired'))).toBe('active');
  });
});

describe('Pumpkin Arrow', () => {
  const cheevo = achievement('Pumpkin Arrow');

  test('pops when hidden area unlocked', () => {
    const s = scenario('desert2-hidden-area');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('switch-activated'));
  });

  test('does not pop if level finished without visiting hidden area', () => {
    const s = scenario('desert2-finished-without-hidden-area');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Superpowers', () => {
  const cheevo = achievement('Superpowers');

  test('pops when level beaten with 3 force combo shot modifiers active - reflect3, xray1, doom1', () => {
    const s = scenario('desert-trial-3active');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.stateAt(s.marker('3-modifiers-active'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('pops when level beaten with 3 force combo shot modifiers active - magnet2, double3, drain1', () => {
    const s = scenario('desert-trial-3active2');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.stateAt(s.marker('3-modifiers-active'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not prime/pop if not active at the same time', () => {
    const s = scenario('desert-trial-sequential-modifiers');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });

  test('does not prime/pop if non-force related modifier active', () => {
    const s = scenario('desert-trial-different-modifier');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
    expect(result.stateAt(s.marker('2-and-2-modifiers-active'))).toBe('active');
  });
});

describe('Relicless', () => {
  const cheevo = achievement('Relicless');

  test('pops when beating Desert Shadow with no relics', () => {
    const s = scenario('desert-shadow-no-relics');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not prime or pop if carrying relics', () => {
    const s = scenario('desert-shadow-with-relics');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('paused');
    expect(result.triggered).toBe(false);
  });
});

describe('Heart of the Clouds', () => {
  const cheevo = achievement('Heart of the Clouds');

  test('pops when collecting the heart after shooting pumpkin', () => {
    const s = scenario('clouds1-pick-up-heart');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('heart-collected'));
  });

  test('pops when heart is collected before pumpkin is marked as destroyed', () => {
    const s = scenario('clouds1-pick-up-heart-before-pumpkin-destroyed');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('heart-collected'));
  });

  test('pops when bomb is used to destroy pumpkin', () => {
    const s = scenario('clouds1-bomb-pumpkin');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('heart-collected'));
  });

  test('does not pop if pumpkin is not destroyed', () => {
    const s = scenario('clouds1-heart-dropped-picked-up-again');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Clone Wars', () => {
  const cheevo = achievement('Clone Wars');

  test('pops when creating a decoy', () => {
    const s = scenario('clouds2-create-decoy');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('decoy-created'));
  });

  test('pops when creating an uber-decoy & walking away', () => {
    const s = scenario('clouds2-uber-decoy-walking');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('decoy-created'));
  });

  test('does not pop if wrong level', () => {
    const s = scenario('clouds1-decoy');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Young and Restless', () => {
  const cheevo = achievement('Young and Restless');

  test('pops when finishing the level without standing still as Wolfie', () => {
    const s = scenario('clouds-trial-wolfie-fast');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('pops when finishing the level without standing still as Wolfie, take 2', () => {
    const s = scenario('clouds-trial-wolfie-fast2');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not prime with different character', () => {
    const s = scenario('clouds-trial-drac');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });

  test('does not pop if too slow', () => {
    const s = scenario('clouds-trial-wolfie-slow');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('standing-still'))).toBe('active');
  });

  test('does not pop if trials failed', () => {
    const s = scenario('clouds-trial-wolfie-failed');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('trial-lost'))).toBe('active');
  });
});

describe('Marksman', () => {
  const cheevo = achievement('Marksman');

  test('pops when beating Clouds Shadow with 8 shots only', () => {
    const s = scenario('clouds-shadow-8-shots');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not prime anymore if too many shots', () => {
    const s = scenario('clouds-shadow-9-shots');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('9-shots-fired'))).toBe('active');
  });
});

describe('Big Drops', () => {
  const cheevo = achievement('Big Drops');

  test('pops when collecting 40 big atoms', () => {
    const s = scenario('factory1-collected-atoms');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    // Measured counts the number of 500+ Atom pickups towards 40
    expect(result.measuredTarget).toBe(40);
    expect(result.measuredAt(s.marker('collected-40-big-atoms'))).toBe(40);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('collected-40-big-atoms'));
  });

  // The Atom counter is zeroed on level start, which used to underflow the SubSource
  // (Mem - Delta wraps to ~4.29 billion, which passes ">= 500") and banked a free hit
  test('does not bank a hit when the Atom counter is zeroed on level start', () => {
    const s = scenario('cemetery-shadow-beat');
    const result = runAchievement(cheevo, s);

    expect(result.measuredAt(s.marker('level-start'))).toBe(0);
    expect(result.measuredAt(lastFrame(s))).toBe(0);
  });

  // Same underflow, second cause: an ailment drains 1 Atom every 32 frames while in-game,
  // so a gameState check alone does not cover it - only the Delta <= Mem guard does
  test('does not bank hits while the Atom-drain ailment ticks', () => {
    const s = scenario('desert1-normal-shot-fired');
    const result = runAchievement(cheevo, s);

    expect(result.measuredAt(lastFrame(s))).toBe(0);
  });
});

describe('Under the Watch', () => {
  const cheevo = achievement('Under the Watch');

  test('pops when destroying pumpkins', () => {
    const s = scenario('factory2-pumpkins-destroyed');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('pumpkins-destroyed'));
  });

  test('pops when destroying pumpkins, even if running away', () => {
    const s = scenario('factory2-pumpkins-destroyed-running');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('pumpkins-destroyed'));
  });

  test('pops when destroying pumpkins with bomb', () => {
    const s = scenario('factory2-pumpkins-destroyed-bomb');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('pumpkins-destroyed'));
  });

  test('no destroyed pumpkin slot ever returns to 1 while in the level', () => {
    for (const name of [
      'factory2-pumpkins-destroyed', 'factory2-pumpkins-destroyed-bomb',
      'factory2-pumpkins-destroyed-running',
    ]) {
      expect(slotsThatCameBackAlive(scenario(name), factory2ScarecrowPumpkins, levelFactory2)).toEqual([]);
    }
  });
});


describe('Shadow Boxing', () => {
  const cheevo = achievement('Shadow Boxing');

  test('pops when factory shadow beaten without being confused', () => {
    const s = scenario('factory-shadow-progression');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not prime/pop if confused', () => {
    const s = scenario('factory-shadow-confused');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('after-confused'))).toBe('paused');
  });
});


describe('Second Life', () => {
  const cheevo = achievement('Second Life');

  test('pops when reanimated and reached end of boss level', () => {
    const s = scenario('village-shadow-reanimated');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.stateAt(s.marker('reanimated'))).toBe('primed');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('pops when reanimated and reached end of regular level', () => {
    const s = scenario('cemetery1-reanimated');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop if level not finished after reanimation', () => {
    const s = scenario('cemetery1-reanimator-used-but-died');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('reanimator-used'))).toBe('primed');
    expect(result.stateAt(s.marker('game-over-screen'))).toBe('active');
  });
});

describe('Worth the Money', () => {
  const cheevo = achievement('Worth the Money');

  test('pops when finishing with 25k reached in Trial', () => {
    const s = scenario('desert-trial-25k-atoms');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop if level type is not Trial', () => {
    const s = scenario('factory1-collected-atoms');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });

  test('does not pop if Trial, but not enough Atoms collected', () => {
    const s = scenario('garden-trial-2-switch-activations');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Shop \'Til You Drop', () => {
  const cheevo = achievement('Shop \'Til You Drop');

  test('pops when buying 6 items (4 tools, 2 relics)', () => {
    const s = scenario('shop-buy-4-tools-2-relics');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('shop-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('6th-item-bought'));
  });

  test('does not pop when collected tools in level and only bought 5 in shop', () => {
    const s = scenario('shop-buy-5-tools');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('shop-start'))).toBe('active');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('level-select-after'))).toBe('reset');
  });

  test('does not pop when bought 3, played through level and re-entered the shop to buy 3 others', () => {
    const s = scenario('shop-buy-3-and-3-after-reenter');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('shop-start'))).toBe('active');
    expect(result.triggered).toBe(false);
    expect(result.stateAt(s.marker('level-select-inbetween'))).toBe('reset');
  });
});

describe('Ninja Skills', () => {
  const cheevo = achievement('Ninja Skills');

  test('pops when pumpkin destroyed while being invincible and using x-ray shot', () => {
    const s = scenario('cemetery1-invincible-xray');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('pumpkin-destroyed'));
  });

  test('pops when enemy defeated while being invincible and using x-ray shot', () => {
    const s = scenario('cemetery1-invincible-xray-enemy');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('enemy-killed'));
  });

  test('does not pop when not invincible', () => {
    const s = scenario('cemetery1-xray');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Saving for Later', () => {
  const cheevo = achievement('Saving for Later');

  test('pops when all slots filled', () => {
    const s = scenario('factory1-collect-4-tools');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('tool-slots-filled'));
  });

  test('does not pop when entered level with tools in slot 1', () => {
    const s = scenario('factory1-brought-health3-into-level');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('paused');
    expect(result.triggered).toBe(false);
  });

  test('does not pop when entered level with tool in slot 2', () => {
    const s = scenario('factory1-brought-health4-into-level');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('paused');
    expect(result.triggered).toBe(false);
  });

  test('does not pop when entered level with tool in slot 3', () => {
    const s = scenario('factory1-brought-health1-into-level');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('paused');
    expect(result.triggered).toBe(false);
  });

  test('does not pop when entered level with tool in slot 4', () => {
    const s = scenario('factory1-brought-health2-into-level');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('paused');
    expect(result.triggered).toBe(false);
  });
});

describe('Level Up', () => {
  const cheevo = achievement('Level Up');

  test('pops when blue relic collected in-game', () => {
    const s = scenario('factory1-collect-blue-relic');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('relic-collected'));
  });

  test('pops when blue Attack relic collected in shop', () => {
    const s = scenario('shop-bought-blue-relic');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('shop-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('relic-bought'));
  });

  test('pops when Luck blue relic collected in shop', () => {
    const s = scenario('shop-bought-blue-luck-relic');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('shop-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('relic-bought'));
  });
});

describe('Self Improvement', () => {
  const cheevo = achievement('Self Improvement');

  test('pops when consuming Attack Scroll', () => {
    const s = scenario('scroll-consumed-attack');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('scroll-consumed'));
  });

  test('pops when consuming Force Scroll', () => {
    const s = scenario('scroll-consumed-force');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('scroll-consumed'));
  });

  test('pops when consuming Health Scroll', () => {
    const s = scenario('scroll-consumed-health');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('scroll-consumed'));
  });
});


describe('Relics to the Rescue', () => {
  const cheevo = achievement('Relics to the Rescue');

  test('pops when having attack bonus of +20%', () => {
    const s = scenario('relics-attack-bonus');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('relic-collected'));
  });

  test('pops when having force bonus of +40%', () => {
    const s = scenario('relics-force-bonus');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('relic-collected'));
  });

  test('does not pop if bonus not high enough', () => {
    const s = scenario('relics-not-enough-bonus');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('All Green', () => {
  const cheevo = achievement('All Green');

  test('pops when first slot is filled with 4th green relic', () => {
    const s = scenario('all-green-relics-1st-slot');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('4th-green-relic-slot1'));
  });

  test('pops when 2nd slot is filled green relic', () => {
    const s = scenario('all-green-relics-2nd-slot');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('4th-green-relic-slot2'));
  });

  test('pops when 3rd slot is filled green relic', () => {
    const s = scenario('all-green-relics-3rd-slot');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('4th-green-relic-slot3'));
  });

  test('pops when 4th slot is filled green relic', () => {
    const s = scenario('all-green-relics-4th-slot');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('4th-green-relic-slot4'));
  });

  test('pops when 4x the same green relic', () => {
    const s = scenario('all-green-relics-4x-same');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('shop-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('4th-green-relic'));
  });
});

describe('Cloak of Safety', () => {
  const cheevo = achievement('Cloak of Safety');

  test('pops when bought Cloak in shop', () => {
    const s = scenario('shop-bought-cloak-slot1');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('bought-cloak'));
  });

  test('pops when bought Cloak in shop in slot 3', () => {
    const s = scenario('shop-bought-cloak-slot3');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('bought-cloak'));
  });

  test('pops when dropped in game', () => {
    const s = scenario('factory1-multiple-healing-wolfie2');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('picked-up-cloak'));
  });
});

describe('Igor\'s Favorite', () => {
  const cheevo = achievement('Igor\'s Favorite');

  test('pops when 50k Atoms reached', () => {
    const s = scenario('50k-atoms-reached');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('50k-atoms-reached'));
  });

  test('does not pop again on a score screen when the bank is already above 50k', () => {
    const s = scenario('garden-trial-2-switch-activations');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('score-screen'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Using the Force', () => {
  const cheevo = achievement('Using the Force');

  test('pops when Force level of 20% is reached', () => {
    const s = scenario('upgrade-stats');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('force-level-upgraded'));
  });

  test('does not pop when an Attack Scroll is consumed instead', () => {
    const s = scenario('scroll-consumed-attack');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scroll-consumed'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('This Isn\'t Even My Final Form', () => {
  const cheevo = achievement('This Isn\'t Even My Final Form');

  test('pops when Attack level of 30% is reached', () => {
    const s = scenario('upgrade-stats');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('attack-level-upgraded'));
  });

  test('does not pop when a Force Scroll is consumed instead', () => {
    const s = scenario('scroll-consumed-force');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scroll-consumed'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('A Pumpkin a Day', () => {
  const cheevo = achievement('A Pumpkin a Day');

  test('pops when Health of 40 HP is reached', () => {
    const s = scenario('upgrade-stats');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('health-upgraded'));
  });

  test('does not pop when an Attack Scroll is consumed instead', () => {
    const s = scenario('scroll-consumed-attack');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scroll-consumed'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Silver Lining', () => {
  const cheevo = achievement('Silver Lining');

  test('pops when all regular levels are Silver or better', () => {
    const s = scenario('cemetery1-finish-silver-or-better');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });

  test('does not pop if Silver in wrong level', () => {
    const s = scenario('silver-for-all-trials-and-boss-levels');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Silver Sweep', () => {
  const cheevo = achievement('Silver Sweep');

  test('pops when all trials & boss levels are Silver or better, even if achieved Crystal', () => {
    const s = scenario('silver-for-all-trials-and-boss-levels');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });

  test('does not pop if Silver in wrong level', () => {
    const s = scenario('cemetery1-finish-silver-or-better');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(false);
  });
});

describe('Gold Medal', () => {
  const cheevo = achievement('Gold Medal');

  test('pops when all regular levels are Gold or better', () => {
    const s = scenario('gold-for-all-regular-levels');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });

  test('does not pop if not enough Gold levels', () => {
    const s = scenario('gold-one-missing');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(false);
  });
});

describe('Gold Standard', () => {
  const cheevo = achievement('Gold Standard');

  test('pops when last Gold/Crystal ranking was reached on score screen', () => {
    const s = scenario('crystal-reach-37-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });

  test('does not pop when the regular levels go Gold, only the boss levels count', () => {
    const s = scenario('gold-for-all-regular-levels');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Gold Rush', () => {
  const cheevo = achievement('Gold Rush');

  test('pops when all trials have Gold ranking', () => {
    const s = scenario('gold-last-time-trial');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });

  test('does not pop when the regular levels go Gold, only the trials count', () => {
    const s = scenario('gold-for-all-regular-levels');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('First Crystal', () => {
  const cheevo = achievement('First Crystal');

  test('pops when first Crystal ranking was reached', () => {
    const s = scenario('cemetery1-finish-ranking-crystal');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });

  test('does not pop if save state is loaded with 1 Crystal ranking', () => {
    const s = scenario('load-save-state-with-1-crystal-ranking');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-select'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Crystal Collection', () => {
  const cheevo = achievement('Crystal Collection');

  test('pops when 10th Crystal ranking was reached on score screen', () => {
    const s = scenario('crystal-reach-10-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });

  test('does not pop on a later Crystal when the count is already past 10', () => {
    const s = scenario('crystal-reach-36-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Crystallized', () => {
  const cheevo = achievement('Crystallized');

  test('pops when 20th Crystal ranking was reached on score screen', () => {
    const s = scenario('crystal-reach-20-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });

  test('does not pop on a later Crystal when the count is already past 20', () => {
    const s = scenario('crystal-reach-36-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Five of a Kind', () => {
  const cheevo = achievement('Five of a Kind');

  test('pops when last Crystal ranking was reached on score screen', () => {
    const s = scenario('crystal-reach-37-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });

  test('does not pop if a Crystal is missing', () => {
    const s = scenario('crystal-reach-36-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('Ranking achievements: skip-level cheat protection', () => {
  const rankingCheevos = [
    'Silver Lining', 'Silver Sweep', 'Gold Medal', 'Gold Rush', 'Gold Standard',
    'First Crystal', 'Crystal Collection', 'Crystallized', 'Five of a Kind',
  ];

  test('skip-level cheat can award a Gold ranking on a boss level', () => {
    const s = scenario('desert-shadow-cheat-finish');
    const desertShadowRanking = 0x35b8 + 23;

    // Rank is written on the score screen that the cheat jumps to
    expect(s.valueAt(s.marker('level-start'), desertShadowRanking)).toBe(0);
    expect(s.valueAt(s.marker('score-screen'), desertShadowRanking)).toBe(5);
  });

  test.each(rankingCheevos)('%s is locked from the skip until the level select', (title) => {
    const s = scenario('desert-shadow-cheat-finish');
    const result = runAchievement(achievement(title), s);
    const skipUsed = 164299;

    expect(result.stateAt(skipUsed - 1)).toBe('active');
    expect(result.stateAt(skipUsed)).toBe('paused');
    expect(result.stateAt(s.marker('score-screen'))).toBe('paused');

    // The lock is not permanent: leaving for the level select clears it again
    expect(result.stateAt(s.marker('level-select-screen'))).toBe('active');
  });

  test('a clean ranking run is not locked', () => {
    const s = scenario('silver-for-all-trials-and-boss-levels');
    const result = runAchievement(achievement('Gold Standard'), s);

    expect(result.stateAt(s.marker('rank-written'))).toBe('active');
  });
});

describe('Different Perspective', () => {
  const cheevo = achievement('Different Perspective');

  test('pops when Cemetery Shadow was defeated using Mina', () => {
    const s = scenario('cemetery-shadow-mina');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('pops when Cemetery Shadow was defeated using Drew', () => {
    const s = scenario('cemetery-shadow-drew-no-cheats');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop when Drew was selected with the character select cheat', () => {
    const s = scenario('cemetery-shadow-drew');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

describe('New Game Plus', () => {
  const cheevo = achievement('New Game Plus');

  test('pops when Sergeant Smash was defeated using Mina', () => {
    const s = scenario('castle-sergeant-smash-mina');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not pop when the game is beaten with a starting character', () => {
    const s = scenario('castle-shadow-progression');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);
  });
});

/* ========= LEADERBOARDS ========= */

const leaderboard = (title) => Object.values(set.leaderboards).find((l) => l.title === title);

// Use LB start/cancel/submit as conditions like achievement
const lbTrigger = (lb, part) => ({conditions: lb.conditions[part]});

// Make value expression parseable as a trigger while measuredAt() still reports the value: adds comparison or hit count as needed
const lbValue = (lb) => {
  const value = `${lb.conditions.value}`;
  return /[<>=!]/.test(value) ? `${value}.4294967295.` : `${value}>=4294967295`;
};

describe('Leaderboard: Cemetery Trial Speedrun (timed)', () => {
  const lb = leaderboard('Cemetery Trial Speedrun');

  test('starts when the Cemetery Trial is entered', () => {
    const s = scenario('cemetery-trial-started');
    const result = runAchievement(lbTrigger(lb, 'start'), s);

    expect(result.triggeredFrame).toBe(s.marker('level-start'));
  });

  test('submits on the score screen when the Trial is finished', () => {
    const s = scenario('cemetery-trial-with-100-atoms');
    const result = runAchievement(lbTrigger(lb, 'submit'), s);

    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not submit when the Trial is failed', () => {
    const s = scenario('cemetery-trial-failed');
    const result = runAchievement(lbTrigger(lb, 'submit'), s);

    expect(result.triggered).toBe(false);
  });

  test('cancels when the player leaves the level for the level select', () => {
    const s = scenario('cemetery-trial-failed');
    const result = runAchievement(lbTrigger(lb, 'cancel'), s);

    // Failed Trial drops back to the level select
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('level-select-after'));
  });

  test('does not cancel during a clean run', () => {
    const s = scenario('cemetery-trial-with-100-atoms');
    const result = runAchievement(lbTrigger(lb, 'cancel'), s);

    expect(result.triggered).toBe(false);
  });

  test('cancels as soon as the invincibility cheat is enabled', () => {
    const s = scenario('cemetery1-finish-cheat-invincibility');
    const result = runAchievement(lbTrigger(lb, 'cancel'), s);

    expect(result.triggeredFrame).toBe(s.marker('cheat-enabled'));
  });

  test('cancels on the frame the skip-level cheat takes effect', () => {
    const s = scenario('cemetery1-finish-cheat-level-skip');
    const result = runAchievement(lbTrigger(lb, 'cancel'), s);

    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
    expect(result.triggeredFrame).toBeGreaterThan(s.marker('skip-used'));
  });

  test('submits the level timer in frames', () => {
    const s = scenario('cemetery-trial-with-100-atoms');
    const result = runAchievement(lbValue(lb), s);

    expect(result.measuredAt(s.marker('score-screen'))).toBe(1886);
  });
});

describe('Leaderboard: Clouds Trial Speedrun (timer wrap-around)', () => {
  const lb = leaderboard('Clouds Trial Speedrun');

  // Recorded by staying in the Clouds Trial past 18:12, where the 16-bit level timer overflows
  const wrapFrame = 52167;
  const levelTime = 0x359c;

  test('the recorded run overflows the level timer while in-game', () => {
    const s = scenario('clouds-trial-time-wraparound');

    expect(s.valueAt(wrapFrame - 1, levelTime)).toBe(65535);
    expect(s.valueAt(wrapFrame, levelTime)).toBe(0);
  });

  test('cancels on the frame the level timer wraps around', () => {
    const s = scenario('clouds-trial-time-wraparound');
    const result = runAchievement(lbTrigger(lb, 'cancel'), s);

    expect(result.triggeredFrame).toBe(wrapFrame);
  });

  test('does not cancel when the timer resets on a level start (Castle 1 to 4 chain)', () => {
    const s = scenario('castle1-boss-rush-fast');
    const result = runAchievement(lbTrigger(lb, 'cancel'), s);

    // Only cancels on the level select after the run, long after the last level transition
    expect(result.triggeredFrame).toBeGreaterThan(s.marker('score-screen'));
  });
});

describe('Leaderboard: Cemetery Level 1 Atoms (score)', () => {
  const lb = leaderboard('Cemetery Level 1 Atoms');

  // Instant LB: START fires on the score screen
  test('starts/submits on the score screen when the level is finished', () => {
    const s = scenario('cemetery1-finish-ranking-crystal');
    const result = runAchievement(lbTrigger(lb, 'start'), s);

    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('starts/submits on a rank-0 finish too', () => {
    const s = scenario('cemetery1-finish-ranking-0');
    const result = runAchievement(lbTrigger(lb, 'start'), s);

    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('does not start when the invincibility cheat was used', () => {
    const s = scenario('cemetery1-finish-cheat-invincibility');
    const result = runAchievement(lbTrigger(lb, 'start'), s);

    expect(result.triggered).toBe(false);
    expect(result.stateAt(s.marker('cheat-enabled'))).toBe('paused');

    // The level select resets the PauseLock, but the cheat is still enabled here, so the PauseIf fires again right away
    expect(result.stateAt(s.marker('level-select-screen'))).toBe('paused');
  });

  test('lifts the pause on the level select when the invincibility cheat was disabled again', () => {
    const s = scenario('cemetery1-finish-cheat-invincibility-inactive');
    const result = runAchievement(lbTrigger(lb, 'start'), s);

    expect(result.triggered).toBe(false);

    // Pause stays latched for the rest of the run, even after the cheat is switched off
    expect(result.stateAt(s.marker('cheat-disabled'))).toBe('paused');
    expect(result.stateAt(s.marker('score-screen'))).toBe('paused');

    // The pause is lifted again on the level select, ready for the next attempt
    expect(result.stateAt(s.marker('level-select-screen'))).toBe('active');
  });

  test('does not start when the level was finished with the skip-level cheat', () => {
    const s = scenario('cemetery1-finish-cheat-level-skip');
    const result = runAchievement(lbTrigger(lb, 'start'), s);

    expect(result.triggered).toBe(false);
    expect(result.wasEver('paused')).toBe(true);
    expect(result.stateAt(s.marker('level-select-screen'))).toBe('active');
  });

  test('does not start on the score screen of a different level', () => {
    const s = scenario('cemetery-shadow-beat');
    const result = runAchievement(lbTrigger(lb, 'start'), s);

    expect(result.triggered).toBe(false);
  });

  test('submits the Atoms collected in the level', () => {
    const s = scenario('cemetery1-finish-ranking-crystal');
    const result = runAchievement(lbValue(lb), s);

    expect(result.measuredAt(s.marker('score-screen'))).toBe(4800);
  });
});

describe('Leaderboard: Castle Boss Rush Speedrun (timed)', () => {
  const lb = leaderboard('Castle Boss Rush Speedrun');

  test('starts when Castle Level 1 is entered', () => {
    const s = scenario('castle1-boss-rush-fast');
    const result = runAchievement(lbTrigger(lb, 'start'), s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBeLessThan(s.marker('castle1-start'));
  });

  test('does not start when the run is entered at Castle Level 2', () => {
    const s = scenario('castle2-fast');
    const result = runAchievement(lbTrigger(lb, 'start'), s);

    expect(result.triggered).toBe(false);
  });

  test('submits on the Castle Level 4 score screen', () => {
    const s = scenario('castle1-boss-rush-fast');
    const result = runAchievement(lbTrigger(lb, 'submit'), s);

    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });

  test('cancels as soon as a cheat is used mid-run', () => {
    const s = scenario('castle1-boss-rush-cheat');
    const result = runAchievement(lbTrigger(lb, 'cancel'), s);

    expect(result.triggeredFrame).toBe(s.marker('cheat-used'));

    // Cancel takes priority over Submit, and here it fires well before it
    const submit = runAchievement(lbTrigger(lb, 'submit'), s);
    expect(result.triggeredFrame).toBeLessThan(submit.triggeredFrame);
  });

  test('submits total time of all 4 boss rush levels', () => {
    const s = scenario('castle1-boss-rush-fast');
    const result = runAchievement(lbValue(lb), s);
    const start = runAchievement(lbTrigger(lb, 'start'), s).triggeredFrame;
    const submit = runAchievement(lbTrigger(lb, 'submit'), s).triggeredFrame;
    const measured = result.measuredAt(submit);

    expect(result.measuredAt(start)).toBe(1);

    // Run total: 5242 frames - 1815 score + shop screens = 3427 frames of actual in-game time
    expect(submit - start + 1).toBe(5242);
    expect(measured).toBe(3427);
    expect(submit - start + 1 - measured).toBe(1815);

    // Make sure it is bigger than levelTime of last level, Castle 4
    expect(measured).toBeGreaterThan(435);
  });

  test('submits a bigger total for a slower run', () => {
    const s = scenario('castle1-boss-rush-slow');
    const result = runAchievement(lbValue(lb), s);
    const submit = runAchievement(lbTrigger(lb, 'submit'), s).triggeredFrame;

    // Cross-check against the Boss Rush achievement, which locks at 3600 in-game frames:
    // the fast run measures 3427 (under) and this one 6752 (over), and the achievement pops for the fast scenario only
    expect(result.measuredAt(submit)).toBe(6752);
    expect(runAchievement(achievement('Boss Rush'), s).triggered).toBe(false);
    expect(runAchievement(achievement('Boss Rush'), scenario('castle1-boss-rush-fast')).triggered).toBe(true);
  });
});

