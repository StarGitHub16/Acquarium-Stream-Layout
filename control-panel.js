(() => {
  const storageKey = 'gelid-genteel-overlay-control';
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('gelid-genteel-overlay-controls') : null;
  const status = document.querySelector('#control-status');
  const buttons = [...document.querySelectorAll('[data-overlay-control]')];
  let activeButton = buttons.find((button) => button.dataset.animation === 'standard') || null;

  function displayName(button) {
    return button.textContent.trim();
  }

  function publish(control) {
    const event = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'gelid-overlay-control',
      control,
      createdAt: Date.now(), 
    }; 
    console.log('[Control Panel] Publishing event:', event);
    try { localStorage.setItem(storageKey, JSON.stringify(event)); } catch (_) { /* BroadcastChannel remains available when storage is blocked. */ }
    channel?.postMessage(event);
  }

  function setActive(button) {
    buttons.forEach((item) => item.classList.toggle('is-active', item === button));
    activeButton = button;
    if (status) status.textContent = displayName(button);
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const isSecondPress = activeButton === button && (button.dataset.cardToggle === 'true' || button.dataset.animationToggle === 'true');
      const control = isSecondPress
        ? { animation: 'standard' }
        : {
            animation: button.dataset.animation || 'standard',
            animationToggle: button.dataset.animationToggle === 'true',
            card: button.dataset.card || null,
            cardDuration: button.dataset.cardDuration || 'manual',
            cardToggle: button.dataset.cardToggle === 'true',
          };
      publish(control);
      setActive(isSecondPress ? buttons.find((item) => item.dataset.animation === 'standard') : button);
    });
  });
})();
