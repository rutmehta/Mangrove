console.log("cmon")
// front_page.js
// THIS IS FOR THE HOME PAGE SEARCH BAR
document.getElementById('Mangrove_search').addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        const inputValue = event.target.value;
        window.electron.pingHost(inputValue)
    }
  });
  