# Site-Cleaner

Simple web browser extension to quickly delete website cookies and data. Tested with Chrome and Firefox.

- [Firefox Extension Page](https://addons.mozilla.org/en-US/developers/addon/active-site-cleaner/)

## Features

- Clear cookies for the current domain
- Clear local storage
- Clear session storage
- Clear IndexedDB
- Clear cache storage
- Clear service workers
- Works on both Chrome and Firefox

## Privacy

This extension:

- Does not collect or transmit any data.
- Works entirely locally in your browser.
- Does not track usage.

## Dev Notes

Installation notes for developer testing:

### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the folder containing the extension files
5. The extension will appear in your toolbar

### Firefox

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file
5. The extension will appear in your toolbar

### Web Browser Extension Permissions

This extension requires the following permissions:

- `cookies` - To read and remove cookies.
- `storage` - To clear storage data.
- `browsingData` - To clear browsing data.
- `activeTab` - To get the domain for the current tab.
- `tabs` - To query tab information.

### Packaging the Extension

Pre-requisites:

```bash
sudo apt update
sudo apt install zip
```

Firefox packaging instructions:

```bash
mv manifest_firefox.json manifest.json
zip -r ../site-cleaner-firefox.zip *
mv manifest.json manifest_firefox.json
```

Chrome packaging instructions:

```bash
mv manifest_chrome.json manifest.json
zip -r ../active-site-cleaner-chrome.zip *
mv manifest.json manifest_chrome.json
```
