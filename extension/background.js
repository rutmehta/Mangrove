
class event_listeners{
    
    chrome.runtime.onInstalled.addListener(() => {
        console.log("Extension installed!");
    });




const new_tabchrome.tab.onCreated.addListener(() =>{
    console.log("new tab opened")

})