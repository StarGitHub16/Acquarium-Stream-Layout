# Fallback Layout Verification

The user-supplied `icesteam` layout is the active visual base for the water source. At a 1280×1100 preview viewport, `window.gelidUnderlayDiagnostics()` measured the centered gameplay frame at **1152×648** with a **1.7778** aspect ratio, positioned at `left: 64px` and `top: 226px`. This preserves the requested 16:9 video-safe frame while keeping the fallback layout’s original aquarium styling.

The `Thawing Card` control was then triggered on the water source. Its fallback water animation switched to the thawing/bubble state and published the shared card event for the transparent card layer to consume.

The `card-source.html` Browser Source received that event on startup and showed the preloaded `card-thawing.html` page. Its layer diagnostic reported `visible: true`, `transparent: true`, and `alignment.centered: true`, with a card center of `(640, 549.992)` against a stage center of `(640, 550)` — a sub-pixel vertical rounding difference only.

Pressing the same `Thawing Card` control again returned the fallback water source to its normal aquarium state and published the companion hide event for the card layer.

The transparent-card receiver was also exercised with the same local-storage event shape used by the water source. It cleared the active card and reported `visible: false`, `activePage: null`, and `transparent: true`; the three editable card pages remained preloaded.

In `index.html?video=underlay&preview=grid`, the independent animation controls were rechecked in sequence: Normal → Bubbles → Freeze → Deep Freeze → Normal. The diagnostic reported the expected `standard`, `thawing`, `frozen`, `frigid`, and restored `standard` states, with `activeCard: null` throughout. The 1152×648, 16:9, transparent frame remained centered in every state, and decorative layers were correctly suppressed in underlay mode. The thawing state used 52 base bubbles and 24 bottom bubbles; the standard state returned to its 32-base-bubble target.

The existing thawing, frozen, and offline card designs were retained without further visual or size edits, as requested. The separate card-source layer only fades those existing pages in and out; it does not restyle their contents.

The OBS-facing water URL, `index.html?video=underlay&preview=grid`, was visually verified with **no preview buttons present**. The ordinary `index.html` preview still exposes all four animation controls and three Card + Animation controls, so preview operation remains available without leaking buttons into OBS.

After a shared hide event, `card-source.html` was opened directly and verified blank, transparent, and free of controls or visible cards. This is the exact initial state required for the upper OBS Browser Source.

The normal preview’s `Thawing Card` button was then pressed. The fallback water source entered its thawing/bubble state and published the corresponding `card-thawing.html` show event for the separate transparent card source.

The transparent card source then showed only the unchanged Thawing card after the fade settled. Its diagnostic confirmed `visible: true`, `transparent: true`, `activePage: card-thawing.html`, three preloaded cards, and centered alignment at the same stage center. No controls appeared in the card layer.

After the final cleanup, `card-frozen.html` and `card-offline.html` were reopened directly and visually verified with their retained Frosted and Tank Freezing designs, respectively. Their editor-only guidance appears only on the direct edit pages, not in the transparent OBS card layer.

All three final card pages were then exercised in `card-source.html`: Thawing (`STREAM THAWING`), Frozen (`FROZEN`), and Offline (`TANK FREEZING`). Each became the sole visible active page, remained centered and transparent outside the card, and had editing mode disabled inside its iframe. This confirms the final separate-source behavior uses the original card visuals without overlay controls or editor text.

The final restored direct `card-thawing.html` page was reopened and verified with its retained `STREAM THAWING` title and `THE AQUARIUM OPENS SOON` subtitle. It correctly entered direct editor mode, while the same card remains non-editable when loaded through the transparent card source. Together with the final Frozen and Offline direct-page checks above, this completes the post-revert validation for every delivered card URL.

## Final Delivery Summary

The delivered water source uses the user-supplied fallback layout with the retained centered 16:9 gameplay frame. Its OBS URL hides every preview control. The delivered `card-source.html` URL begins as a blank transparent layer, then fades in exactly one unchanged preloaded card after a Card + Animation event; direct card URLs remain the separate edit pages only.

## Blank-on-Load Correction

`card-source.html` now deliberately ignores a prior stored show event when it loads. A fresh load was verified with `activePage: null`, `visible: false`, and a transparent page even though a previous card event remained in storage. This prevents a stale card from appearing in OBS before a new button press.

A new shared-channel show event then activated and centered the Thawing card after its fade, while its companion hide event immediately restored `activePage: null` and `visible: false`. The live listener therefore retains the required on/off behavior without replaying stale events during a page load.

The actual `Thawing Card` button on the normal water-source preview was pressed after this correction. It initiated the thawing/bubble water state and published a fresh card event, confirming that the button-based sender remains active.

The emitted event was confirmed as `action: show` for `card-thawing.html`. Pressing that same Thawing Card button a second time visibly returned the water source to its normal state, completing the sender-side toggle sequence.

The second press emitted the expected `action: hide` event with no card page. Combined with the live transparent-layer show/hide verification above, the final behavior is now: load blank; first matching button press fades the card in; second press hides it and restores the normal water state.

For a concurrent end-to-end check, a fresh same-origin `card-source.html` context was loaded alongside the live water source. Its initial diagnostic was blank and transparent (`activePage: null`, `visible: false`) before any new control interaction.

With both sources open concurrently, an actual press of the water source’s `Thawing Card` control changed the water to the thawing state and made the card source report `activePage: card-thawing.html` and `visible: true`. Pressing that same control again reset the water source to `standard` and returned the card source to `activePage: null` and `visible: false`. This is the final end-to-end behavior required for OBS.

## Individual Live-Card URL Correction

The direct live `card-thawing.html` URL was rechecked after its controller update. It now opens blank, transparent, non-editable, and in `card-live` mode (`visible: false`); it no longer shows the card merely because the page was opened.

The companion `card-thawing.html?edit=1` URL was verified separately. It preserves the existing visible card design and enters `card-editor` mode with editable title and subtitle fields, keeping all editor guidance out of the live overlay URL.

All three individual live URLs—Thawing, Frozen, and Offline—were then loaded concurrently alongside the water source. Each reported `card-live: true` and `visible: false` before any control was activated, confirming that only explicit edit URLs display card content on load.

An actual Thawing Card button press on `index.html` made only `card-thawing.html` active; Frozen and Offline remained blank. Pressing the same Thawing control again returned all three card URLs to blank and restored the water source to its standard state.

The Frozen Card control was then tested with all three live URLs present. It revealed only `card-frozen.html`, with Thawing and Offline still blank. A second Frozen press cleared every live card URL and restored the water source to its standard state.

The Offline Card control completed the per-button verification. It revealed only `card-offline.html`, while Thawing and Frozen remained blank; its second press cleared all three individual live-card URLs and restored the standard water state. Thawing, Frozen, and Offline now each show only their matching card, then hide it on a second press.

## Restored Emoji Zoom Motion

The Thawing card’s emoji was checked in explicit edit mode after the shared style update. It now runs the looping `card-icon-zoom` animation for 2.2 seconds per cycle with infinite repetition, smoothly scaling in and out around its center without changing any card dimensions. The existing reduced-motion stylesheet rule still disables that non-essential motion when requested.

The plain Thawing live-card URL was also loaded alongside the water source. Before activation it remained blank, while its hidden emoji correctly reported the restored `card-icon-zoom` animation as ready for reveal.

After a real Thawing Card button press, that same live card revealed with `card-icon-zoom` running for 2.2 seconds per infinite cycle. A second press hid the card and restored the standard water state, confirming the emoji animation rides correctly with the card’s live reveal.

## Frosted Sheen Swipe

The plain Thawing live-card URL remained blank until a fresh matching event arrived. On reveal, it became visible with the one-pass `card-sheen-sweep` animation active across the card surface while the continuous `card-icon-zoom` animation continued independently on the emoji.

## Separate Control Panel

The stream-facing water URL was reopened in underlay preview and confirmed to have no visible animation or card buttons. The new `control-panel.html` page separately exposes the four water-state actions and three Card + Water State actions, keeping controls out of the stream output.

For controller verification, fresh water and Thawing live-card contexts were opened alongside the control panel. They began as standard water with a blank card, then the real Thawing Card controller action was issued.

The first controller press set the water source to `thawing`, published `card-thawing.html`, and made the matching live card visible with its sheen active. The controller then returned to its Normal display after a second press, ready to clear the live state.

The second controller press restored standard water, cleared the active card, and returned the Thawing page to blank. An animation-only Freeze press then moved the water source to `frozen` while leaving the card blank. The separate controller therefore handles both water-only and paired card actions without placing controls into the stream source.

Fresh Frozen and Offline live-card contexts were opened blank alongside the controller. The real Frozen Card controller action was then issued for matching-card verification.

## Mobile Controller Layout

The clean controller was rendered at a 390×844 phone viewport. Water controls fit as a clear two-by-two touch grid, card controls expand into three large full-width buttons, and the complete panel fits comfortably with readable headings, status, and footer guidance. The mobile rules provide at least 68px-high tap targets with safe-area bottom spacing.

Fresh water, Frozen-card, and Offline-card contexts were then loaded blank alongside the mobile-ready controller. The real Frozen Card controller action was issued for a new end-to-end matching check.

The controller’s Frozen Card action set frozen water and revealed only the matching Frozen card, leaving Offline blank. The real Offline Card action was then issued to verify its corresponding deep-freeze/card pairing.

The Offline Card action set the water source to `frigid` and revealed only the matching Offline card, with Frozen hidden. Its second controller press then returned the controller status to Normal to clear the paired live state.

The second Offline press was confirmed to restore `standard` water with no active card and both Frozen and Offline live-card pages blank. Together with the earlier Thawing action, all three controller Card + Water State controls now show only their matching card, and each second press returns the unobstructed stream state.

For a comprehensive controller check, Thawing, Frozen, and Offline live-card pages were all opened concurrently. The Frozen Card action set frozen water and revealed only Frozen; Thawing and Offline remained blank. The real Offline Card action was then issued to confirm the final matching switch.

The comprehensive Offline check confirmed `frigid` water with only Offline visible; Frozen and Thawing remained blank. A dedicated phone-breakpoint browser session then ran the real Offline Card controller action at a 500px-wide responsive viewport: the panel was 465px wide, the tapped control was 68px high, water became `frigid`, and `card-offline.html` became visible. This verifies the mobile layout and action transport together.
