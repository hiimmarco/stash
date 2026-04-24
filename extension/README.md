# Save to Stash — Chrome extension

One-click save the current tab to your [Stash](../) deployment.

## Install (unpacked / developer mode)

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this `extension/` folder.
4. The Stash icon appears in your toolbar. Pin it for convenience.

## Configure

1. Right-click the extension icon → **Options** (or first-click opens options automatically if no API key is set).
2. Enter your **Base URL** — e.g. `https://stash-alpha-five.vercel.app`.
3. Paste an **API key** generated in Stash → Settings → API Keys.
4. Click **Save**, then **Test connection** to confirm.

## Usage

Click the Stash icon on any page. The extension sends the current tab's URL and title to `/api/save`. A green ✓ badge means saved; a red number is the HTTP error code.

## Files

- `manifest.json` — MV3 manifest
- `background.js` — service worker that handles toolbar click
- `options.html` / `options.js` — settings page (base URL + API key)
- `icons/` — toolbar icons

## Publishing

To publish to the Chrome Web Store, zip the contents of this folder (not the folder itself) and upload via the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole). You'll need to update the `host_permissions` if you want users to configure a custom base URL.
