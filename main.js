import { app, BrowserWindow, session } from 'electron/main';

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1800,
    height: 1180,
    title: 'Logic Tracker',
    backgroundColor: "#333",
    webPreferences: {
      devTools: false,
      backgroundThrottling: false,
      contextIsolation: true,
    }
  });

  //win.webContents.openDevTools();

  win.loadFile('./public/index.html');
  win.setBackgroundColor('#333')
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['style-src \'self\' \'unsafe-inline\'', 'script-src \'self\'']
      }
    })
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

