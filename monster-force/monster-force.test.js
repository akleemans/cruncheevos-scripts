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

  test('pops when Temple Shadow is defeated', () => {
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

describe('Walking Through Walls', () => {
  const cheevo = achievement('Walking Through Walls');

  test('pops when pumpkins are destroyed', () => {
    const s = scenario('cemetery1-hidden-pumpkins');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

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

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('70th-pumpkin-destroyed'));
  });

  test('does not pop if pumpkins destroyed but bomb was used', () => {
    const s = scenario('atlantis2-all-pumpkins-destroyed-bomb-used');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(false);

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

  test('pops when 50 enemies are destroyed in Temple Level 1', () => {
    const s = scenario('temple1-enemies-killed');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('50-enemies-killed'));
  });

  // TODO add test with non-Drac character
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

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('collected-40-big-atoms'));
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

  // TODO add test for buying 3, exit shop, and buy 3 in next round
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

  // TODO
  test('does not pop when entered level with tools in slot 1', () => {
    const s = scenario('factory1-brought-health1-into-level-slot1');
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

  // TODO also pop if 4x the same amulet
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
});

describe('Gold Rush', () => {
  const cheevo = achievement('Gold Rush');

  test('pops when all trials have Gold ranking', () => {
    const s = scenario('gold-last-time-trial');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
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
});

describe('Crystallized', () => {
  const cheevo = achievement('Crystallized');

  test('pops when 20th Crystal ranking was reached on score screen', () => {
    const s = scenario('crystal-reach-20-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
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

  // TODO add test for 36 rankings
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
    const s = scenario('cemetery-shadow-drew');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
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
});

