#!/usr/bin/env node

'use strict'; // eslint-disable-line strict, lines-around-directive

const childProcess = require('child_process');
const fs = require('fs');
const packageJson = require('../package.json');

const exec = childProcess.exec;
const execSync = childProcess.execSync;
const order = [
  'statements',
  'branches',
  'functions',
  'lines',
];

exec('npm run-script coverage:report', (error, stdOut, stdErr) => {
  if (error) {
    console.log(`[Coverage Update] ${stdErr}.`);
  }

  let changed = false;

  stdOut.split('\n')
    .filter((line) => line.includes('All files'))
    .map((line) => line.match(/([0-9]+(\.)*[0-9]*)/g))
    .reduce(() => null)
    .map((i) => Number(i))
    .forEach((cov, i) => {
      if (cov > packageJson.nyc[order[i]]) {
        packageJson.nyc[order[i]] = cov;
        changed = true;
      }
    });

  if (changed) {
    fs.writeFile('package.json', JSON.stringify(packageJson, null, 2), (err) => {
      if (err) {
        console.log(`[Coverage Update] ${err}.`);
      }

      execSync('git add package.json');
      execSync('git commit -m "[System] Update each threshold for test coverage"');

      console.log('[Coverage Update] Each threshold is updated for test coverage.');
    });
  } else {
    console.log('[Coverage Update] No threshold is updated for test coverage.');
  }
});
