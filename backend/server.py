from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route("/api/data", methods=["GET"])
def get_data():
    return jsonify({"message": "Hello from Python!"})

@app.route("/api/send", methods=["POST"])
def receive_data():
    data = request.json
    print("Received:", data)
    return jsonify({"status": "success", "received": data})

@app.route("/api/url_title", methods=["POST"])
def receive_url ():
    data = request.json
    try:
        # Send a GET request to the URL
        url = data["url"]
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes

    # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
    
    # Get the title
        title = soup.title.string
        print(title)

    except requests.RequestException as e:
        print(f"An error occurred with the request: {e}")
        abort(500)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        abort(500)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
