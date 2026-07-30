import { app, BrowserWindow, session, Menu, ipcMain } from 'electron/main';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ipcChannels from './ipcChannels.cjs';

const { VOICE_CONTROL_TOGGLE, VOICE_CONTROL_FAILURE } = ipcChannels;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let win;
let voiceControlMenuItem;

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
      preload: path.join(__dirname, 'preload.cjs'),
    }
  });

  if (devToolsEnabled) {
    win.webContents.openDevTools();
  }

  win.loadFile('./public/index.html');
  win.setBackgroundColor('#aaa')
};

const buildApplicationMenu = () => {
  const template = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      label: 'Options',
      submenu: [
        {
          label: 'Enable Voice Commands',
          type: 'checkbox',
          checked: false,
          click: (menuItem) => {
            win?.webContents.send(VOICE_CONTROL_TOGGLE, menuItem.checked);
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  const optionsMenuItem = menu.items.find((item) => item.label === 'Options');
  voiceControlMenuItem = optionsMenuItem?.submenu.items.find(
    (item) => item.label === 'Enable Voice Commands'
  );
};

app.whenReady().then(() => {
  buildApplicationMenu();
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

  ipcMain.on(VOICE_CONTROL_FAILURE, () => {
    if(voiceControlMenuItem) {
      voiceControlMenuItem.checked = false;
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

