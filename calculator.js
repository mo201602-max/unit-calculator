/* 補助単位対応電卓 1.1 — UIに依存しない数式解析 */
(function (root) {
    'use strict';
    const prefixes = {p:1e-12,n:1e-9,u:1e-6,m:1e-3,k:1e3,M:1e6,G:1e9,T:1e12};
    const units = ['p','n','u','m','','k','M','G','T'];
    function format(value) {
        if (value === 0) return '0';
        const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3;
        if (exponent < -12 || exponent > 12) return value.toExponential(3);
        let index = exponent / 3 + 4;
        let rounded = Number((value / 10 ** exponent).toPrecision(4));
        if (Math.abs(rounded) >= 1000 && index < 8) { rounded /= 1000; index++; }
        return `${rounded}${units[index] ? ' ' + units[index] : ''}`;
    }
    function evaluate(source, frequency = 60, answer = 0) {
        const tokens = []; let offset = 0;
        while (offset < source.length) {
            const rest = source.slice(offset);
            if (/^\s/.test(rest)) { offset++; continue; }
            const number = rest.match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
            if (number) { if (tokens.at(-1)?.type === 'number') throw new Error('数値または小数点を確認してください'); tokens.push({type:'number',value:Number(number[0])}); offset += number[0].length; continue; }
            if (rest.startsWith('Ans')) { tokens.push({type:'number',value:answer}); offset += 3; continue; }
            const char = source[offset++];
            if ('+-*/^()π ω'.includes(char) || Object.hasOwn(prefixes,char)) tokens.push({type:char});
            else throw new Error('使用できない文字があります');
        }
        let position = 0;
        const peek = () => tokens[position]?.type;
        const take = () => tokens[position++];
        function finite(value) { if (!Number.isFinite(value)) throw new Error('計算結果が数値の範囲を超えました'); return value; }
        function primary() {
            let value;
            if (peek() === 'number') value = take().value;
            else if (peek() === 'π') { take(); value = Math.PI; }
            else if (peek() === 'ω') { take(); value = 2 * Math.PI * frequency; }
            else if (peek() === '(') { take(); value = sum(); if (peek() !== ')') throw new Error('閉じ括弧が不足しています'); take(); }
            else throw new Error('数値または括弧を確認してください');
            if (Object.hasOwn(prefixes,peek())) value *= prefixes[take().type];
            return finite(value);
        }
        function power() { let value = primary(); if (peek() === '^') { take(); const exponent = unary(); value = value ** exponent; if (Number.isNaN(value)) throw new Error('実数では計算できません'); } return finite(value); }
        function unary() { if (peek() === '+') { take(); return unary(); } if (peek() === '-') { take(); return -unary(); } return power(); }
        function product() {
            let value = unary();
            while (peek() === '*' || peek() === '/' || ['number','(','π','ω'].includes(peek())) {
                const operator = ['*','/'].includes(peek()) ? take().type : '*';
                const right = unary();
                if (operator === '/' && right === 0) throw new Error('0で割ることはできません');
                value = finite(operator === '/' ? value / right : value * right);
            }
            return value;
        }
        function sum() { let value = product(); while (peek() === '+' || peek() === '-') { const op = take().type; const right = product(); value = finite(op === '+' ? value + right : value - right); } return value; }
        if (!tokens.length) throw new Error('数式を入力してください');
        const value = sum();
        if (position !== tokens.length) throw new Error('括弧または演算子を確認してください');
        return {value, tokens};
    }
    const api = {prefixes,format,evaluate};
    if (typeof module !== 'undefined') module.exports = api;
    else root.Calculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
