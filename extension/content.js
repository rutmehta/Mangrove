fetch("http://127.0.0.1:5000/api/data")
  .then(response => response.json())
  .then(data => {
    console.log("Received from backend:", data);
  })
  .catch(error => console.error("Error:", error));


 