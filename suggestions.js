document.getElementById('suggestion-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    const mailtoLink = `mailto:thekkohli@gmail.com?subject=Suggestion%20from%20BurrowBlock%20Extension&body=${encodeURIComponent(message)}${email ? `%0D%0A%0D%0AFrom: ${encodeURIComponent(name)} (${encodeURIComponent(email)})` : ''}`;
    
    // Open the mail client with the provided details
    window.location.href = mailtoLink;

    // Optionally, display a status message
    document.getElementById('status').textContent = 'Thank you for your suggestion!';
    document.getElementById('suggestion-form').reset();
});
