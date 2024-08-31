document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggle-extension');
    const toggleText = document.getElementById('toggle-text');
    const customizeButton = document.getElementById('customize');
    const passwordContainer = document.getElementById('password-container');
    const passwordInput = document.getElementById('password-input');
    const submitPassword = document.getElementById('submit-password');
    const floatingMessage = document.getElementById('floating-message');
    const disableCountdown = document.getElementById('disable-countdown');
    const countdownTimer = document.getElementById('countdown-timer');
    const sitesBlocked = document.getElementById('sites-blocked');
    const disablesRemaining = document.getElementById('disables-remaining');

    let countdownInterval;

    function updateUI(isEnabled, disableCount) {
        toggleText.textContent = isEnabled ? 'Disable' : 'Enable';
    document.getElementById('toggle-image').src = isEnabled ? 'dis.png' : 'en.png';
        passwordContainer.style.display = 'none';
        disablesRemaining.textContent = 3 - disableCount;
    }

    function showFloatingMessage() {
        floatingMessage.style.display = 'block';
        setTimeout(() => {
            floatingMessage.style.display = 'none';
        }, 2000);
    }

    function startCountdown() {
        let timeLeft = 45 * 60; // 45 minutes in seconds
        disableCountdown.style.display = 'block';
        
        countdownInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                toggleExtension(true);
                disableCountdown.style.display = 'none';
            }
            timeLeft--;
        }, 1000);
    }

    function toggleExtension(newStatus) {
        chrome.storage.local.set({ isEnabled: newStatus }, () => {
            if (newStatus) {
                applyRedirectionRules();
                if (countdownInterval) {
                    clearInterval(countdownInterval);
                    disableCountdown.style.display = 'none';
                }
            } else {
                removeRedirectionRules();
                startCountdown();
            }
            chrome.storage.local.get('disableCount', (result) => {
                updateUI(newStatus, result.disableCount || 0);
            });
        });
    }

    toggleButton.addEventListener('click', () => {
        chrome.storage.local.get(['isEnabled', 'disableCount'], (result) => {
            const isEnabled = result.isEnabled !== false;
            const disableCount = result.disableCount || 0;

            if (!isEnabled) {
                toggleExtension(true);
            } else if (disableCount < 3) {
                passwordContainer.style.display = 'block';
document.getElementById('passcode-image').style.display = 'block';
            } else {
                alert('You have reached the limit of 3 disables per day.');
            }
        });
    });

    passwordInput.addEventListener('paste', (e) => {
        e.preventDefault();
        showFloatingMessage();
    });

    submitPassword.addEventListener('click', () => {
        if (passwordInput.value === 'AnIdiotSandwich') {
            chrome.storage.local.get('disableCount', (result) => {
                const newDisableCount = (result.disableCount || 0) + 1;
                chrome.storage.local.set({ disableCount: newDisableCount }, () => {
                    toggleExtension(false);
                    passwordInput.value = '';
                });
            });
        } else {
            alert('Incorrect password.');
        }
    });

    customizeButton.addEventListener('click', () => {
        chrome.tabs.create({ url: 'urls.html' });
    });

    chrome.storage.local.get(['isEnabled', 'disableCount', 'blockedCount'], (result) => {
        updateUI(result.isEnabled !== false, result.disableCount || 0);
        sitesBlocked.textContent = result.blockedCount || 0;
    });
});

function applyRedirectionRules() {
    chrome.storage.local.get(['blockUrls', 'redirectUrl'], (result) => {
        const blockUrls = result.blockUrls || ['youtube.com', 'reddit.com', 'instagram.com', 'netflix.com', 'primevideo.com'];
        const redirectUrl = result.redirectUrl || 'https://www.tryexponent.com';
        const rules = blockUrls.map((url, index) => ({
            id: index + 1,
            priority: 1,
            action: { type: 'redirect', redirect: { url: redirectUrl } },
            condition: { urlFilter: `*://*.${url}/*`, resourceTypes: ['main_frame'] }
        }));
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: rules.map(rule => rule.id),
            addRules: rules
        });
    });
}

function removeRedirectionRules() {
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
        const ruleIds = rules.map(rule => rule.id);
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: ruleIds,
            addRules: []
        });
    });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        chrome.storage.local.get(['isEnabled', 'blockUrls', 'blockedCount'], (result) => {
            if (result.isEnabled !== false) {
                const blockUrls = result.blockUrls || ['youtube.com', 'reddit.com', 'instagram.com', 'netflix.com', 'primevideo.com'];
                if (blockUrls.some(url => tab.url.includes(url))) {
                    chrome.storage.local.set({ blockedCount: (result.blockedCount || 0) + 1 });
                }
            }
        });
    }
});