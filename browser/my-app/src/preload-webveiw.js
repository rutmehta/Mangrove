const { contextBridge, ipcRenderer } = require('electron')    
console.log("pre wv")

contextBridge.exposeInMainWorld('electron', {
    pingHost: (str) => ipcRenderer.sendToHost(str)
  });