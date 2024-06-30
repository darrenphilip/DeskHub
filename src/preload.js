const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getWorkspaces: () => ipcRenderer.invoke('get-workspaces'),
  saveWorkspace: (workspaceName) => ipcRenderer.invoke('save-workspace', workspaceName),
  selectApp: () => ipcRenderer.invoke('select-app'),
  saveAppsToWorkspace: (workspaceIndex, apps) => ipcRenderer.invoke('save-apps-to-workspace', workspaceIndex, apps),
  launchWorkspace: (workspaceIndex) => ipcRenderer.invoke('launch-workspace', workspaceIndex),
  saveWorkspaces: (workspaces) => ipcRenderer.invoke('save-workspaces', workspaces),
});
