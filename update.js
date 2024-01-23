const { ipcMain, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')
const { staticPathJoin } = require('./util')
const { ipcSend } = require('./ipc')

const updaterWindowPreloadFile = staticPathJoin('preload.js')
const updaterWindowLoadFile = staticPathJoin('updater.html')

let feedURL = null
switch (process.platform) {
  case 'win32':
    feedURL = 'http://localhost:20001/update/windows'
    break
  case 'darwin':
    feedURL = 'http://localhost:20001/update/macos'
    break
}

const syncAutoUpdate = async () => {
  checkUpdate()
}

const syncUpdateMsg = async (msg) => {
  ipcSend('UpdateMessageListen', msg)
}

const checkUpdate = async () => {
  showUpdaterWindow()

  // 配置安装包远端服务器
  autoUpdater.setFeedURL(feedURL)
 
	// 下面是自动更新的整个生命周期所发生的事件
  autoUpdater.on('error', (msg) => {
    syncUpdateMsg('error: ' + msg)
  })
  autoUpdater.on('checking-for-update', (msg) => {
    syncUpdateMsg('checking-for-update: ' + msg)
  })
  autoUpdater.on('update-available', (msg) => {
    syncUpdateMsg('update-available: ' + msg)
  })
  autoUpdater.on('update-not-available', (msg) => {
    syncUpdateMsg('update-not-available: ' + msg)
  })
  // 更新下载进度事件
  autoUpdater.on('download-progress', function(obj) {
    syncUpdateMsg('update-not-available: ' + JSON.stringify(obj))
  })
  // 更新下载完成事件
  autoUpdater.on('update-downloaded', function(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    syncUpdateMsg('update-downloaded: ' + JSON.stringify({
      event,
      releaseNotes,
      releaseName,
      releaseDate,
      updateUrl,
      quitAndUpdate,
    }))
    // ipcMain.on('updateNow', (e, arg) => {
    //   autoUpdater.quitAndInstall()
    // })
  })

  // 执行自动更新检查
  autoUpdater.checkForUpdates()
  syncUpdateMsg('check-for-updates')
  syncUpdateMsg('feed-url: ' + feedURL)
}

const showUpdaterWindow = async () => {
  const updaterWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: updaterWindowPreloadFile
    }
  })

  updaterWindow.loadFile(updaterWindowLoadFile)
  updaterWindow.webContents.openDevTools()
}

module.exports = {
  syncAutoUpdate,
}