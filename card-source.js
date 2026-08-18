(() => {
  const storageKey = 'gelid-genteel-card-event';
  const frames = new Map([...document.querySelectorAll('.card-layer__frame')].map((frame) => [frame.dataset.cardPage, frame]));
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('gelid-genteel-card-events') : null;
  const controlStorageKey = 'gelid-genteel-overlay-control';
  const controlChannel = 'BroadcastChannel' in window ? new BroadcastChannel('gelid-genteel-overlay-controls') : null;
  let activeFrame = null;
  let lastEventId = null;
  let lastControlEventId = null;
  let hideTimer;

  function hideCard() {
    clearTimeout(hideTimer);
    activeFrame?.classList.remove('is-active');
    activeFrame = null;
  }

  function receive(event) {
    if (!event || !event.id || event.id === lastEventId) return;
    lastEventId = event.id;
    if (event.action !== 'show') {
      hideCard();
      return;
    }
    const frame = frames.get(event.page);
    if (!frame) return;
    clearTimeout(hideTimer);
    activeFrame?.classList.remove('is-active');
    activeFrame = frame;
    requestAnimationFrame(() => {
      activeFrame?.classList.add('is-active');
      activeFrame?.contentWindow?.postMessage({ type: 'gelid-card-reveal', page: event.page }, location.origin);
    });
    const duration = Number(event.duration);
    if (Number.isFinite(duration) && duration > 0) hideTimer = window.setTimeout(hideCard, duration);
  }

  function receiveStoredEvent() {
    try { receive(JSON.parse(localStorage.getItem(storageKey))); } catch (_) { /* Ignore an absent or malformed previous event. */ }
  }

  function receiveControllerEvent(event) {
    if (!event || event.type !== 'gelid-overlay-control' || !event.id || event.id === lastControlEventId) return;
    lastControlEventId = event.id;
    const control = event.control || {};
    receive({
      id: event.id,
      action: control.card ? 'show' : 'hide',
      page: control.card || null,
      duration: control.cardDuration,
    });
  }

  function receiveStoredControllerEvent() {
    try { receiveControllerEvent(JSON.parse(localStorage.getItem(controlStorageKey))); } catch (_) { /* Ignore an absent or malformed controller event. */ }
  }

  channel && (channel.onmessage = ({ data }) => receive(data));
  window.addEventListener('storage', (event) => { if (event.key === storageKey && event.newValue) receiveStoredEvent(); });
  controlChannel && (controlChannel.onmessage = ({ data }) => receiveControllerEvent(data));
  window.addEventListener('storage', (event) => { if (event.key === controlStorageKey && event.newValue) receiveStoredControllerEvent(); });
  // Deliberately do not replay the last stored event on load. The OBS card source
  // must always begin blank; only a new Card + Animation button press may reveal it.
  try { lastControlEventId = JSON.parse(localStorage.getItem(controlStorageKey))?.id || null; } catch (_) { /* Keep a blank card source when storage is unavailable. */ }

  window.gelidCardLayerDiagnostics = () => {
    const iframeRect = activeFrame?.getBoundingClientRect();
    const cardRect = activeFrame?.contentDocument?.querySelector('.card-page')?.getBoundingClientRect();
    const cardCenter = iframeRect && cardRect ? {
      x: iframeRect.left + cardRect.left + cardRect.width / 2,
      y: iframeRect.top + cardRect.top + cardRect.height / 2,
    } : null;
    const stageCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    return {
      activePage: activeFrame?.dataset.cardPage || null,
      visible: Boolean(activeFrame?.classList.contains('is-active')),
      transparent: getComputedStyle(document.body).backgroundColor === 'rgba(0, 0, 0, 0)',
      preloadedPages: [...frames.keys()],
      alignment: cardCenter ? {
        stageCenter,
        cardCenter,
        deltaX: Number((cardCenter.x - stageCenter.x).toFixed(2)),
        deltaY: Number((cardCenter.y - stageCenter.y).toFixed(2)),
        centered: Math.abs(cardCenter.x - stageCenter.x) < 1 && Math.abs(cardCenter.y - stageCenter.y) < 1,
      } : null,
    };
  };
})();
