(() => {
  const defaultRelayUrl = 'https://arcticgame-qpnevoze.manus.space';
  const requestedRelayUrl = new URLSearchParams(window.location.search).get('relay');
  const relayUrl = (requestedRelayUrl || defaultRelayUrl).replace(/\/+$/, '');
  const pollIntervalMs = 650;

  async function call(procedure, input) {
    const response = await fetch(`${relayUrl}/api/trpc/${procedure}`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: input }),
    });
    const payload = await response.json().catch(() => null);
    const message = payload?.error?.json?.message || payload?.error?.message || 'Unable to reach the secure overlay relay.';
    if (!response.ok || !payload?.result?.data?.json) throw new Error(message);
    return payload.result.data.json;
  }

  function subscribe(onEvent, { onStatus } = {}) {
    let stopped = false;
    let initialRead = true;
    let knownEventId = null;

    async function poll() {
      if (stopped) return;
      try {
        const { event } = await call('overlay.latestControl', null);
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
    verifyControllerAccess: (accessCode) => call('overlay.verifyControllerAccess', { accessCode }),
    publishControl: (accessCode, control) => call('overlay.publishControl', { accessCode, control }),
    subscribe,
  };
})();
