(() => {
  const card = document.querySelector('.card-page');
  const title = document.querySelector('[data-card-title]');
  const subtitle = document.querySelector('[data-card-subtitle]');
  const editHelp = document.querySelector('.card-edit-help');
  if (!card || !title || !subtitle) return;

  const copyKey = `gelid-genteel-card-copy-${card.dataset.cardKey}`;
  const eventKey = 'gelid-genteel-card-event';
  const controlEventKey = 'gelid-genteel-overlay-control';
  const pageName = location.pathname.split('/').pop();
  const params = new URLSearchParams(location.search);
  const isEditor = params.get('edit') === '1';
  const isEmbedded = window.top !== window.self;
  const isCardSourceFrame = isEmbedded && window.frameElement?.dataset.cardPage === pageName;
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('gelid-genteel-card-events') : null;
  const controlChannel = 'BroadcastChannel' in window ? new BroadcastChannel('gelid-genteel-overlay-controls') : null;
  const defaults = { title: title.textContent.trim(), subtitle: subtitle.textContent.trim() };
  let knownEventId = null;
  let knownControlEventId = null;

  function cleanText(element, fallback) {
    return element.textContent.replace(/\s+/g, ' ').trim() || fallback;
  }

  function loadCopy() {
    try {
      const copy = JSON.parse(localStorage.getItem(copyKey));
      if (copy?.title) title.textContent = copy.title;
      if (copy?.subtitle) subtitle.textContent = copy.subtitle;
    } catch (_) {
      // Keep the built-in card copy if no saved edit exists.
    }
  }

  function saveCopy() {
    const copy = {
      title: cleanText(title, defaults.title),
      subtitle: cleanText(subtitle, defaults.subtitle),
    };
    title.textContent = copy.title;
    subtitle.textContent = copy.subtitle;
    localStorage.setItem(copyKey, JSON.stringify(copy));
    if (editHelp) {
      editHelp.textContent = 'Saved';
      window.setTimeout(() => { editHelp.textContent = 'Click text to edit · Enter to save'; }, 1200);
    }
  }

  function setLiveVisible(visible) {
    card.classList.toggle('is-live-active', visible);
    if (visible) playSheen();
    else card.classList.remove('is-sheen-active');
  }

  function playSheen() {
    card.classList.remove('is-sheen-active');
    void card.offsetWidth;
    card.classList.add('is-sheen-active');
  }

  function receiveLiveEvent(event) {
    if (!event?.id || event.id === knownEventId) return;
    knownEventId = event.id;
    if (event.action === 'show' && event.page === pageName) {
      setLiveVisible(true);
      return;
    }
    setLiveVisible(false);
  }

  function readNewStoredEvent() {
    try { receiveLiveEvent(JSON.parse(localStorage.getItem(eventKey))); } catch (_) { /* Ignore missing or malformed storage. */ }
  }

  function receiveControllerEvent(event) {
    if (!event?.id || event.id === knownControlEventId || event.type !== 'gelid-overlay-control') return;
    knownControlEventId = event.id;
    const control = event.control || {};
    receiveLiveEvent({
      id: event.id,
      action: control.card === pageName ? 'show' : 'hide',
      page: control.card || null,
    });
  }

  function readNewStoredControllerEvent() {
    try { receiveControllerEvent(JSON.parse(localStorage.getItem(controlEventKey))); } catch (_) { /* Ignore missing or malformed controller storage. */ }
  }

  loadCopy();

  if (isEditor) {
    document.body.classList.remove('card-live');
    document.body.classList.add('card-editor');
    title.contentEditable = 'true';
    subtitle.contentEditable = 'true';

    [title, subtitle].forEach((element) => {
      element.addEventListener('blur', saveCopy);
      element.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          element.blur();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          loadCopy();
          element.blur();
        }
      });
    });

    window.addEventListener('keydown', (event) => {
      if (event.altKey && event.key.toLowerCase() === 'r') {
        localStorage.removeItem(copyKey);
        title.textContent = defaults.title;
        subtitle.textContent = defaults.subtitle;
        if (editHelp) editHelp.textContent = 'Reset to defaults';
      }
    });
    return;
  }

  title.contentEditable = 'false';
  subtitle.contentEditable = 'false';

  if (isCardSourceFrame) {
    document.body.classList.remove('card-live');
    document.body.classList.add('card-embedded');
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'gelid-card-reveal' && event.data.page === pageName) playSheen();
    });
    return;
  }

  // A direct live card URL always begins blank. Store the current event ID only
  // as a baseline, so an old event cannot reveal a card on page load.
  document.body.classList.add('card-live');
  try { knownEventId = JSON.parse(localStorage.getItem(eventKey))?.id || null; } catch (_) { /* Keep a blank live page. */ }
  try { knownControlEventId = JSON.parse(localStorage.getItem(controlEventKey))?.id || null; } catch (_) { /* Keep a blank live page. */ }
  channel && (channel.onmessage = ({ data }) => receiveLiveEvent(data));
  window.addEventListener('storage', (event) => { if (event.key === eventKey && event.newValue) readNewStoredEvent(); });
  controlChannel && (controlChannel.onmessage = ({ data }) => receiveControllerEvent(data));
  window.addEventListener('storage', (event) => { if (event.key === controlEventKey && event.newValue) readNewStoredControllerEvent(); });
})();
