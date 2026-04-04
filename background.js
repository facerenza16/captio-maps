// background.js — service worker
// Relay de mensajes entre content.js y popup.js.
// También persiste el estado en chrome.storage.local para que el popup
// pueda leerlo al abrirse (el popup no existe cuando content.js manda mensajes).

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'SCRAPE_STATUS') {
    chrome.storage.local.set({ scrapeState: { status: 'raspando', count: msg.count } });
    // Notificar al popup si está abierto
    chrome.runtime.sendMessage(msg).catch(() => {});
  }

  if (msg.type === 'SCRAPE_DONE') {
    chrome.storage.local.set({
      scrapeState: { status: 'completado', count: msg.count },
      leads: msg.leads,
    });
    chrome.runtime.sendMessage(msg).catch(() => {});
  }

  if (msg.type === 'SCRAPE_ERROR') {
    chrome.storage.local.set({ scrapeState: { status: 'error', error: msg.error } });
    chrome.runtime.sendMessage(msg).catch(() => {});
  }

  sendResponse({ ok: true });
});
