#!/usr/bin/env node
/*
 * Reports how many playtest tests exist per achievement.
 *
 * Tests are grouped in describe blocks that pick their achievement by title
 * (`const cheevo = achievement('...')`), so every test() below such a call counts
 * towards that achievement. Commented-out tests are counted separately, since they
 * mark work that is drafted but not running.
 *
 * Usage: node scripts/test-coverage.js               - every achievement set with tests
 *        node scripts/test-coverage.js monster-force - just that set
 */

import {globSync, readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const ACHIEVEMENT_CALL = /achievement\(\s*(['"`])((?:\\.|(?!\1).)*)\1\s*\)/;
const TEST_CALL = /(?:^|[^.\w])(?:test|it)(?:\.\w+)?\s*\(/;
const DESCRIBE_CALL = /(?:^|[^.\w])describe(?:\.\w+)?\s*\(/;

const unescapeTitle = (raw) => raw.replace(/\\(.)/g, '$1');

/*
 * Walks the test file top to bottom: an achievement() call claims every test below it,
 * until the next describe block starts over with an achievement of its own.
 */
const countTests = (source) => {
  const counts = new Map;
  let current = null;

  const bump = (key) => {
    if (!current) return;
    const entry = counts.get(current);
    entry[key] += 1;
  };

  for (const line of source.split(/\r?\n/)) {
    const commented = line.trim().startsWith('//');
    const code = commented ? line.trim().replace(/^\/+\s?/, '') : line;

    if (DESCRIBE_CALL.test(code)) current = null;

    const match = ACHIEVEMENT_CALL.exec(code);
    if (match) {
      current = unescapeTitle(match[2]);
      if (!counts.has(current)) counts.set(current, {tests: 0, commented: 0});
      continue;
    }

    if (TEST_CALL.test(code)) bump(commented ? 'commented' : 'tests');
  }

  return counts;
};

const report = async (setFile, testFiles) => {
  const source = readFileSync(setFile, 'utf8');
  const set = (await import(pathToFileURL(setFile))).default;

  const counts = new Map;
  for (const file of testFiles) {
    for (const [title, entry] of countTests(readFileSync(file, 'utf8'))) {
      const total = counts.get(title) ?? {tests: 0, commented: 0};
      counts.set(title, {tests: total.tests + entry.tests, commented: total.commented + entry.commented});
    }
  }

  // Achievements are listed in set file order, which groups progression before challenges.
  const rows = Object.values(set.achievements)
    .map((cheevo) => {
      const position = source.indexOf(`title: '${cheevo.title.replace(/'/g, '\\\'')}'`);
      const entry = counts.get(cheevo.title) ?? {tests: 0, commented: 0};
      return {title: cheevo.title, position: position === -1 ? Infinity : position, ...entry};
    })
    .sort((a, b) => a.position - b.position);

  const width = Math.max(...rows.map((row) => row.title.length));
  const tested = rows.filter((row) => row.tests > 0);
  const total = rows.reduce((sum, row) => sum + row.tests, 0);

  console.log(`\n${set.title} - ${total} tests over ${tested.length}/${rows.length} achievements\n`);

  for (const row of rows) {
    const marker = row.tests > 0 ? '*'.repeat(row.tests) : '-';
    const drafted = row.commented > 0 ? `  (${row.commented} commented out)` : '';
    console.log(`  ${row.title.padEnd(width)}  ${String(row.tests).padStart(2)}  ${marker}${drafted}`);
  }

  const untested = rows.filter((row) => row.tests === 0);
  if (untested.length > 0) {
    console.log(`\n  Without tests: ${untested.map((row) => row.title).join(', ')}`);
  }

  // A title that no achievement matches means the test file and the set have drifted apart.
  const unknown = [...counts.keys()].filter((title) => !rows.some((row) => row.title === title));
  if (unknown.length > 0) {
    console.log(`\n  Not found in the set: ${unknown.join(', ')}`);
  }
};

const args = process.argv.slice(2);
const dirs = args.length > 0
  ? args.map((arg) => arg.replace(/[\\/]+$/, ''))
  : [...new Set(globSync('*/*.test.js').map((file) => file.replace(/\\/g, '/').split('/')[0]))];

for (const dir of dirs) {
  const testFiles = globSync(`${dir}/*.test.js`);
  if (testFiles.length === 0) {
    console.log(`no tests found in ${dir}`);
    continue;
  }
  await report(`${process.cwd()}/${dir}/${dir}.js`, testFiles);
}
