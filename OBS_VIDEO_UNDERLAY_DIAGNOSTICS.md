# OBS Video-Underlay Diagnostics

Open the main layout with `?video=underlay`, then run this in the Browser Source developer console:

```js
window.gelidUnderlayDiagnostics()
```

The returned object confirms the original centered **16:9** gameplay-frame dimensions, transparent gameplay and card-host backgrounds, whether a card page is currently loaded, and whether non-frame decorative layers have been hidden for the underlay mode.
