// Listen for copy events
document.addEventListener('copy', (event) => {
    // Get the selected text
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText) {
        // Send copied text to background script
        chrome.runtime.sendMessage({
            type: 'COPIED_TEXT',
            text: selectedText,
            sourceUrl: window.location.href,
            sourceTitle: document.title
        });
    }
});
