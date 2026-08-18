(() => {
  const storageKey = 'gelid-genteel-overlay-control';
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('gelid-genteel-overlay-controls') : null;
  const status = document.querySelector('#control-status');
  const buttons = [...document.querySelectorAll('[data-overlay-control]')];
  const lockPanel = document.querySelector('#controller-lock');
  const actionPanel = document.querySelector('#controller-actions');
  const accessCodeInput = document.querySelector('#controller-access-code');
  const unlockButton = document.querySelector('#unlock-controller');
  const lockButton = document.querySelector('#lock-controller');
  const lockStatus = document.querySelector('#controller-lock-status');
  const sessionKey = 'gelid-genteel-controller-access-code';
  let activeButton = buttons.find((button) => button.dataset.animation === 'standard') || null;
  let accessCode = '';

  function displayName(button) {
    return button.textContent.trim();
  }

  function publishLocal(event) {
    try { localStorage.setItem(storageKey, JSON.stringify(event)); } catch (_) { /* BroadcastChannel remains available when storage is blocked. */ }
    channel?.postMessage(event);
  }

  async function publish(control) {
    if (!accessCode || !window.GelidOverlayRelay) throw new Error('Controller is locked.');
    const event = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'gelid-overlay-control',
      control,
      createdAt: Date.now(),
    };
    const response = await window.GelidOverlayRelay.publishControl(accessCode, control);
    publishLocal(response.event || event);
  }

  function setActive(button) {
    buttons.forEach((item) => item.classList.toggle('is-active', item === button));
    activeButton = button;
    if (status) status.textContent = displayName(button);
  }

  function displayLockStatus(message, type = '') {
    if (!lockStatus) return;
    lockStatus.textContent = message;
    lockStatus.classList.toggle('is-error', type === 'error');
    lockStatus.classList.toggle('is-success', type === 'success');
  }

  function lockController(message = 'Controls are locked.') {
    accessCode = '';
    try { sessionStorage.removeItem(sessionKey); } catch (_) { /* Session-only storage is optional. */ }
    actionPanel.hidden = true;
    lockPanel.hidden = false;
    lockButton.hidden = true;
    if (accessCodeInput) accessCodeInput.value = '';
    displayLockStatus(message);
  }

  function unlockController(code) {
    accessCode = code;
    actionPanel.hidden = false;
    lockPanel.hidden = true;
    lockButton.hidden = false;
    try { sessionStorage.setItem(sessionKey, code); } catch (_) { /* The page remains unlocked until this tab closes. */ }
  }

  async function attemptUnlock(code) {
    if (!code || !window.GelidOverlayRelay) {
      displayLockStatus('Enter the access code to unlock these controls.', 'error');
      return;
    }
    unlockButton.disabled = true;
    displayLockStatus('Checking secure access…');
    try {
      await window.GelidOverlayRelay.verifyControllerAccess(code);
      unlockController(code);
      displayLockStatus('');
    } catch (_) {
      accessCode = '';
      displayLockStatus('That code was not accepted. No overlay changes were sent.', 'error');
    } finally {
      unlockButton.disabled = false;
    }
  }

  unlockButton?.addEventListener('click', () => attemptUnlock(accessCodeInput?.value.trim()));
  accessCodeInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') attemptUnlock(accessCodeInput.value.trim());
  });
  lockButton?.addEventListener('click', () => lockController());

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
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
      button.disabled = true;
      if (status) status.textContent = 'Sending…';
      try {
        await publish(control);
        setActive(isSecondPress ? buttons.find((item) => item.dataset.animation === 'standard') : button);
      } catch (_) {
        if (status) status.textContent = 'Relay unavailable — no change sent';
      } finally {
        button.disabled = false;
      }
    });
  });

  try {
    const storedCode = sessionStorage.getItem(sessionKey);
    if (storedCode) attemptUnlock(storedCode);
  } catch (_) { /* A fresh locked state is safe when session storage is unavailable. */ }
})();
