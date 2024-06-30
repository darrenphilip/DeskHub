const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'DeskHub',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
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
