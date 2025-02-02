async function getVectorEmbedding(text) {
    // try {
        console.log(text)
        const response = await fetch('http://127.0.0.1:5000/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        //console.log(response)
        const data = await response.json();
        console.log(JSON.stringify(data))

        return data.summary;
    // } catch (error) {
    //     console.error('Error getting embedding:', error);
    //     // Return mock embedding as fallback
    //     return new Array(384).fill(0).map(() => Math.random());
    // }
}

console.log(getVectorEmbedding("Hello"))