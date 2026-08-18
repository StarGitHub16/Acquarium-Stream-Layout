(() => {
  console.log('[Card] Script initialized');
  const card = document.querySelector('.card-page');
  const title = document.querySelector('[data-card-title]');
  const subtitle = document.querySelector('[data-card-subtitle]');
  const editHelp = document.querySelector('.card-edit-help');
  console.log('[Card] Elements found:', { card, title, subtitle, editHelp });
  if (!card || !title || !subtitle) {
    console.log('[Card] Missing required elements, script exiting');
    return;
  }

  const copyKey = `gelid-genteel-card-copy-${card.dataset.cardKey}`;
  const eventKey = 'gelid-genteel-card-event';
  const controlEventKey = 'gelid-genteel-overlay-control';
  const pageName = location.pathname.split('/').pop();
  const cardKey = card.dataset.cardKey; // Use data-card-key for matching
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
    console.log('[Card] setLiveVisible called with:', visible);
    console.log('[Card] Card element:', card);
    console.log('[Card] Card classes before:', card.className);
    card.classList.toggle('is-live-active', visible);
    console.log('[Card] Card classes after:', card.className);
    if (visible) playSheen();
    else card.classList.remove('is-sheen-active');
  }

  function playSheen() {
    card.classList.remove('is-sheen-active');
    void card.offsetWidth;
    card.classList.add('is-sheen-active');
  }

  function receiveLiveEvent(event) {
    console.log('[Card] receiveLiveEvent:', { event, pageName, knownEventId });
    if (!event?.id || event.id === knownEventId) return;
    knownEventId = event.id;
    if (event.action === 'show' && event.page === pageName) {
      console.log('[Card] Showing card:', pageName);
      setLiveVisible(true);
      return;
    }
    if (event.action === 'hide') {
      console.log('[Card] Hiding card');
      setLiveVisible(false);
      return;
    }
    console.log('[Card] No action taken for event:', event);
  }

  function readNewStoredEvent() {
    try { 
      const stored = localStorage.getItem(eventKey);
      if (stored) {
        console.log('[Card] Reading stored event:', stored);
        receiveLiveEvent(JSON.parse(stored));
      }
    } catch (_) { /* Ignore missing or malformed storage. */ }
  }

  function receiveControllerEvent(event) {
    console.log('[Card] receiveControllerEvent:', { event, pageName, cardKey, knownControlEventId });
    if (!event?.id || event.id === knownControlEventId || event.type !== 'gelid-overlay-control') return;
    knownControlEventId = event.id;
    const control = event.control || {};
    console.log('[Card] Control data:', control);
    // Extract card key from control.card (e.g., "card-thawing.html" -> "thawing")
    const controlCardKey = control.card ? control.card.replace(/^card-/, '').replace(/\.html$/, '') : null;
    console.log('[Card] Comparing:', controlCardKey, '===', cardKey, '=', controlCardKey === cardKey);
    // Only show this card if the control specifically targets this card page
    // Hide for all other cases (different card or no card)
    if (controlCardKey === cardKey) {
      console.log('[Card] MATCH - showing card');
      receiveLiveEvent({
        id: event.id,
        action: 'show',
        page: pageName,
      });
    } else {
      console.log('[Card] NO MATCH - hiding card');
      // Hide this card for any other control
      receiveLiveEvent({
        id: event.id,
        action: 'hide',
        page: null,
      });
    }
  }

  function readNewStoredControllerEvent() {
    try { 
      const stored = localStorage.getItem(controlEventKey);
      if (stored) {
        console.log('[Card] Reading stored controller event:', stored);
        receiveControllerEvent(JSON.parse(stored));
      }
    } catch (_) { /* Ignore missing or malformed controller storage. */ }
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

  // A direct live card URL always begins blank. Do NOT read stored event IDs
  // on page load, so new events are always processed.
  document.body.classList.add('card-live');
  console.log('[Card] Event listeners being set up');
  console.log('[Card] Channel:', channel);
  console.log('[Card] Control channel:', controlChannel);
  channel && (channel.onmessage = ({ data }) => receiveLiveEvent(data));
  window.addEventListener('storage', (event) => { if (event.key === eventKey && event.newValue) readNewStoredEvent(); });
  controlChannel && (controlChannel.onmessage = ({ data }) => receiveControllerEvent(data));
  window.addEventListener('storage', (event) => { if (event.key === controlEventKey && event.newValue) readNewStoredControllerEvent(); });
  console.log('[Card] Event listeners set up complete');
  console.log('[Card] Initial card classes:', card.className);
  console.log('[Card] Initial body classes:', document.body.className);
})();
