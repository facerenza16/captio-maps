// content.js — inyectado en google.com/maps
// Todos los selectores en un solo lugar: cuando Maps cambie sus clases, solo hay que tocar este objeto.
const SELECTORS = {
  feed: 'div[role="feed"]',
  card: 'div[role="article"]',
  url: 'a[href*="/maps/place/"]',
  name: '.qBF1Pd',
  rating: 'span.MW4etd',
  reviews: 'span.UY7F9',
  category: '.W4Efsd:not(.W4Efsd .W4Efsd) span:first-child',
  address: '.W4Efsd:not(.W4Efsd .W4Efsd) span:last-child',
};

let isRunning = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractLeadsFromDOM() {
  const cards = document.querySelectorAll(SELECTORS.card);
  const leads = [];

  cards.forEach(card => {
    const nombre = card.querySelector(SELECTORS.name)?.textContent.trim() || '';
    if (!nombre) return;

    const rating = card.querySelector(SELECTORS.rating)?.textContent.trim() || '';
    const resenas = card.querySelector(SELECTORS.reviews)?.textContent.trim().replace(/[()]/g, '') || '';
    const categoryEl = card.querySelector(SELECTORS.category);
    const addressEl = card.querySelector(SELECTORS.address);
    const categoria = categoryEl?.textContent.trim() || '';
    const direccion = addressEl?.textContent.trim() || '';
    const url_maps = card.querySelector(SELECTORS.url)?.href || '';
    const fecha_scraping = new Date().toISOString().split('T')[0];

    leads.push({ nombre, categoria, calificacion: rating, resenas, direccion, url_maps, fecha_scraping });
  });

  return leads;
}

async function scrapeWithScroll() {
  const feed = document.querySelector(SELECTORS.feed);
  if (!feed) {
    chrome.runtime.sendMessage({ type: 'SCRAPE_ERROR', error: 'No se encontró el panel de resultados. Asegúrate de estar en una búsqueda de Google Maps.' });
    return;
  }

  isRunning = true;
  let allLeads = [];
  let seenUrls = new Set();
  let noNewCount = 0;
  const MAX_NO_NEW = 4;

  chrome.runtime.sendMessage({ type: 'SCRAPE_STATUS', status: 'raspando', count: 0 });

  while (isRunning) {
    const current = extractLeadsFromDOM();
    let newCount = 0;

    current.forEach(lead => {
      if (lead.url_maps && !seenUrls.has(lead.url_maps)) {
        seenUrls.add(lead.url_maps);
        allLeads.push(lead);
        newCount++;
      }
    });

    chrome.runtime.sendMessage({ type: 'SCRAPE_STATUS', status: 'raspando', count: allLeads.length });

    if (newCount === 0) {
      noNewCount++;
      if (noNewCount >= MAX_NO_NEW) break;
    } else {
      noNewCount = 0;
    }

    feed.scrollTop += 800;
    await sleep(1500);
  }

  isRunning = false;
  chrome.runtime.sendMessage({ type: 'SCRAPE_DONE', leads: allLeads, count: allLeads.length });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'START_SCRAPE') {
    if (isRunning) {
      sendResponse({ ok: false, error: 'Ya hay un raspado en curso.' });
      return;
    }
    scrapeWithScroll();
    sendResponse({ ok: true });
  }

  if (msg.type === 'STOP_SCRAPE') {
    isRunning = false;
    sendResponse({ ok: true });
  }
});
