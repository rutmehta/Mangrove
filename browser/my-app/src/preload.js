const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  sendInput: (input) => ipcRenderer.send('send-input', input),  // Exposed API for input
  sendUrl: (url) => ipcRenderer.send('send-url', url),          // Exposed API for URL
  receive: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)) // Receive messages from main
});
