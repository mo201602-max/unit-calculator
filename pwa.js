'use strict';
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
}
let installPrompt;
const installButton = document.getElementById('install-pwa');
window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = event; installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
    if (!installPrompt) return;
    const prompt = installPrompt; installPrompt = null; installButton.hidden = true;
    await prompt.prompt();
});
window.addEventListener('appinstalled', () => { installButton.hidden = true; });
