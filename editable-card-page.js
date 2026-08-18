(() => {
  const card = document.querySelector('.card-page');
  const title = document.querySelector('[data-card-title]');
  const subtitle = document.querySelector('[data-card-subtitle]');
  const editHelp = document.querySelector('.card-edit-help');
  if (!card || !title || !subtitle) return;

<<<<<<< HEAD
  const copyKey = `gelid-genteel-card-copy-${card.dataset.cardKey}`;
  const eventKey = 'gelid-genteel-card-event';
  const pageName = location.pathname.split('/').pop();
  const params = new URLSearchParams(location.search);
  const isEditor = params.get('edit') === '1';
  const isEmbedded = window.top !== window.self;
  const isCardSourceFrame = isEmbedded && window.frameElement?.dataset.cardPage === pageName;
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('gelid-genteel-card-events') : null;
  const defaults = { title: title.textContent.trim(), subtitle: subtitle.textContent.trim() };
  let knownEventId = null;
=======
  const key = `gelid-genteel-card-copy-${card.dataset.cardKey}`;
  const defaults = { title: title.textContent.trim(), subtitle: subtitle.textContent.trim() };
  const isStandaloneEditor = window.top === window.self;
>>>>>>> fd434e17c9f77e79808b91390996ca275b540f8a

  function cleanText(element, fallback) {
    return element.textContent.replace(/\s+/g, ' ').trim() || fallback;
  }

<<<<<<< HEAD
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
=======
  function save() {
>>>>>>> fd434e17c9f77e79808b91390996ca275b540f8a
    const copy = {
      title: cleanText(title, defaults.title),
      subtitle: cleanText(subtitle, defaults.subtitle),
    };
    title.textContent = copy.title;
    subtitle.textContent = copy.subtitle;
<<<<<<< HEAD
    localStorage.setItem(copyKey, JSON.stringify(copy));
=======
    localStorage.setItem(key, JSON.stringify(copy));
>>>>>>> fd434e17c9f77e79808b91390996ca275b540f8a
    if (editHelp) {
      editHelp.textContent = 'Saved';
      window.setTimeout(() => { editHelp.textContent = 'Click text to edit · Enter to save'; }, 1200);
    }
  }

<<<<<<< HEAD
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
  channel && (channel.onmessage = ({ data }) => receiveLiveEvent(data));
  window.addEventListener('storage', (event) => { if (event.key === eventKey && event.newValue) readNewStoredEvent(); });
  window.GelidOverlayRelay?.subscribe((event) => {
    const control = event?.control || {};
    receiveLiveEvent({
      id: event.id,
      action: control.card === pageName ? 'show' : 'hide',
      page: control.card || null,
    });
  });
=======
  function load() {
    try {
      const copy = JSON.parse(localStorage.getItem(key));
      if (copy?.title) title.textContent = copy.title;
      if (copy?.subtitle) subtitle.textContent = copy.subtitle;
    } catch (_) {
      // Keep the built-in card copy if no saved edit is available.
    }
  }

  load();

  if (!isStandaloneEditor) {
    title.contentEditable = 'false';
    subtitle.contentEditable = 'false';
    return;
  }

  [title, subtitle].forEach((element) => {
    element.addEventListener('blur', save);
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        element.blur();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        load();
        element.blur();
      }
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.altKey && event.key.toLowerCase() === 'r') {
      localStorage.removeItem(key);
      title.textContent = defaults.title;
      subtitle.textContent = defaults.subtitle;
      if (editHelp) editHelp.textContent = 'Reset to defaults';
    }
  });

  document.body.classList.add('card-editor');
>>>>>>> fd434e17c9f77e79808b91390996ca275b540f8a
})();
