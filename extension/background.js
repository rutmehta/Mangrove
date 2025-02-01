// Function to handle extension installation
function handleInstallation() {
    chrome.runtime.onInstalled.addListener(() => {
        console.log("Extension installed!");
        // Set up any initial extension state or configuration here
    });
}

// Function to handle tab updates
function handleTabUpdates() {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        // Monitor tab status changes
        if (changeInfo.status === 'loading') {
            console.log(`Tab ${tabId} is loading...`);
        }
        if (changeInfo.status === 'complete') {
            console.log(`Tab ${tabId} finished loading: ${tab.title}`);
            // Tab is fully loaded - can perform actions here
        }
    });
}

// Function to handle new tab creation
function handleNewTabs() {
    chrome.tabs.onCreated.addListener((tab) => {
        console.log(`New tab created with ID: ${tab.id}`);
        // Can perform actions when new tabs are created
        // For example: modify tab properties, inject scripts, etc.
    });
}

// Initialize all background handlers
function initializeHandlers() {
    handleInstallation();
    handleTabUpdates();
    handleNewTabs();
    console.log('Background handlers initialized');
}

// Start background processes
initializeHandlers();
