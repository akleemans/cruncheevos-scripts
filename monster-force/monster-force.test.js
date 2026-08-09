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

describe('Challenge: Walking Through Walls', () => {
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

describe('Challenge: Every Atom Counts', () => {
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

describe('Challenge: One at a Time', () => {
  const cheevo = achievement('One at a Time');

  test('pops when boss beaten in 10 seconds', () => {
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

describe('Challenge: You Only Got One Shot', () => {
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

describe('Challenge: Dracula\'s Favorite', () => {
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

describe('Challenge: Divide & Conquer', () => {
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

describe('Challenge: Halloween\'s Over', () => {
  const cheevo = achievement('Halloween\'s Over');

  test('pops if all pumpkins destroyed', () => {
    const s = scenario('atlantis2-all-pumpkins-destroyed');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('last-pumpkin-destroyed'));
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

  test('does not pop when teleported three times', () => {
    const s = scenario('village2-teleporting-3-times');

    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('primed');
    expect(result.triggered).toBe(false);

    expect(result.stateAt(s.marker('after-third-teleport'))).toBe('paused');
  });
});

describe('Challenge: Slowly but Steady', () => {
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

describe('Challenge: Monet\'s Garden', () => {
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

describe('Challenge: Wolfskin', () => {
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

describe('Challenge: Metal Detector', () => {
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

describe('Challenge: Blood Thirst', () => {
  const cheevo = achievement('Blood Thirst');

  test('pops when finishing Atlantis Trial without taking damage', () => {
    const s = scenario('temple1-enemies-killed');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('scenario-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('50-enemies-killed'));
  });
});

describe('Challenge: Heart of the Clouds', () => {
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

describe('Challenge: Clone Wars', () => {
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

describe('Challenge: Young and Restless', () => {
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


describe('Challenge: Silver Lining', () => {
  const cheevo = achievement('Silver Lining');

  test('pops when all regular levels are Silver or better', () => {
    const s = scenario('cemetery1-finish-silver-or-better');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });
});

describe('Challenge: Silver Sweep', () => {
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

describe('Challenge: Gold Medal', () => {
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

describe('Challenge: Gold Standard', () => {
  const cheevo = achievement('Gold Standard');

  test('pops when last Gold/Crystal ranking was reached on score screen', () => {
    const s = scenario('crystal-reach-37-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });
});

describe('Challenge: Gold Rush', () => {
  const cheevo = achievement('Gold Rush');

  test('pops when all trials have Gold ranking', () => {
    const s = scenario('gold-last-time-trial');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });
});

describe('Challenge: First Crystal', () => {
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

describe('Challenge: Crystal Collection', () => {
  const cheevo = achievement('Crystal Collection');

  test('pops when 10th Crystal ranking was reached on score screen', () => {
    const s = scenario('crystal-reach-10-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });
});

describe('Challenge: Crystallized', () => {
  const cheevo = achievement('Crystallized');

  test('pops when 20th Crystal ranking was reached on score screen', () => {
    const s = scenario('crystal-reach-20-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });
});

describe('Challenge: Five of a Kind', () => {
  const cheevo = achievement('Five of a Kind');

  test('pops when last Crystal ranking was reached on score screen', () => {
    const s = scenario('crystal-reach-37-rankings');
    const result = runAchievement(cheevo, s);

    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('rank-written'));
  });
});

describe('Challenge: Different Perspective', () => {
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

describe('Challenge: New Game Plus', () => {
  const cheevo = achievement('New Game Plus');

  test('pops when Cemetery Shadow was defeated using Mina', () => {
    const s = scenario('castle-sergeant-smash-mina');
    const result = runAchievement(cheevo, s);

    expect(result.stateAt(s.marker('level-start'))).toBe('active');
    expect(result.triggered).toBe(true);
    expect(result.triggeredFrame).toBe(s.marker('score-screen'));
  });
});

