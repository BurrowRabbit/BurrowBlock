let blockUrls = ['reddit.com', 'youtube.com'];
let redirectUrl = 'https://www.tryexponent.com';

chrome.runtime.onInstalled.addListener((details) => {
  // Set initial values for storage
  chrome.storage.local.set({
    isEnabled: true,
    blockUrls: blockUrls,
    redirectUrl: redirectUrl
  });

  // Redirect to README.html on first install
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://burrowrabbit.github.io/BurrowBlock/readme.html' });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateRedirect') {
    redirectUrl = message.redirectUrl;
    updateRedirectionRules();
  } else if (message.type === 'updateBlockUrls') {
    blockUrls = message.blockUrls;
    updateRedirectionRules();
  }
});

function updateRedirectionRules() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: blockUrls.map((_, index) => index + 1),
    addRules: blockUrls.map((url, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: 'redirect', redirect: { url: redirectUrl } },
      condition: { urlFilter: `*://*.${url}/*`, resourceTypes: ['main_frame'] }
    }))
  }, () => {
    console.log('Redirection rules updated');
    console.log('Block URLs:', blockUrls);
    console.log('Redirect URL:', redirectUrl);
  });
}

chrome.storage.local.get(['blockUrls', 'redirectUrl'], (result) => {
  if (result.blockUrls) blockUrls = result.blockUrls;
  if (result.redirectUrl) redirectUrl = result.redirectUrl;
  updateRedirectionRules();
});
