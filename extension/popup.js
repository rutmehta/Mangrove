// Show status message
function showStatus(message, isError = false) {
    const status = document.getElementById('status-message');
    status.textContent = message;
    status.style.background = isError ? '#dc3545' : '#28a745';
    status.style.display = 'block';
    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}

// Handle tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update active tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update active content
        document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
        document.getElementById(tab.dataset.tab).classList.add('active');

        // Load content based on active tab
        if (tab.dataset.tab === 'history') {
            loadHistoryGraph();
        } else if (tab.dataset.tab === 'notes') {
            loadNotes();
        }
    });
});

// Create and update D3.js graph
function createGraph(nodes) {
    // Clear previous graph
    d3.select("#graph-container").selectAll("*").remove();

    if (nodes.length === 0) {
        const container = d3.select("#graph-container")
            .append("div")
            .style("text-align", "center")
            .style("padding-top", "40%");
        
        container.append("p")
            .text("No browsing history recorded yet.")
            .style("color", "#666");
        return;
    }

    // Set up SVG
    const width = document.getElementById('graph-container').clientWidth;
    const height = document.getElementById('graph-container').clientHeight;
    
    const svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create graph data structure
    const links = nodes
        .filter(node => node.parentId)
        .map(node => ({
            source: nodes.find(n => n.url === node.parentId),
            target: node
        }))
        .filter(link => link.source && link.target); // Remove invalid links

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links)
            .id(d => d.url)
            .distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(50));

    // Create arrow marker
    svg.append("defs").selectAll("marker")
        .data(["end"])
        .join("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#999");

    // Add links
    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("class", "link")
        .attr("marker-end", "url(#arrow)");

    // Create node groups
    const node = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Add circles to nodes
    node.append("circle")
        .attr("r", 6)
        .attr("fill", d => d.parentId ? "#69b3a2" : "#ff7675");

    // Add labels to nodes
    node.append("text")
        .attr("dx", 8)
        .attr("dy", ".35em")
        .text(d => d.title ? (d.title.length > 30 ? d.title.substring(0, 27) + "..." : d.title) : "Untitled")
        .style("font-size", "12px")
        .style("fill", "#333");

    // Add title tooltip
    node.append("title")
        .text(d => d.title || d.url);

    // Make nodes clickable
    node.on("click", (event, d) => {
        chrome.tabs.create({ url: d.url });
    });

    // Update positions on simulation tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }

    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }

    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
}

// Load and display history graph
function loadHistoryGraph() {
    chrome.storage.local.get(['graphData'], (result) => {
        const nodes = result.graphData || [];
        createGraph(nodes);
    });
}

// Load and display notes
function loadNotes() {
    const notesContainer = document.getElementById('notes-items');
    const compiledContainer = document.getElementById('compiled-notes');
    notesContainer.innerHTML = '';
    compiledContainer.innerHTML = '';

    chrome.storage.local.get(['copiedTexts', 'compiledNotes'], (result) => {
        // Display compiled notes
        const compiledNotes = result.compiledNotes || [];
        if (compiledNotes.length > 0) {
            const latestCompiled = compiledNotes[compiledNotes.length - 1];
            const compiledDiv = document.createElement('div');
            compiledDiv.className = 'compiled-notes';
            compiledDiv.innerHTML = `
                <h3>Latest Summary</h3>
                <div>${latestCompiled.summary.replace(/\n/g, '<br>')}</div>
                <div class="timestamp">Compiled at: ${new Date(latestCompiled.timestamp).toLocaleString()}</div>
            `;
            compiledContainer.appendChild(compiledDiv);
        } else {
            compiledContainer.innerHTML = '<p>No compiled notes yet. Copy some text while browsing to create notes.</p>';
        }

        // Display raw notes
        const notes = result.copiedTexts || [];
        if (notes.length > 0) {
            notes.reverse().forEach(note => {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'notes-item';
                noteDiv.innerHTML = `
                    <div><strong>Text:</strong> ${note.text}</div>
                    <div><strong>Source:</strong> <a href="${note.sourceUrl}" class="source-link" target="_blank">${note.sourceTitle}</a></div>
                    <div class="timestamp">Copied at: ${new Date(note.timestamp).toLocaleString()}</div>
                `;
                notesContainer.appendChild(noteDiv);
            });
        } else {
            notesContainer.innerHTML = '<p>No notes yet. Copy text while browsing to create notes.</p>';
        }
    });
}

// Load initial content
loadHistoryGraph();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === '1') {
        document.querySelector('[data-tab="history"]').click();
    } else if (e.key === '2') {
        document.querySelector('[data-tab="notes"]').click();
    }
});
