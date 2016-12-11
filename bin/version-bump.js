#!/usr/bin/env node

'use strict'; // eslint-disable-line strict, lines-around-directive

const packageJson = require('../package.json');
const Promise = require('bluebird');
const fs = require('fs');
const childProcess = require('child_process');

Promise.promisifyAll(fs);

const newVersion = process.argv[process.argv.length - 1];

console.log(`[Version Bump] Updating version to ${newVersion}`);

const promises = [];
const updateFilePaths = [];
const versionRegex = /[0-9]+.[0-9]+.[0-9]+/g;

for (const filePath of updateFilePaths) {
  const promise = fs.readFileAsync(filePath, 'utf8')
    .then((content) => {
      const newContent = content.replace(versionRegex, `${newVersion}`);

      return fs.writeFileAsync(filePath, newContent);
    });

  promises.push(promise);
}

const execSync = childProcess.execSync;
const packageJsonFileName = 'package.json';
const newPackageJson = JSON.parse(JSON.stringify(packageJson));

newPackageJson.version = newVersion;

Promise.all(promises)
  .then(() => fs.writeFileAsync(packageJsonFileName, `${JSON.stringify(newPackageJson, null, 2)}\n`))
  .then(() => {
    let gitAddExecString = 'git add ';
    const gitAddFilePaths = [packageJsonFileName].concat(updateFilePaths);

    for (const filePath of gitAddFilePaths) {
      gitAddExecString += `${filePath} `;
    }

    execSync(gitAddExecString);
    execSync(`git commit -m "[System] Bump the version to ${newVersion}."`);
  })
  .then(() => console.log('[Version Bump] All files containing version number are updated.'))
  .catch((err) => {
    console.log(`[Version Bump] ${err}.`);
  });
