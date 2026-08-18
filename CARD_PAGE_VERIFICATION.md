# Card-Page Verification Notes

The main layout opened successfully and the **Bubbles** button loaded `card-thawing.html` through the iframe host with the expected Thawing title and subtitle. The initial browser review showed an opaque dark iframe canvas around the card, so the standalone page backgrounds were updated to set the document canvas explicitly transparent.

The follow-up review confirmed that the Thawing card now appears as an isolated transparent iframe overlay: the surrounding aquarium scene, ice frame, and animated bubbles remain visible behind it.

The **Freeze** control loaded `card-frozen.html` with its Frozen title and temporary-freeze subtitle. The **Frozen** control loaded `card-offline.html` with its Tank Freezing title and thanks-for-watching subtitle. Both cards retained transparency around the card itself.

After separating controls, the animation-only **Bubbles** control started the thawing bubble effect while leaving the center-card iframe hidden.

Clicking animation-only **Bubbles** a second time restored the normal aquarium state. Clicking **Thawing Card** then started the same bubble animation and displayed the centered `card-thawing.html` page through the iframe host.

With the finalized controls, the Thawing Card trigger continued to show only the centered card page over the aquarium and paired it with the thawing bubble effect.

Clicking the active Thawing Card control again hid the iframe card and returned the scene to the normal aquarium state.

With `?video=underlay`, the main gameplay area rendered transparent in the browser preview. Triggering Thawing Card placed the centered card above that transparent area while the frame and peripheral aquarium details remained on the upper overlay layer.

The gameplay frame measured 1152 × 648 pixels at a 1280 × 1100 preview viewport, preserving its centered 16:9 geometry. After the final underlay safeguards, the preview showed the unchanged ice frame and perimeter details with no default water fill, fish, stars, or interior glow obstructing the video safe area.

The final underlay review confirmed that triggering Thawing Card places the centered separate-card page above the transparent gameplay area while its intentionally paired bubble animation remains visible.

The optional `?video=underlay&preview=grid` mode displayed a dark checkerboard behind the transparent layout for browser inspection. It retained the original centered ice frame and is documented as a preview-only option; normal OBS use remains `?video=underlay` without the grid.

The final diagnostic reported `videoUnderlay: true`, a hidden empty transparent card host, suppressed decorative layers, and the unchanged 1152 × 648 centered gameplay frame at a 1.7778 ratio.

With Thawing Card active, the diagnostic reported `page: card-thawing.html`, `visible: true`, `centered: true`, and a center delta of 0px horizontally and -0.01px vertically within the same 1152 × 648 transparent gameplay frame.

After the responsiveness update, the preloaded Thawing card appeared promptly over the centered frame while the lighter bubble effect remained visible and preserved the paired-animation behavior.

The performance diagnostic confirmed `wasPreloaded: true` and a `revealDelayMs` of 0.1ms for `card-thawing.html`. During the thawing state, the effect used 52 main bubbles and 24 bottom bubbles, replacing the earlier heavier 100-plus-40 particle configuration.

Direct editing verification: the standalone Thawing card accepted a title edit and saved it successfully. The edit helper is controlled by direct-page mode only and is not enabled for iframe presentations.

Live iframe review: the saved Thawing title appeared centered above the video safe area, while the “Click text to edit” helper was absent from the triggered card display.

After making iframe copy explicitly non-editable, the live Thawing card again displayed the saved title cleanly with no helper text, focus styling, or editable controls visible.

Dual-source baseline: `card-source.html` loaded with no active card, a transparent canvas, and all three card pages preloaded before receiving any event from the water-animation source.

Water-source trigger review: pressing Thawing Card restored the thawing bubble animation in `index.html` while keeping that water source free of card rendering.

Cross-source verification: after the water-layer Thawing Card trigger, `card-source.html` reported `activePage: card-thawing.html`, `visible: true`, a transparent canvas, and all three pages preloaded. The centered editable card appeared only in the card layer.

Shared hide-event verification: the card-only layer processed a `hide` event and returned to `activePage: null`, `visible: false`, and a transparent blank canvas without altering the water animation page.

Water-only control verification: Normal mode reported `animationState: standard`, no active card event, a transparent 16:9 gameplay frame, 32 base bubbles, and no bottom thawing bubbles.

Bubbles verification: the water-only source reported `animationState: thawing`, 52 main bubbles, 24 bottom bubbles, and no active card event.

Freeze verification: the water-only source reported `animationState: frozen` with no active card event, retaining the original frozen visual state independently of the card layer.

Deep Freeze verification: the water-only source reported `animationState: frigid` with no active card event, completing the Normal, Bubbles, Freeze, and Deep Freeze water-only checks.
