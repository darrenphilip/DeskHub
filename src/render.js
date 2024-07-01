let selectedWorkspace = null;
let selectedApps = [];

document.addEventListener('DOMContentLoaded', (event) => {
  loadWorkspaces();

  const input = document.getElementById('workspace-input');
  const createButton = document.getElementById('create');
  const selectAppButton = document.getElementById('select-app');
  const saveAppsButton = document.getElementById('save-apps');
  const launchWorkspaceButton = document.getElementById('launch-workspace');

  createButton.addEventListener('click', function() {
    const inputValue = input.value;
    console.log('Input value:', inputValue);
    if (inputValue) {
      saveWorkspace(inputValue);
      input.value = '';
      loadWorkspaces();
    } else {
      alert('Please enter a workspace name.');
    }
  });

  input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      createButton.click();
    }
  });

  selectAppButton.addEventListener('click', async function() {
    const appPath = await window.electron.selectApp();
    if (appPath) {
      selectedApps.push(appPath);
      updateSelectedAppsList();
    }
  });

  saveAppsButton.addEventListener('click', async function() {
    if (selectedWorkspace !== null) {
      const result = await window.electron.saveAppsToWorkspace(selectedWorkspace, selectedApps);
      if (result.error) {
        alert(result.error);
      } else {
        loadWorkspaceApps(selectedWorkspace);
      }
    } else {
      alert('Please select a workspace first.');
    }
  });

  launchWorkspaceButton.addEventListener('click', function() {
    if (selectedWorkspace !== null) {
      window.electron.launchWorkspace(selectedWorkspace);
    } else {
      alert('Please select a workspace first.');
    }
  });
});

function saveWorkspace(workspaceName) {
  console.log('Saving workspace:', workspaceName);
  window.electron.saveWorkspace(workspaceName).then(loadWorkspaces);
}

function loadWorkspaces() {
  window.electron.getWorkspaces().then(workspaces => {
    const workspaceList = document.getElementById('workspace-list');
    workspaceList.innerHTML = '';
    console.log('Loading workspaces:', workspaces);
    workspaces.forEach((workspace, index) => {
      let listItem = document.createElement('li');
      listItem.textContent = workspace.name;
      listItem.addEventListener('click', () => {
        selectWorkspace(index, workspace.name);
      });

      let trashIcon = document.createElement('span');
      trashIcon.innerHTML = '&#128465;'; // Unicode for trash can icon
      trashIcon.className = 'trash-icon';
      trashIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the click event from propagating to the list item
        deleteWorkspace(index);
      });

      listItem.appendChild(trashIcon);
      workspaceList.appendChild(listItem);
    });
  });
}

function selectWorkspace(index, name) {
  selectedWorkspace = index;
  document.getElementById('selected-workspace-name').textContent = `${name}`;
  loadWorkspaceApps(index);
  highlightSelectedWorkspace(index);
}

function deleteWorkspace(index) {
  window.electron.getWorkspaces().then(workspaces => {
    workspaces.splice(index, 1);
    window.electron.saveWorkspaces(workspaces).then(() => {
      loadWorkspaces();
      selectedWorkspace = null;
      document.getElementById('workspace-apps-list').innerHTML = '';
      document.getElementById('selected-workspace-name').textContent = 'None';
    });
  });
}

function loadWorkspaceApps(index) {
  window.electron.getWorkspaces().then(workspaces => {
    const workspaceAppsList = document.getElementById('workspace-apps-list');
    workspaceAppsList.innerHTML = '';
    let selectedApps = workspaces[index].apps;
    selectedApps.forEach((app, appIndex) => {
      let listItem = document.createElement('li');
      listItem.textContent = app;

      let deleteAppIcon = document.createElement('span');
      deleteAppIcon.innerHTML = '&#128465;';
      deleteAppIcon.className = 'trash-icon';
      deleteAppIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        deleteApp(index, appIndex);
      });

      listItem.appendChild(deleteAppIcon);
      workspaceAppsList.appendChild(listItem);
    });
  });
}

function deleteApp(workspaceIndex, appIndex) {
  window.electron.getWorkspaces().then(workspaces => {
    workspaces[workspaceIndex].apps.splice(appIndex, 1);
    window.electron.saveWorkspaces(workspaces).then(() => {
      loadWorkspaceApps(workspaceIndex);
    });
  });
}

function updateSelectedAppsList() {
  const selectedAppsList = document.getElementById('selected-apps');
  selectedAppsList.innerHTML = '';
  selectedApps.forEach((app, index) => {
    let listItem = document.createElement('li');
    listItem.textContent = app;

    let deleteAppIcon = document.createElement('span');
    deleteAppIcon.innerHTML = '&#128465;';
    deleteAppIcon.className = 'trash-icon';
    deleteAppIcon.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteSelectedApp(index);
    });

    listItem.appendChild(deleteAppIcon);
    selectedAppsList.appendChild(listItem);
  });
}

function deleteSelectedApp(appIndex) {
  selectedApps.splice(appIndex, 1);
  updateSelectedAppsList();
}

function highlightSelectedWorkspace(index) {
  const workspaceList = document.getElementById('workspace-list').children;
  for (let i = 0; i < workspaceList.length; i++) {
    if (i === index) {
      workspaceList[i].classList.add('selected');
    } else {
      workspaceList[i].classList.remove('selected');
    }
  }
}