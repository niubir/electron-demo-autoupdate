const { BrowserWindow } = require('electron')
const { staticPathJoin } = require('./util')

const preloadFile = staticPathJoin('preload.js')
const mainWindowLoadFile = staticPathJoin('index.html')
const iconFile = staticPathJoin('logo.png')

let mainWindow = null

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: iconFile,
    webPreferences: {
      preload: preloadFile,
    }
  })

  mainWindow.loadFile(mainWindowLoadFile)
  // mainWindow.webContents.openDevTools()
}

const isDestroyedMainWindow = () => {
  return !mainWindow || mainWindow.isDestroyed()
}
const showMainWindow = (afterDo) => {
  if (isDestroyedMainWindow()) {
    createMainWindow()
  } else {
    mainWindow.show()
  }
  if (afterDo) {
    afterDo(mainWindow)
  }
}
const hideMainWindow = () => {
  if (isDestroyedMainWindow()) {
    mainWindow.hide()
  }
}

module.exports = {
  showMainWindow,
  hideMainWindow,
  isDestroyedMainWindow,
  mainWindow,
}