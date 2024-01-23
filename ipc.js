const { ipcMain, BrowserWindow } = require('electron')

const ipcHandler = (chan, handler) => {
  ipcMain.handle(chan, (e, ...args) => {
    return handler(e, ...args)
  })
}

const ipcSend = (chan, data) => {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send(chan, data)
    }
  })
}

module.exports = {
  ipcHandler,
  ipcSend,
}