'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {evaluate,format} = require('./calculator.js');
const calc = source => evaluate(source).value;
test('precedence, implicit multiplication, constants and prefixes', () => {
    for (const [source,expected] of [['2+3*4',14],['(2+3)*4',20],['2(3+4)',14],['(2)(3)',6],['2^3^2',512],['-2^2',-4],['2^-2',.25],['2T',2e12],['.5m',.0005],['1k+500',1500],['2π',2*Math.PI],['ω',120*Math.PI]]) assert.equal(calc(source),expected,source);
});
test('calculation retains the unrounded answer', () => {
    const answer = calc('1/3');
    assert.equal(format(answer),'333.3 m');
    assert.equal(evaluate('Ans*3',60,answer).value,1);
});
test('format keeps small nonzero values and handles boundaries', () => {
    assert.equal(format(1e-15),'1.000e-15');
    assert.equal(format(999999),'1 M');
    assert.equal(format(0),'0');
    assert.equal(format(-.002),'-2 m');
});
test('invalid expressions have descriptive errors', () => {
    for (const expression of ['1/0','(1+2','1..2','2+','globalThis','(-1)^.5','2^^3']) assert.throws(()=>calc(expression),undefined,expression);
});
