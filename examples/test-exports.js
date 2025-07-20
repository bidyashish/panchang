#!/usr/bin/env node

// Test what's actually exported
const exports = require('../dist/index.js');

console.log('Available exports:');
console.log(Object.keys(exports));

console.log('\nTesting individual functions:');
console.log('getCurrentPlanets:', typeof exports.getCurrentPlanets);
console.log('getPanchangaReport:', typeof exports.getPanchangaReport);
console.log('generatePanchangaReport:', typeof exports.generatePanchangaReport);
