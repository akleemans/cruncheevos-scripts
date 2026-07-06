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


describe('Progression: Cemetery Zone', () => {
    const cheevo = achievement('No Time to Die');

    test('pops when Cemetery Shadow is defeated', () => {
        const s = scenario('cemetery-shadow-beat');
        const result = runAchievement(cheevo, s);

        expect(result.stateAt(s.marker('level-start'))).toBe('active');

        expect(result.triggered).toBe(true);
        expect(result.triggeredFrame).toBe(s.marker('save-game-screen'));
    });

    test('should not pop on Cemetery 1 finish', () => {
        const s = scenario('cemetery1-finish-ranking-crystal');
        const result = runAchievement(cheevo, s);

        expect(result.triggered).toBe(false);
    });

    // TODO should not pop on next level
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

    test('should not pop when too late', () => {
        const s = scenario('cemetery2-challenge-too-late');
        const result = runAchievement(cheevo, s);

        expect(result.stateAt(s.marker('level-select'))).toBe('active');
        expect(result.stateAt(s.marker('level-start'))).toBe('primed');
        expect(result.triggered).toBe(false);

        expect(result.stateAt(s.marker('timer-5-seconds'))).toBe('paused');
        expect(result.stateAt(s.marker('score-800'))).toBe('paused');
    });
});
