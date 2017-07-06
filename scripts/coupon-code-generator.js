#!/usr/bin/env node

'use strict'; // eslint-disable-line strict, lines-around-directive

const cc = require('coupon-code');


let codesStr = '';

for (let i = 0; i < 20; i += 1) {
  const code = cc.generate({
    parts: 1,
    partLen: 6,
  });

  if (i === 0) {
    codesStr += code;
  } else {
    codesStr += `, ${code}`;
  }
}

console.log('Here is 20 valid codes with comma separation:\n', codesStr);
