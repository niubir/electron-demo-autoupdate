const { app, BrowserWindow } = require('electron')
const { syncAutoUpdate } = require('./update')
const { staticPathJoin } = require('./util')
const { ipcHandler } = require('./ipc')

const mainWindowPreloadFile = staticPathJoin('preload.js')
const mainWindowLoadFile = staticPathJoin('index.html')

const initIPC = () => {
  ipcHandler('Version', () => {
    return {
      version: '1.0.0',
      latest: true,
      must: false,
    }
  })
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: mainWindowPreloadFile
    }
  })

  mainWindow.loadFile(mainWindowLoadFile)
  // mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
  initIPC()
  createWindow()
  syncAutoUpdate()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})