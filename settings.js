
document.addEventListener('DOMContentLoaded', function() {
  const blockUrlInput = document.getElementById('block-url');
  const redirectSelect = document.getElementById('redirect-url');
  const customRedirectInput = document.getElementById('custom-redirect');
  const saveButton = document.getElementById('save-settings');

  // Show/Hide custom URL input
  redirectSelect.addEventListener('change', function() {
    if (redirectSelect.value === 'custom') {
      customRedirectInput.style.display = 'block';
    } else {
      customRedirectInput.style.display = 'none';
    }
  });

  // Save settings when the user clicks save
  saveButton.addEventListener('click', function() {
    const blockUrl = blockUrlInput.value.trim();
    let redirectUrl = redirectSelect.value;
    if (redirectUrl === 'custom') {
      redirectUrl = customRedirectInput.value.trim();
    }

    chrome.storage.local.set({ blockUrl, redirectUrl }, function() {
      alert('Settings saved successfully! You can now close this tab.');
      window.close(); // Close the settings tab after saving
    });
  });
