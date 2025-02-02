// In-memory database (you might want to use IndexedDB for persistence)
let graphDatabase = {
    nodes: [],
    getNodeByUrl: function(url) {
        return this.nodes.find(node => node.url === url);
    },
    addNode: function(node) {
        this.nodes.push(node);
    }
};

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

// Function to find the most similar node
function findMostSimilarNode(embedding) {
    let maxSimilarity = -1;
    let mostSimilarNode = null;

    for (const node of graphDatabase.nodes) {
        const similarity = cosineSimilarity(embedding, node.embedding);
        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mostSimilarNode = node;
        }
    }

    return mostSimilarNode;
}

// Function to get vector embedding from the server
async function getVectorEmbedding(text) {
    try {
        const response = await fetch('http://127.0.0.1:5000/embed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();

        return data.embedding;
    } catch (error) {
        console.error('Error getting embedding:', error);
        // Return mock embedding as fallback
        return new Array(384).fill(0).map(() => Math.random());
    }
}

// Function to compile notes using LLaMA
async function compileNotes(notes) {
    try {
        //console.log(notes)
        const response = await fetch('http://127.0.0.1:5000/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notes })
        });
        const data = await response.json();
        return data.summary;
    } catch (error) {
        console.error('Error compiling notes:', error);
        return null;
    }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Ignore chrome:// pages, new tabs, and empty pages
        if (tab.url.startsWith('chrome://') || 
            tab.url === 'about:blank' || 
            !tab.url || 
            tab.url === '') {
            return;
        }

        try {
            // Get the page title
            const title = tab.title || '';
            
            // Generate embedding for the title
            const embedding = await getVectorEmbedding(title);
            
            // Find the most similar existing node to be the parent
            const parentNode = graphDatabase.nodes.length > 0 
                ? findMostSimilarNode(embedding) 
                : null;

            // Create new node
            const newNode = {
                url: tab.url,
                title: title,
                embedding: embedding,
                parentId: parentNode?.url || null,
                timestamp: new Date().toISOString()
            };

            // Add to database
            graphDatabase.addNode(newNode);

            // Store in chrome.storage for persistence
            chrome.storage.local.set({ graphData: graphDatabase.nodes });
        } catch (error) {
            console.error('Error processing new page:', error);
        }
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'COPIED_TEXT') {
        console.log('Received copied text:', request);  // Debug log
        const { text, sourceUrl, sourceTitle } = request;
        
        // Store copied text with source information
        chrome.storage.local.get(['copiedTexts'], (result) => {
            try {
                const copiedTexts = result.copiedTexts || [];
                copiedTexts.push({
                    text,
                    sourceUrl,
                    sourceTitle,
                    timestamp: new Date().toISOString()
                });
                
                // Store the raw copied texts
                chrome.storage.local.set({ copiedTexts }, () => {
                    console.log('Saved copied text. Total notes:', copiedTexts.length);  // Debug log
                    if (chrome.runtime.lastError) {
                        console.error('Error saving copied text:', chrome.runtime.lastError);
                    }
                });
            } catch (error) {
                console.error('Error processing copied text:', error);
            }
        });
    }
    // Return true to indicate we will send a response asynchronously
    return true;
});
