#!/usr/bin/env node
/*
 * Aligns the columns of single-line condition arrays so they read as a table.
 *
 * Conditions are positional - [flag, lType, lSize, lValue, cmp, rType, rSize, rValue, hits] -
 * which is hard to scan when the columns wander. This pads consecutive arrays at the same
 * indent to a common width. Alignment groups reset at any non-array line (comment, spread,
 * blank), so a long value only widens its own block.
 *
 * Usage: npm run format            - every achievement set
 *        npm run format -- <file>  - just that file
 */

import {globSync, readFileSync, writeFileSync} from 'node:fs';

const ARRAY_LINE = /^(\s*)(\[.*\](?:,?))$/;

/* Splits on commas that are at bracket depth 0 and outside of strings. */
const splitElements = (body) => {
  const elements = [];
  let current = '';
  let depth = 0;
  let quote = null;

  for (const char of body) {
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }
    if (char === '\'' || char === '"' || char === '`') {
      quote = char;
      current += char;
      continue;
    }
    if (char === '[' || char === '(' || char === '{') depth++;
    if (char === ']' || char === ')' || char === '}') depth--;
    if (char === ',' && depth === 0) {
      elements.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim() !== '') elements.push(current.trim());

  return elements;
};

/* Returns null if the line is not a plain single-line array literal. */
const parseLine = (line) => {
  const match = ARRAY_LINE.exec(line);
  if (!match) return null;

  const [, indent, array] = match;
  const trailingComma = array.endsWith(',');
  const inner = array.slice(1, trailingComma ? -2 : -1);

  // Nested arrays would need real column semantics we do not have - leave them alone.
  if (inner.includes('[')) return null;

  return {indent, elements: splitElements(inner), trailingComma};
};

const alignGroup = (rows) => {
  // Every element widens its column, including one that ends its own row: rows carrying an
  // extra trailing hits value must push it clear of the longest value in the column before it.
  const widths = [];
  for (const row of rows) {
    row.elements.forEach((element, i) => {
      widths[i] = Math.max(widths[i] ?? 0, element.length);
    });
  }

  return rows.map(({indent, elements, trailingComma}) => {
    const padded = elements.map((element, i) => (
      i === elements.length - 1 ? element : `${element},`.padEnd(widths[i] + 2)
    ));
    return `${indent}[${padded.join('')}]${trailingComma ? ',' : ''}`;
  });
};

const alignSource = (source) => {
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const lines = source.split(/\r?\n/);
  const output = [];
  let group = [];

  const flush = () => {
    const rows = group.filter((entry) => entry.parsed);
    if (rows.length > 1) {
      const aligned = alignGroup(rows.map((entry) => entry.parsed));
      let next = 0;
      for (const entry of group) output.push(entry.parsed ? aligned[next++] : entry.line);
    } else {
      for (const entry of group) output.push(entry.line);
    }
    group = [];
  };

  const indentOf = (line) => /^\s*/.exec(line)[0];

  for (const line of lines) {
    const parsed = parseLine(line);
    const groupIndent = group.length > 0 ? group[0].parsed.indent : null;

    if (parsed && (groupIndent === null || groupIndent === parsed.indent)) {
      group.push({line, parsed});
      continue;
    }
    // A comment between conditions annotates them - keep it inside the alignment group.
    if (!parsed && groupIndent !== null && line.trim().startsWith('//') && indentOf(line) === groupIndent) {
      group.push({line, parsed: null});
      continue;
    }
    flush();
    if (parsed) group.push({line, parsed});
    else output.push(line);
  }
  flush();

  return output.join(eol);
};

// With no arguments, format every achievement set in the repo.
const args = process.argv.slice(2);
const files = args.length > 0
  ? args
  : globSync('*/*.js').filter((file) => {
    const dir = file.replace(/\\/g, '/').split('/')[0];
    return !file.endsWith('.test.js') && dir !== 'node_modules' && dir !== 'scripts';
  });

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const aligned = alignSource(source);
  if (aligned === source) {
    console.log(`unchanged ${file}`);
    continue;
  }
  writeFileSync(file, aligned);
  console.log(`aligned   ${file}`);
}
