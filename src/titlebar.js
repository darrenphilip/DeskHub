document.getElementById('minimize-button').addEventListener('click', () => {
    window.electron.minimize();
  });
  
  document.getElementById('maximize-button').addEventListener('click', () => {
    window.electron.maximize();
  });
  
  document.getElementById('close-button').addEventListener('click', () => {
    window.electron.close();
  });