import { app, BrowserWindow, session } from 'electron/main';

let win;

const devToolsEnabled = process.argv.includes('--devtools');

const createWindow = () => {
  win = new BrowserWindow({
    width: 1100,
    height: 800,
    title: 'Logic Tracker',
    backgroundColor: "#aaa",
    webPreferences: {
      devTools: true,
      backgroundThrottling: false,
      contextIsolation: true,
    }
  });

  if (devToolsEnabled) {
    win.webContents.openDevTools();
  }

  win.loadFile('./public/index.html');
  win.setBackgroundColor('#aaa')
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

