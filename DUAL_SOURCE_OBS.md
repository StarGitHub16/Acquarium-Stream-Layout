# Dual Browser Source Setup for XSplit

Use two Browser Sources at the same 1920 × 1080 size from the local relay running on the stream PC.

| XSplit Browser Source layer | URL | Purpose |
|---|---|---|
| Water animation | `http://127.0.0.1:8787/index.html?video=underlay` | Retains the original freeze, thaw, and bubble animation behavior. Its preview buttons are automatically hidden in this stream-facing URL. |
| Card layer | `http://127.0.0.1:8787/card-source.html` | Transparent card-only layer. It receives the card event and fades the matching editable card over the water/video source. |

Place **Card layer** above **Water animation** in XSplit. Place game/video capture below both when using `?video=underlay`.

The water and card sources subscribe to the local relay running on the stream PC. The phone controller sends its secured commands to that same relay over the local network. The animation-only controls clear any active card. A **Card + Animation** control plays its water animation and sends the paired editable card to the separate overlay source. Clicking the same card control again clears the card and restores the normal water state.

The Card layer intentionally **starts blank every time it loads**, even if an old event exists in browser storage. It responds only to new button presses received after it is open: the first matching Card + Animation press fades the card in; the second press hides it.

Each individual live card URL—`card-thawing.html`, `card-frozen.html`, and `card-offline.html`—also starts as a **blank transparent layer**. A matching button reveals only that card; a second press hides it. These pages can be used for direct browser testing or as separate optional card layers. To change wording, use the explicit editor URLs: `card-thawing.html?edit=1`, `card-frozen.html?edit=1`, and `card-offline.html?edit=1`.

> The water and card Browser Sources must use the **same custom width and height** in XSplit, normally **1920 × 1080**. The card source is transparent except for its triggered card, so it should be above the water source in the Sources panel. Do not use `preview=grid` in XSplit; that parameter is browser-only transparency previewing.

The buttons are only for the normal browser preview URL (`index.html`). The XSplit URL (`index.html?video=underlay`) hides them completely, keeping the stream output clean.

For phone control, open `http://YOUR-STREAM-PC-IP:8787/control-panel.html` on any phone connected to the same Wi-Fi. The relay is intentionally password-free and accepts local-network devices only. See `SECURE_PHONE_CONTROLLER.md` for the one-time local setup details.
