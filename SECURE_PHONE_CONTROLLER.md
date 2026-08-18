# Local Phone Controller for XSplit

This package includes its own **local JavaScript relay**. It runs on the stream PC, so the phone controller, water layer, and card layer communicate on the same Wi-Fi. There is no hosted relay, external service, password, or configuration step.

## Start the relay

Install current [Node.js LTS](https://nodejs.org/) on the stream PC, then double-click `start-overlay-relay.cmd`. If Windows Firewall asks, allow Node.js on **Private networks** only. Keep the terminal window open while streaming.

Run `ipconfig` on the stream PC and note its IPv4 address, normally something like `192.168.1.42`. The phone and stream PC must be on the same Wi-Fi or local network.

| Where | Browser Source or page URL |
|---|---|
| XSplit water Browser Source | `http://127.0.0.1:8787/index.html?video=underlay` |
| XSplit transparent card Browser Source | `http://127.0.0.1:8787/card-source.html` |
| Phone controller | `http://YOUR-STREAM-PC-IP:8787/control-panel.html` |

Replace `YOUR-STREAM-PC-IP` with the IPv4 address from `ipconfig`. In XSplit, set both Browser Sources to **1920 × 1080**, with the transparent card source above the water source and the game/video source beneath both.

## Everyday use

Start `start-overlay-relay.cmd`, open the two local URLs in XSplit, and open the phone controller URL. A Card + Water button runs its matching water effect and card. Pressing that same button again returns the water to Normal and hides the card.

> Any device on the same Wi-Fi can use the controller link. The relay rejects non-local network addresses, but it is intentionally password-free.
