# Stream-PC Controller

Open `control-panel.html` in a normal browser window **on the same stream PC** that runs XSplit. Do not add the controller page as a stream source.

Use these two Browser Sources in XSplit at **1920 × 1080**:

| Layer | URL / file | Position |
|---|---|---|
| Water animation | `index.html?video=underlay` | Below the card layer |
| Transparent card layer | `card-source.html` | Above the water layer and game/video |

Keep all three pages in the same folder or on the same local host and protocol. The controller sends direct same-computer browser events to the two XSplit Browser Sources.

The water controls work independently. A Card + Water button triggers its paired water animation and matching card. Press the same Card + Water button again to hide the card and restore Normal water.
