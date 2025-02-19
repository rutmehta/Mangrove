// GET THE ELEMENTS
// _______________________________________________________________________________________________________________________
let webview = document.getElementById('webview')
// DONT ACCESS TABS USING TAB_GROUP, ACCESS USING TABS ARRAY BELOW. 
// TAB GROUP IS AN HTML ELEMENT WHICH MAKES IT A BITCH TO WORK WITH
let tab_group = document.getElementById('tab-group')
let new_tab_button = document.getElementById('newTabButton')
// TOP URL BAR
let search_bar = document.getElementById('search-bar')
// _______________________________________________________________________________________________________________________

// GLOBALS - LISTING THEM FOR CONVENIANCE
// _______________________________________________________________________________________________________________________
curr_tab_index = 0 // USE WITH TABS ARRAY
curr_tab = null // HOLDS TAB OBJECT

// _______________________________________________________________________________________________________________________

// INIT TAB ARRAY AND MANUALLY CREATE EVENT LISTENER FOR THE FIRST TAB. 
// FIRST TAB IS MADE WHEN APP IS OPENED SO ITS TREATED DIFFERENTLY FROM THE REST
// _______________________________________________________________________________________________________________________
// TAB ARRAY WHICH HOLDS ALL ATABS
let tabs = []

class Tab{
  constructor(bttn, index){
      // HOLDS HTML BUTTON AND INDEX IN ARRAY. 
      // YEAH I SEE PROBLEMS WITH THIS SETUP IN THE FUTURE. IT WORKS FOR NOW
      this.bttn = bttn;
      this.index = index;
  }
}

curr_tab_index = 0
curr_tab = new Tab(tab_group.children[curr_tab_index], 0)

// FIRST TAB NEEDS TO BE INITIALIZED BY ITSELF
tabs[0].bttn.addEventListener('click', () => {
  // YOU GET PROBLEMS IF YOU SET WEBVEIW WITH THE SAME SOURCE AS ITS CURRENT ONE SO HERE I AM MAKIGN SURE THAT DOESNT HAPPEN
  // ALSO SINCE THE HOMEPAGE ISNT AN ACTUAL URL I JUST SET URL TO SAY MANGROVE FOR IT
  // _______________________________________________________________________________________________________________________
  let next_src = ''
  if (tabs[0].bttn.textContent == "Mangrove"){
    next_src = "file:///Users/royhouwayek/Documents/WorkSpaces/hackru2025/browser/my-app/src/front_page.html"
  }else{
    next_src = tabs[0].bttn.textContent
  }

  curr_src = webview.getAttribute("src")

  if (curr_src != next_src){
    // YOU GET ERROR IF YOU CHANGE URL INSTANTLY SO I ADDED SOME DELAY
    setTimeout(() => {
      webview.setAttribute("src", next_src);
    }, 50);  // Delay of 500 milliseconds (0.5 seconds)
    search_bar.value = "Mangrove"
  }
  // _______________________________________________________________________________________________________________________

  // UPDATE CURR TAB AND ITS INDEX
  curr_tab_index = tabs[0].index
  curr_tab = tabs[tabs[0].index]
})
// _______________________________________________________________________________________________________________________

// THIS OPENS UP INSPECT ELEMENT FOR DEBUGGING
webview.addEventListener('dom-ready', () => {
  //webview.openDevTools()
})

// THIS GETS THE URL FROM FRONT PAGE AND PASSES IT ON TO THE BACKEND TO WORK WITH. 
// THIS IS SAFER THAN JUST HANDLING IT STRAIGHT HERE
webview.addEventListener('ipc-message', event => {
  // prints "ping"
  console.log("got this from front page: ", event.channel)
  // THIS FUNCTION IS EXPOSED IN PRELOAD.JS
  // ADDS MESSAGE IN FRONT TO HELP BACKEND PARSE
  window.electron.sendUrl("front page:"+event.channel)
})

// SEARCH FROM MANGROVE HOME PAGE (front_page.html) BUT GIVEN TO US FROM MAIN
// ________________________________________________________________________________________________________________
window.electron.receive('home-search', (data) => {
  console.log('URL from Main:', data);
  setTimeout(() => {
    webview.setAttribute("src", data);
  }, 50); 
  search_bar.value = data
  curr_tab.bttn.textContent = data 
});
// ________________________________________________________________________________________________________________

// THIS LETS THE ADD TAB BUTTON WORK. 
// IT ATTACHES ITS LISTENER AND ATTACHES THE LISTENERS FOR ALL THE TABS IT MAKES.  
// ________________________________________________________________________________________________________________
new_tab_button.addEventListener('click', function() {

  // MAKES THE NEW TAB (WHICH IS SECRETELY AN HTML BUTTON) 
  newTab = new Tab(document.createElement('button'), tabs.length);
  tabs.push(newTab)

  newTab.bttn.id = "tab"
  
  // ADDS THE TAB TO ITS HTML CONTAINER (TAB GROUP)
  // THE ADD TAB BUTTON ITSELF IS ACTUALLY THE LAST CHILD SO I REMOVE IT TEMPORARILY, ADD THE TAB, THEN PUT THE BUTTON BACK.
  let lastChild = tab_group.children[tab_group.children.length - 1];
  tab_group.removeChild(lastChild);
  // DONT ADD THE ENTIRE CLASS, JUST THE HTML/CSS PART HENCE newTab.bttn
  tab_group.appendChild(newTab.bttn);
  tab_group.appendChild(lastChild);

  // SAME THING AS FOR THE FIRST TAB LISTENER BUT BECAREFUL BECAUSE THIS RETURNS A FUNCTION
  // IT CAPTURES THE CONTEXT OF THE CURRENT TAB, NOT JUST THE NEWEST TAB. 
  // THATS WHY WE RETURN A FUNCTION AND NOT JUST ATTACH IT DIRECTLY
  // ________________________________________________________________________________________________________________
  newTab.bttn.addEventListener('click', (function(tab) {
    return function() {

      let next_src = ''
      if (tab.bttn.textContent == "Mangrove"){
        next_src = "file:///Users/royhouwayek/Documents/WorkSpaces/hackru2025/browser/my-app/src/front_page.html"
      }else{
        next_src = tab.bttn.textContent
      }
    
      curr_src = webview.getAttribute("src")
    
      if (curr_src != next_src){
        setTimeout(() => {
          webview.setAttribute("src", next_src);
        }, 50);  // Delay of 500 milliseconds (0.5 seconds)
        search_bar.value = "Mangrove"
      }
    
      curr_tab_index = tab.index
      curr_tab = tabs[tab.index]
    };
  })(newTab));  // Pass newTab into the function
  // ________________________________________________________________________________________________________________

  // WE ARE BACK FOR ADD TAB BUTTON EVENT HANDLER
  // ________________________________________________________________________________________________________________
  // MAKES A NICE MODERN TRANSITION AND SETS THE NEW TAB TEXT
  newTab.bttn.textContent = 'Mangrove';
  newTab.bttn.style.opacity = 0;
  newTab.bttn.style.transition = 'opacity 1s ease';

  setTimeout(function() {
    // Trigger the animation
    newTab.bttn.style.opacity = 1;
  }, 0);  // This ensures the initial styles are applied first

  // UPDATES CURR TAB
  curr_tab_index = newTab.index
  curr_tab = tabs[newTab.index]

  // GOES BACK TO HOME PAGE (front_page.html)
  if (webview.getAttribute("src") != "file:///Users/royhouwayek/Documents/WorkSpaces/hackru2025/browser/my-app/src/front_page.html"){
    setTimeout(() => {
      webview.setAttribute("src", "file:///Users/royhouwayek/Documents/WorkSpaces/hackru2025/browser/my-app/src/front_page.html");
    }, 50); 
    search_bar.value = "Mangrove"
  }
// ________________________________________________________________________________________________________________

});

// HANDLES TOP SEARCH BAR
// ________________________________________________________________________________________________________________
search_bar.addEventListener('keydown', (event) => {
  if (event.key === "Enter") {
      const inputValue = event.target.value;
      curr_tab.bttn.textContent = inputValue
      // SENDS URL BACK TO MAIN (INDEX.js)
      window.electron.sendUrl("search bar:"+inputValue)
    }
});

// GETS INFO BACK FROM MAIN AND SETS WEBVEIW
window.electron.receive('bar-search', (data) => {
  search_bar.value = data
  curr_tab.bttn.textContent = data 
  setTimeout(() => {
    webview.setAttribute("src", data);
  }, 50); 
});
// ________________________________________________________________________________________________________________
