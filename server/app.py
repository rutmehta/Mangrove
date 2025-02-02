from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import requests
import json

app = Flask(__name__)
CORS(app)

# Initialize embedding model
print("Loading models...")
embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
print("Models loaded successfully!")

# Ollama API endpoint
OLLAMA_API = "http://localhost:11434/api"

def get_embedding(text):
    # Generate embedding using sentence-transformers
    embedding = embedding_model.encode(text)
    return embedding.tolist()

def generate_notes_summary(notes):
    # Prepare prompt for LLaMA
    prompt = f"""Please organize and summarize the following notes:

{notes}

Provide a clear, well-structured summary that:
1. Groups related information
2. Highlights key points
3. Maintains original context and sources

Summary:"""
    
    try:
        # Call Ollama API
        response = requests.post(
            f"{OLLAMA_API}/generate",
            json={
                "model": "llama2:3.2-3b",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "max_tokens": 500
                }
            }
        )
        
        if response.status_code == 200:
            return response.json()['response'].strip()
        else:
            print(f"Error from Ollama API: {response.text}")
            return "Error generating summary"
            
    except Exception as e:
        print(f"Error calling Ollama API: {str(e)}")
        return "Error generating summary"

@app.route('/embed', methods=['POST'])
def embed():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    embedding = get_embedding(text)
    return jsonify({'embedding': embedding})

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.json
    notes = data.get('notes', [])
    if not notes:
        return jsonify({'error': 'No notes provided'}), 400
    
    # Combine notes into a single text
    combined_notes = "\n\n".join([
        f"Source: {note['sourceTitle']}\nURL: {note['sourceUrl']}\nText: {note['text']}"
        for note in notes
    ])
    
    summary = generate_notes_summary(combined_notes)
    return jsonify({'summary': summary})

if __name__ == '__main__':
    # First, ensure the model is pulled
    print("Pulling LLaMA 3.2 3B model...")
    try:
        requests.post(f"{OLLAMA_API}/pull", json={"name": "llama2:3.2-3b"})
        print("Model pulled successfully!")
    except Exception as e:
        print(f"Error pulling model: {str(e)}")
        print("If the model is already pulled, you can ignore this error.")
    
    app.run(port=5000)
