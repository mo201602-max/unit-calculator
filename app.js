'use strict';
(() => {
    const {evaluate,format,prefixes} = Calculator;
    const byId = id => document.getElementById(id);
    let formula = '', answer = 0, frequency = 60, resultShown = false, settingFrequency = false;
    function show(text) { byId('result').value = text; byId('announcement').textContent = text; }
    function render() { byId('formula').textContent = settingFrequency ? '周波数設定（=で確定、Escで取消）' : formula; byId('freq-display').textContent = format(frequency); }
    function reset() { formula = ''; resultShown = false; settingFrequency = false; show('0'); }
    function commitFrequency(unit) {
        if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(formula)) throw new Error('周波数を正しい数値で入力してください');
        const value = Number(formula) * (unit ? prefixes[unit] : 1);
        if (!Number.isFinite(value) || value < 0) throw new Error('周波数は0以上の有限の数値にしてください');
        frequency = value; settingFrequency = false; formula = ''; resultShown = false; show(`f = ${format(frequency)} Hz`);
    }
    function act(value) {
        try {
            if (value === 'C' || value === 'Escape') { reset(); render(); return; }
            if (value === 'f') { settingFrequency = true; formula = ''; resultShown = false; show('f ='); render(); return; }
            if (settingFrequency) {
                if (value === '<--') formula = formula.slice(0,-1);
                else if (/^[0-9.]$/.test(value)) {
                    if (value === '.' && formula.includes('.')) throw new Error('小数点は1つだけ入力できます');
                    formula += value;
                } else if (value === '=' || Object.hasOwn(prefixes,value)) { commitFrequency(value === '=' ? null : value); render(); return; }
                else throw new Error('数値を入力し、=または接頭語で確定してください');
                show(`f = ${formula}`); render(); return;
            }
            if (value === '<--') { if (resultShown) { formula = ''; resultShown = false; } else formula = formula.endsWith('Ans') ? formula.slice(0,-3) : formula.slice(0,-1); render(); return; }
            if (value === '=' || value === '√' || value === '1/x') {
                if (!formula && !resultShown) return;
                let parsed = resultShown ? {value:answer,tokens:[]} : evaluate(formula,frequency,answer);
                let numeric = parsed.value;
                if (value === '√') { if (numeric < 0) throw new Error('負の数の平方根は実数では計算できません'); numeric = Math.sqrt(numeric); }
                if (value === '1/x') { if (numeric === 0) throw new Error('0の逆数は計算できません'); numeric = 1 / numeric; }
                if (!Number.isFinite(numeric)) throw new Error('計算結果が数値の範囲を超えました');
                if (value !== '=') formula = value === '√' ? `√(${resultShown ? 'Ans' : formula})` : `1/(${resultShown ? 'Ans' : formula})`;
                answer = numeric; resultShown = true; show(format(answer));
                byId('debug-info').textContent = `式: ${formula}\n解析: ${JSON.stringify(parsed.tokens)}\n内部値: ${answer}\n表示: ${format(answer)}`;
            } else {
                if (resultShown) { formula = /^[+*/^\-]$/.test(value) ? 'Ans' : ''; resultShown = false; }
                formula += value;
            }
            render();
        } catch (error) { show(`エラー: ${error.message}`); render(); }
    }
    document.querySelector('.buttons').addEventListener('click', event => { const button = event.target.closest('button'); if (button) act(button.textContent); });
    document.addEventListener('keydown', event => {
        if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest('summary, #install-pwa')) return;
        let key = event.key;
        if (key === 'Enter' || key === '=') key = '=';
        else if (key === 'Backspace' || key === 'Delete') key = '<--';
        else if (key === 'Escape') key = 'Escape';
        else if (!/^[0-9.+*/^()\-pnumkMGTfπω]$/.test(key) || key === ' ') return;
        event.preventDefault(); act(key);
    });
    render();
})();
