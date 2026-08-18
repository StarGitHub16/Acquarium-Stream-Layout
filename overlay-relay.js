(() => {
  const requestedRelayUrl = new URLSearchParams(window.location.search).get('relay');
  const relayUrl = (requestedRelayUrl || (location.protocol.startsWith('http') ? location.origin : '')).replace(/\/+$/, '');
  const pollIntervalMs = 650;

  async function call(path, input) {
    if (!relayUrl) throw new Error('Open this page through the local overlay relay, not directly as a file.');
    const response = await fetch(`${relayUrl}${path}`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const payload = await response.json().catch(() => null);
    const message = payload?.error || 'Unable to reach the local overlay relay.';
    if (!response.ok) throw new Error(message);
    return payload;
  }

  function subscribe(onEvent, { onStatus } = {}) {
    let stopped = false;
    let initialRead = true;
    let knownEventId = null;

    async function poll() {
      if (stopped) return;
      try {
        const response = await fetch(`${relayUrl}/api/overlay/latest`, { cache: 'no-store', mode: 'cors' });
        const { event } = await response.json();
        if (!response.ok) throw new Error('Unable to reach the local overlay relay.');
        onStatus?.({ connected: true });
        if (initialRead) {
          knownEventId = event?.id || null;
          initialRead = false;
        } else if (event?.id && event.id !== knownEventId) {
          knownEventId = event.id;
          onEvent(event);
        }
      } catch (_) {
        onStatus?.({ connected: false });
      } finally {
        if (!stopped) window.setTimeout(poll, pollIntervalMs);
      }
    }

    poll();
    return () => { stopped = true; };
  }

  window.GelidOverlayRelay = {
    relayUrl,
    verifyControllerAccess: (accessCode) => call('/api/overlay/verify', { accessCode }),
    publishControl: (accessCode, control) => call('/api/overlay/publish', { accessCode, control }),
    subscribe,
  };
})();

(() => {
  const requestedRelayUrl = new URLSearchParams(window.location.search).get('relay');
  const relayUrl = (requestedRelayUrl || (location.protocol.startsWith('http') ? location.origin : '')).replace(/\/+$/, '');
  const pollIntervalMs = 650;

  async function publishControl(control) {
    if (!relayUrl) throw new Error('Open this page through the local overlay relay, not directly as a file.');
    const response = await fetch(`${relayUrl}/api/overlay/publish`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ control }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || 'Unable to reach the local overlay relay.');
    return payload;
  }

  function subscribe(onEvent, { onStatus } = {}) {
    let stopped = false;
    let initialRead = true;
    let knownEventId = null;

    async function poll() {
      if (stopped) return;
      try {
        if (!relayUrl) throw new Error('Local relay URL is unavailable.');
        const response = await fetch(`${relayUrl}/api/overlay/latest`, { cache: 'no-store', mode: 'cors' });
        const { event } = await response.json();
        if (!response.ok) throw new Error('Unable to reach the local overlay relay.');
        onStatus?.({ connected: true });
        if (initialRead) {
          knownEventId = event?.id || null;
          initialRead = false;
        } else if (event?.id && event.id !== knownEventId) {
          knownEventId = event.id;
          onEvent(event);
        }
      } catch (_) {
        onStatus?.({ connected: false });
      } finally {
        if (!stopped) window.setTimeout(poll, pollIntervalMs);
      }
    }

    poll();
    return () => { stopped = true; };
  }

  window.GelidOverlayRelay = { relayUrl, publishControl, subscribe };
})();
