# Local Relay Verification

## Final local-network check

The final relay runs directly with `node local-overlay-relay.js` and requires no configuration file, password, hosted service, or external account. The controller page opens with all water and Card + Water buttons immediately available.

The local relay accepted controller events without an access code. A fresh Thawing Card event triggered the water layer’s bubble state, and a fresh Frozen Card event revealed the matching Frozen card in the separate transparent card layer. Both stream-facing pages started in their normal/blank states before receiving their fresh event.

The final controller check confirmed that the first Frozen Card press updates the controller to the Frozen Card state. A second press restored the controller to Normal and the local relay reported `{ "animation": "standard", "card": null }`, preserving the original hide-and-reset behavior.

The relay accepts loopback and standard private-network addresses only. The actual streamer handoff remains to open the controller on a physical phone connected to the same Wi-Fi and add the two local URLs as XSplit Browser Sources.
