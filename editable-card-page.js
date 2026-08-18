(() => {
  const card = document.querySelector('.card-page');
  const title = document.querySelector('[data-card-title]');
  const subtitle = document.querySelector('[data-card-subtitle]');
  const editHelp = document.querySelector('.card-edit-help');
  if (!card || !title || !subtitle) return;

  const key = `gelid-genteel-card-copy-${card.dataset.cardKey}`;
  const defaults = { title: title.textContent.trim(), subtitle: subtitle.textContent.trim() };
  const isStandaloneEditor = window.top === window.self;

  function cleanText(element, fallback) {
    return element.textContent.replace(/\s+/g, ' ').trim() || fallback;
  }

  function save() {
    const copy = {
      title: cleanText(title, defaults.title),
      subtitle: cleanText(subtitle, defaults.subtitle),
    };
    title.textContent = copy.title;
    subtitle.textContent = copy.subtitle;
    localStorage.setItem(key, JSON.stringify(copy));
    if (editHelp) {
      editHelp.textContent = 'Saved';
      window.setTimeout(() => { editHelp.textContent = 'Click text to edit · Enter to save'; }, 1200);
    }
  }

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
})();
