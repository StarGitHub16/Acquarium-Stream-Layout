# Dual Browser Source Setup for XSplit

Use two Browser Sources at **1920 × 1080** from the same layout folder or local host.

| XSplit Browser Source layer | File or URL | Purpose |
|---|---|---|
| Water animation | `index.html?video=underlay` | Runs the original Freeze, Thaw, Bubbles, and Deep Freeze effects. Its preview buttons are hidden in this stream-facing view. |
| Card layer | `card-source.html` | Transparent card-only layer that fades the matching editable card above the water/video source. |

Place **Card layer** above **Water animation**, and place game/video capture below both.

Open `control-panel.html` in a regular browser on the same stream PC. It is a clean controller page and is never added to XSplit. Its buttons send direct same-computer browser events to the water and card Browser Sources.

The card layer begins blank whenever it loads. A Card + Water button shows only its matching card; pressing the same button again hides that card and restores Normal water. The individual live card pages also begin blank; use `?edit=1` only when editing their text.

> Keep the controller, water source, and card source in the same folder or served from the same local host and protocol. No relay, port number, password, phone link, external service, or GitHub deployment is required for this same-PC workflow.
