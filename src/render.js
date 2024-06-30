let selectedWorkspace = null; // Track the currently selected workspace
let selectedApps = []; // Track the selected apps

document.addEventListener('DOMContentLoaded', (event) => {
  loadWorkspaces();

  const input = document.getElementById('workspace-input');
  const createButton = document.getElementById('create');
  const selectAppButton = document.getElementById('select-app');
  const saveAppsButton = document.getElementById('save-apps');
  const launchWorkspaceButton = document.getElementById('launch-workspace');

  // Event listener for the Create button
  createButton.addEventListener('click', function() {
    const inputValue = input.value; // Get the input value
    console.log('Input value:', inputValue); // Log the input value
    if (inputValue) {
      saveWorkspace(inputValue); // Pass the input value
      input.value = ''; // Clear the input field
      loadWorkspaces();
    } else {
      alert('Please enter a workspace name.');
    }
  });

  // Event listener for Enter key press in the input field
  input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      createButton.click(); // Programmatically click the Create button
    }
  });

  // Event listener for the Select App button
  selectAppButton.addEventListener('click', async function() {
    const appPath = await window.electron.selectApp();
    if (appPath) {
      selectedApps.push(appPath);
      updateSelectedAppsList();
    }
  });

  // Event listener for the Save Apps button
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

  // Event listener for the Launch Workspace button
  launchWorkspaceButton.addEventListener('click', function() {
    if (selectedWorkspace !== null) {
      window.electron.launchWorkspace(selectedWorkspace);
    } else {
      alert('Please select a workspace first.');
    }
  });
});

function saveWorkspace(workspaceName) {
  console.log('Saving workspace:', workspaceName); // Log the workspace name
  window.electron.saveWorkspace(workspaceName).then(loadWorkspaces);
}

function loadWorkspaces() {
  window.electron.getWorkspaces().then(workspaces => {
    const workspaceList = document.getElementById('workspace-list');
    workspaceList.innerHTML = '';
    console.log('Loading workspaces:', workspaces); // Log the workspaces being loaded
    workspaces.forEach((workspace, index) => {
      let listItem = document.createElement('li');
      listItem.textContent = workspace.name;
      listItem.addEventListener('click', () => {
        selectWorkspace(index, workspace.name); // Set the selected workspace index
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
  document.getElementById('selected-workspace-name').textContent = `Currently Selected Workspace: ${name}`;
  loadWorkspaceApps(index);
  highlightSelectedWorkspace(index);
}

function deleteWorkspace(index) {
  window.electron.getWorkspaces().then(workspaces => {
    workspaces.splice(index, 1); // Remove the workspace at the specified index
    window.electron.saveWorkspaces(workspaces).then(() => {
      loadWorkspaces(); // Load the updated list of workspaces
      selectedWorkspace = null; // Reset the selected workspace
      document.getElementById('workspace-apps-list').innerHTML = ''; // Clear the apps list
      document.getElementById('selected-workspace-name').textContent = 'None'; // Clear the selected workspace name
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
      deleteAppIcon.innerHTML = '&#128465;'; // Unicode for trash can icon
      deleteAppIcon.className = 'trash-icon';
      deleteAppIcon.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the click event from propagating to the list item
        deleteApp(index, appIndex);
      });

      listItem.appendChild(deleteAppIcon);
      workspaceAppsList.appendChild(listItem);
    });
  });
}

function deleteApp(workspaceIndex, appIndex) {
  window.electron.getWorkspaces().then(workspaces => {
    workspaces[workspaceIndex].apps.splice(appIndex, 1); // Remove the app at the specified index
    window.electron.saveWorkspaces(workspaces).then(() => {
      loadWorkspaceApps(workspaceIndex); // Load the updated list of apps for the selected workspace
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
    deleteAppIcon.innerHTML = '&#128465;'; // Unicode for trash can icon
    deleteAppIcon.className = 'trash-icon';
    deleteAppIcon.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent the click event from propagating to the list item
      deleteSelectedApp(index);
    });

    listItem.appendChild(deleteAppIcon);
    selectedAppsList.appendChild(listItem);
  });
}

function deleteSelectedApp(appIndex) {
  selectedApps.splice(appIndex, 1); // Remove the app at the specified index
  updateSelectedAppsList(); // Update the list of selected apps
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
