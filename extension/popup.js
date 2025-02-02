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
            source: node.parentId,
            target: node.url
        }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links)
            .id(d => d.url)
            .distance(100))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2));

    // Add links
    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("class", "link");

    // Add nodes
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
        .attr("r", 5);

    // Add labels to nodes
    node.append("text")
        .attr("dx", 8)
        .attr("dy", ".35em")
        .text(d => d.title.substring(0, 30) + (d.title.length > 30 ? "..." : ""))
        .style("font-size", "10px");

    // Add title tooltip
    node.append("title")
        .text(d => d.title);

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
                <h3>Latest Compiled Notes</h3>
                <div>${latestCompiled.summary.replace(/\n/g, '<br>')}</div>
                <div><small>Compiled at: ${new Date(latestCompiled.timestamp).toLocaleString()}</small></div>
            `;
            compiledContainer.appendChild(compiledDiv);
        }

        // Display raw notes
        const notes = result.copiedTexts || [];
        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'notes-item';
            noteDiv.innerHTML = `
                <div><strong>Text:</strong> ${note.text}</div>
                <div><strong>Source:</strong> <a href="${note.sourceUrl}" target="_blank">${note.sourceTitle}</a></div>
                <div><strong>Time:</strong> ${new Date(note.timestamp).toLocaleString()}</div>
            `;
            notesContainer.appendChild(noteDiv);
        });
    });
}

// Load initial content
loadHistoryGraph();
