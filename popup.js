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
  const progressContainer = document.getElementById('progressContainer');

  try {
    clearButton.disabled = true;
    statusLabel.className = 'status working';
    statusLabel.textContent = 'Clearing Data...';
    progressContainer.style.display = 'block';

    const domain = await getCurrentDomain();
    if (!domain) {
      throw new Error('Error: Unable to detect domain');
    }

    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    const currentUrl = tabs[0].url;

    //
    // Initialize tracking variables
    //
    let totalCookies = 0;
    let clearedCookies = 0;

    //
    // Inner helper function to update progress UI
    //
    function updateProgress(cookiesClearedCount, totalCookiesCount, phase) {
      const percentage = totalCookiesCount > 0
        ? Math.round((cookiesClearedCount / totalCookiesCount) * 100)
        : 0;

      document.getElementById('progressFill').style.width = percentage + '%';
      document.getElementById('progressText').textContent = percentage + '%';
    }

    //
    // Inner helper function to clear cookies with progress tracking
    //
    async function clearCookiesWithProgress(cookieList, label) {
      const cookiePromises = [];
      let clearedCount = 0;

      document.getElementById(label + 'Count').textContent = `0/${cookieList.length}`;

      for (const cookie of cookieList) {
        const url = `http${cookie.secure ? 's' : ''}://${cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain}${cookie.path}`;

        const promise = browserAPI.cookies.remove({
          url: url,
          name: cookie.name
        }).then(() => {
          clearedCount++;
          document.getElementById(label + 'Count').textContent = `${clearedCount}/${cookieList.length}`;
          updateProgress(clearedCookies + clearedCount, totalCookies);
        });

        cookiePromises.push(promise);
      }

      await Promise.all(cookiePromises);
      return clearedCount;
    }

    //
    // Get all cookies and count total
    //
    const cookies = await browserAPI.cookies.getAll({ domain: domain });
    totalCookies = cookies.length;

    const wwwCookies = !domain.startsWith('www.')
      ? await browserAPI.cookies.getAll({ domain: 'www.' + domain })
      : [];
    totalCookies += wwwCookies.length;

    const dotCookies = await browserAPI.cookies.getAll({ domain: '.' + domain });
    totalCookies += dotCookies.length;

    //
    // Clear domain cookies
    //
    const clearedDomain = await clearCookiesWithProgress(cookies, 'cookie');
    clearedCookies += clearedDomain;

    //
    // Clear www cookies
    //
    if (wwwCookies.length > 0) {
      const clearedWww = await clearCookiesWithProgress(wwwCookies, 'wwwCookie');
      clearedCookies += clearedWww;
    }

    //
    // Clear subdomain cookies
    //
    if (dotCookies.length > 0) {
      const clearedSubdomain = await clearCookiesWithProgress(dotCookies, 'subdomainCookie');
      clearedCookies += clearedSubdomain;
    }

    //
    // TODO: Add feature to check browser type and use appropriate API calls
    //

    //
    // Using origins to clear other storage types is not supported in Chrome.
    // The following code is commented out to maintain cross-browser compatibility.
    // Need to find alternative methods for Chrome.
    //
    // //
    // // Clear browsing data for the specific origin
    // //
    // const origin = new URL(currentUrl).origin;
    //
    // // Clear various types of storage
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
    //

    //
    // Finalize progress
    //
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('progressText').textContent = '100%';

    statusLabel.className = 'status success';
    statusLabel.textContent = `Successfully cleared ${clearedCookies} item(s) for ${domain}`;

    //
    // Hide progress and disable button for 3 seconds
    //
    setTimeout(() => {
      clearButton.disabled = false;
      statusLabel.className = 'status';
      progressContainer.style.display = 'none';
    }, 3000);

  } catch (error) {
    console.error('Error clearing data:', error);
    statusLabel.className = 'status error';
    statusLabel.textContent = 'Error: ' + error.message;
    progressContainer.style.display = 'none';

    //
    // Re-enable button after slightly longer than 3 seconds
    //
    setTimeout(() => {
      clearButton.disabled = false;
      statusLabel.className = 'status';
    }, 3100);
  }
}

//
// Initialize popup
//
document.addEventListener('DOMContentLoaded', () => {
  displayDomain();
  document.getElementById('clearButton').addEventListener('click', clearSiteData);
});
