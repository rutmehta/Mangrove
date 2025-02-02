async function getVectorEmbedding(text) {
    // try {
        console.log(text)
        const response = await fetch('http://127.0.0.1:5000/embed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        console.log(JSON.stringify(data))

        return data;
    // } catch (error) {
    //     console.error('Error getting embedding:', error);
    //     // Return mock embedding as fallback
    //     return new Array(384).fill(0).map(() => Math.random());
    // }
}

console.log(getVectorEmbedding("Hello"))