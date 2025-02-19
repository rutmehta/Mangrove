const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');
const path = require('path');
const started = require('electron-squirrel-startup');
const { spawnSync, spawn, execFile } = require('child_process');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // remove the default titlebar
    titleBarStyle: 'hidden',
    webPreferences: {
      webviewTag: true, // Ensure webview tag is enabled
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// _______________________________________________________________________________________________________________________

ipcMain.on('send-input', (event, input) => {
  console.log('Input received:', input);

  // I WAS PLAYING WITH RUST HERE BUT WE DONT NEED IT FOR THE CURRENT VERSION
  // _______________________________________________________________________________________________________________________
  /*
  const rust_process = spawn("/Users/royhouwayek/Documents/WorkSpaces/hackru2025/browser/my-app/backend/target/release/backend", [input]);

  rust_process.on('error', (error) => {
    console.error(`Error executing Python script: ${error.message}`); 
  });  

  rust_process.stdout.on('data', (data) => {
    console.log(`which cargo output: ${data.toString()}`);
  });
  */
  // Send this to Rust here or process further
  // _______________________________________________________________________________________________________________________
  
});

// THIS IS INFO FROM FRONT_PAGE (THE GREEN HOME PAGE)
// _______________________________________________________________________________________________________________________
ipcMain.on('send-url', (event, url) => {
  const [first, ...rest] = url.split(":");
  const second = rest.join(":")
  console.log("f: ", first)
  console.log("s: ", second)
  if (first === "front page") {
    console.log("Received Url From Front Page: ", url)
    mainWindow.webContents.send('home-search', second);
  }
});
// _______________________________________________________________________________________________________________________

// THIS IS INFO FROM THE SEARCH BAR (THE UI ELEMENT IN THE TOOLBAR)
// _______________________________________________________________________________________________________________________
ipcMain.on('send-url', (event, url) => {
  const [first, ...rest] = url.split(":");
  const second = rest.join(":")
  console.log("f: ", first)
  console.log("s: ", second)
  if (first === "search bar") {
    console.log("Received Url From Search Bar: ", url)
    mainWindow.webContents.send('bar-search', second);
  }
});
// _______________________________________________________________________________________________________________________