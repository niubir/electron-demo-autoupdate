const { app } = require('electron')
const { showMainWindow } = require('./window')
const { initVersion } = require('./version')
const { initTray } = require('./tray')

app.whenReady().then(() => {
  initTray()

  showMainWindow()
  initVersion()

  app.on('activate', () => {
    showMainWindow()
  })
  app.on('window-all-closed', () => {
    if (process.platform === 'darwin') {
      app.dock.hide()
    }
  })
})