# Separate Card-Page Triggers

The main layout contains one transparent iframe host inside the gameplay frame. The active center-card divs are no longer rendered from `index.html`; each card has its own page.

| Animation-only button | Effect |
|---|---|
| **Normal** | Restores the standard aquarium scene |
| **Bubbles** | Turns the thawing bubble animation on; click again to turn it off |
| **Freeze** | Turns the frozen animation on; click again to turn it off |
| **Deep Freeze** | Turns the frigid animation on; click again to turn it off |

| Card + animation button | Separate card page | Paired effect |
|---|---|
| **Thawing Card** | `card-thawing.html` | Bubbles |
| **Frozen Card** | `card-frozen.html` | Freeze |
| **Offline Card** | `card-offline.html` | Deep Freeze |

Card buttons stay visible until clicked again, then return the aquarium to its normal state. To connect another separate card page, keep the page in this same folder and add `data-card="your-card-file.html"` to a button with the matching `data-animation`.

```html
<button
  data-status="YOUR STATUS"
  data-card="your-card-file.html"
  data-card-duration="9000">
  Your button
</button>
```

The existing commented-out card markup in `index.html` remains commented and was not activated. The generic `editable-center-card.html` is also retained if you want a custom card: point any button’s `data-card` value to it.
