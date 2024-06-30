const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'DeskHub',
    show: false,
    icon: path.join(__dirname, 'images/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  mainWindow.maximize();
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.setMenu(null);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
const workspaceFilePath = path.join(app.getPath('userData'), 'workspaces.json');

ipcMain.handle('get-workspaces', async () => {
  if (fs.existsSync(workspaceFilePath)) {
    const data = fs.readFileSync(workspaceFilePath);
    return JSON.parse(data);
  } else {
    return [];
  }
});

ipcMain.handle('save-workspace', async (event, workspaceName) => {
  let workspaces = [];
  if (fs.existsSync(workspaceFilePath)) {
    const data = fs.readFileSync(workspaceFilePath);
    workspaces = JSON.parse(data);
  }
  workspaces.push({ name: workspaceName, apps: [] });
  fs.writeFileSync(workspaceFilePath, JSON.stringify(workspaces));
  return workspaces;
});

ipcMain.handle('select-app', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Executables', extensions: ['exe'] },
    ],
  });
  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});

ipcMain.handle('save-apps-to-workspace', async (event, workspaceIndex, apps) => {
  let workspaces = [];
  if (fs.existsSync(workspaceFilePath)) {
    const data = fs.readFileSync(workspaceFilePath);
    workspaces = JSON.parse(data);
  }
  if (workspaces[workspaceIndex].apps.length + apps.length > 6) {
    return { error: 'A workspace can have a maximum of 6 apps.' };
  } else {
    workspaces[workspaceIndex].apps = apps;
    fs.writeFileSync(workspaceFilePath, JSON.stringify(workspaces));
    return workspaces[workspaceIndex];
  }
});

ipcMain.handle('launch-workspace', async (event, workspaceIndex) => {
  let workspaces = [];
  if (fs.existsSync(workspaceFilePath)) {
    const data = fs.readFileSync(workspaceFilePath);
    workspaces = JSON.parse(data);
  }
  const apps = workspaces[workspaceIndex].apps;
  apps.forEach(appPath => {
    execFile(appPath, (error) => {
      if (error) {
        console.error('Failed to launch app:', error);
      }
    });
  });
});

ipcMain.handle('save-workspaces', async (event, workspaces) => {
  fs.writeFileSync(workspaceFilePath, JSON.stringify(workspaces));
  return workspaces;
});
