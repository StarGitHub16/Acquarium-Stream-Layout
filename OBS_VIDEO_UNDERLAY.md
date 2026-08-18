# OBS Video-Underlay Setup

Use the main `index.html` page as a **Browser Source above your gameplay or media source**. Add `?video=underlay` to the Browser Source URL so the main aquarium canvas is transparent inside the gameplay safe area:

```text
index.html?video=underlay
```

For browser testing only, add `&preview=grid` to draw a dark checkerboard behind the transparent layout:

```text
index.html?video=underlay&preview=grid
```

Do **not** use `preview=grid` in OBS; `video=underlay` by itself is the transparent live-video mode.

Place the sources in OBS in this order:

| Source | Position in OBS source list |
|---|---|
| `Game Capture`, `Window Capture`, or `Media Source` | Below |
| Browser Source loading `index.html?video=underlay` | Above |

The ice frame, perimeter aquarium details, and triggered card iframe remain on the upper Browser Source. The video shows through the transparent safe area. When a **Card + Animation** button is triggered, its separate card page is loaded into the centered iframe over the video; clicking the active button again hides it.
