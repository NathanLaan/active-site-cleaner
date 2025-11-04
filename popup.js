//
// Cross-browser compatibility. Detect which API is available and 
// assign to browserAPI.
//
// Use 'browser' for Firefox and 'chrome' for Chrome.
//
// Test for 'browser' first to prioritize Firefox, since Firefox
// also supports 'chrome' API but with reduced functionality.
//
//const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

//console.log(typeof browser !== 'undefined' ? 'Using Firefox API' : 'Using Chrome API');

//
// Get the domain for the current active tab
//
async function getCurrentDomain() {
  const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    const url = new URL(tabs[0].url);
    return url.hostname;
  }
  return null;
}

//
// Display current domain
//
async function displayDomain() {
  const domain = await getCurrentDomain();
  const domainLabel = document.getElementById('domainLabel');
  
  if (domain) {
    domainLabel.textContent = domain;
  } else {
    domainLabel.textContent = 'Error: Unable to detect website domain name';
    document.getElementById('clearButton').disabled = true;
  }
}

//
// Clear data for the current domain
//
async function clearSiteData() {
  const infoLabel = document.getElementById('infoLabel');
  const statusLabel = document.getElementById('statusLabel');
  const clearButton = document.getElementById('clearButton');
  
  try {
    clearButton.disabled = true;
    statusLabel.className = 'status working';
    statusLabel.textContent = 'Clearing Data...';
    
    const domain = await getCurrentDomain();
    if (!domain) {
      throw new Error('Error: Unable to detect domain');
    }

    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    const currentUrl = tabs[0].url;
    
    //
    // Clear domain and subdomain cookies
    //
    const cookies = await browserAPI.cookies.getAll({ domain: domain });
    const cookiePromises = [];
    
    for (const cookie of cookies) {
      const url = `http${cookie.secure ? 's' : ''}://${cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain}${cookie.path}`;
      cookiePromises.push(browserAPI.cookies.remove({
        url: url,
        name: cookie.name
      }));
    }

    //
    // Try with www prefix
    //
    if (!domain.startsWith('www.')) {
      const wwwCookies = await browserAPI.cookies.getAll({ domain: 'www.' + domain });
      for (const cookie of wwwCookies) {
        const url = `http${cookie.secure ? 's' : ''}://${cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain}${cookie.path}`;
        cookiePromises.push(browserAPI.cookies.remove({
          url: url,
          name: cookie.name
        }));
      }
    }
    
    //
    // Check for subdomains cookies (leading dot)
    //
    const dotCookies = await browserAPI.cookies.getAll({ domain: '.' + domain });
    for (const cookie of dotCookies) {
      const url = `http${cookie.secure ? 's' : ''}://${cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain}${cookie.path}`;
      cookiePromises.push(browserAPI.cookies.remove({
        url: url,
        name: cookie.name
      }));
    }
    
    await Promise.all(cookiePromises);
    
    //
    // Clear data for the origin
    //
    // Failing on Firefox due to updated API:
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browsingData/remove
    //
    // const origin = new URL(currentUrl).origin;
    // await browserAPI.browsingData.remove({
    //   origins: [origin]
    // }, {
    //   cacheStorage: true,
    //   cookies: true,
    //   fileSystems: true,
    //   indexedDB: true,
    //   localStorage: true,
    //   serviceWorkers: true,
    //   webSQL: true
    // });
    
    statusLabel.className = 'status success';
    statusLabel.textContent = `Successfully cleared data for ${domain}`;
    
    //
    // Disable button for 2 seconds
    //
    setTimeout(() => {
      clearButton.disabled = false;
      statusLabel.className = 'status';
    }, 2000);
    
  } catch (error) {
    console.error('Error clearing data:', error);
    statusLabel.className = 'status error';
    statusLabel.textContent = 'Error: ' + error.message;
    
    //
    // Re-enable button after slightly longer than 2 seconds
    //
    setTimeout(() => {
      clearButton.disabled = false;
      statusLabel.className = 'status';
    }, 2100);
  }
}

//
// Initialize popup
//
document.addEventListener('DOMContentLoaded', () => {
  displayDomain();
  document.getElementById('clearButton').addEventListener('click', clearSiteData);
});
