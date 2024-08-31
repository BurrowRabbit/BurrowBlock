document.addEventListener('DOMContentLoaded', function() {
  const blockedList = document.getElementById('blocked-list');
  const blockList = document.getElementById('block-list');
  const checkboxes = document.querySelectorAll('.checkbox');
  const redirectOption = document.getElementById('redirect-option');
  const customRedirectInput = document.getElementById('custom-redirect');
  const saveBlockButton = document.getElementById('save-block-button');
  const saveRedirectButton = document.getElementById('save-redirect-button');

  let blockUrls = ['reddit.com', 'youtube.com']; // Default blocked URLs
  let lastModificationTimes = {};
  let urlsToSave = [];
  let firstCustomizationSaved = false;

  // Load existing settings and apply them
  chrome.storage.local.get(['blockUrls', 'redirectUrl', 'lastModificationTimes', 'firstCustomizationSaved'], function(result) {
    if (result.firstCustomizationSaved) {
      blockUrls = result.blockUrls || [];
    } else {
      blockUrls = ['reddit.com', 'youtube.com']; // Pre-load blocked sites
    }

    lastModificationTimes = result.lastModificationTimes || {};
    firstCustomizationSaved = result.firstCustomizationSaved || false;

    updateBlockList();

    // Set the checkboxes to match the blockUrls
    checkboxes.forEach(checkbox => {
      checkbox.checked = blockUrls.includes(checkbox.value);
    });

    // Set the redirect option
    if (result.redirectUrl) {
      const selectOption = Array.from(redirectOption.options).find(option => option.value === result.redirectUrl);
      if (selectOption) {
        redirectOption.value = result.redirectUrl;
      } else {
        redirectOption.value = 'custom';
        customRedirectInput.value = result.redirectUrl;
      }
    }
    updateCustomRedirectVisibility();
  });

  // Update the block list panel
  function updateBlockList() {
    blockList.innerHTML = '';
    blockUrls.forEach(site => {
      const li = document.createElement('li');
      li.textContent = site;
      blockList.appendChild(li);
    });
  }

  // Handle checkbox changes
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (checkbox.checked) {
        if (!blockUrls.includes(checkbox.value)) {
          blockUrls.push(checkbox.value);
          urlsToSave.push(checkbox.value);
        }
      } else {
        const now = new Date().getTime();
        if (checkbox.value in lastModificationTimes && (now - lastModificationTimes[checkbox.value] < 5 * 24 * 60 * 60 * 1000)) {
          const unlockTime = new Date(lastModificationTimes[checkbox.value] + 5 * 24 * 60 * 60 * 1000).toLocaleString();
          alert(`Sorry, this site cannot be unblocked until ${unlockTime}.`);
          checkbox.checked = true;
        } else {
          blockUrls = blockUrls.filter(url => url !== checkbox.value);
        }
      }
      updateBlockList();
    });
  });

  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  redirectOption.addEventListener('change', updateCustomRedirectVisibility);

  function updateCustomRedirectVisibility() {
    customRedirectInput.style.display = redirectOption.value === 'custom' ? 'block' : 'none';
  }

  saveBlockButton.addEventListener('click', function() {
    const now = new Date().getTime();
    urlsToSave.forEach(url => {
      lastModificationTimes[url] = now;
    });

    blockUrls.forEach(url => {
      if (!(url in lastModificationTimes)) {
        lastModificationTimes[url] = now;
      }
    });

    firstCustomizationSaved = true;
    urlsToSave = [];

    chrome.storage.local.set({ blockUrls, lastModificationTimes, firstCustomizationSaved }, function() {
      alert('Block list saved successfully.');
      chrome.runtime.sendMessage({ type: 'updateBlockUrls', blockUrls: blockUrls });
    });
  });

  saveRedirectButton.addEventListener('click', function() {
    let redirectUrl = redirectOption.value === 'custom' ? customRedirectInput.value : redirectOption.value;

    if (redirectOption.value === 'custom' && !isValidUrl(redirectUrl)) {
      alert("Please enter a valid URL for redirection.");
      return;
    }

    chrome.storage.local.set({ redirectUrl }, function() {
      alert("Redirect destination saved successfully.");
      chrome.runtime.sendMessage({ type: 'updateRedirect', redirectUrl: redirectUrl });
    });
  });
});