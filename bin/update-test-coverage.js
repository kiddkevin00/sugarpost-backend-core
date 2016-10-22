#!/usr/bin/env node

'use strict';

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

exec('npm run-script coverage:report', (err, stdOut, stdErr) => {
  if (err) {
    console.log(`[Coverage] ${stdErr}`);
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
        console.log(`[Coverage] ${err}`);
      }

      execSync('git add package.json');
      execSync('git commit -m "Update each threshold for test coverage"');

      console.log('[Coverage] Each threshold is updated for test coverage')
    });
  } else {
    console.log('[Coverage] No threshold is updated for test coverage')
  }
});
