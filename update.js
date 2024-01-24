const { arch } = require('os')
const { ipcMain, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')
const { staticPathJoin } = require('./util')
const { ipcSend } = require('./ipc')

const updaterWindowPreloadFile = staticPathJoin('preload.js')
const updaterWindowLoadFile = staticPathJoin('updater.html')

// const feedURLMap = {
//   win32: {
//     x64: 'http://localhost:20001/update/win32/x64',
//     arm64: 'http://localhost:20001/update/win32/arm64',
//   },
//   darwin: {
//     x64: 'http://localhost:20001/update/darwin/x64',
//     arm64: 'http://localhost:20001/update/darwin/arm64',
//   },
// }
const feedURLMap = {
  win32: 'http://localhost:20001/update/win32',
  darwin: 'http://localhost:20001/update/darwin',
}

// const feedURL = feedURLMap[process.platform][arch()]
const feedURL = feedURLMap[process.platform]

console.info('update feed url:', feedURL)

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
  autoUpdater.on('error', (err) => {
    syncUpdateMsg('error: ' + JSON.stringify(err))
  })
  autoUpdater.on('checking-for-update', (data) => {
    syncUpdateMsg('checking-for-update: ' + JSON.stringify(data))
  })
  autoUpdater.on('update-available', (data) => {
    syncUpdateMsg('update-available: ' + JSON.stringify(data))
  })
  autoUpdater.on('update-not-available', (data) => {
    syncUpdateMsg('update-not-available: ' + JSON.stringify(data))
  })
  // 更新下载进度事件
  autoUpdater.on('download-progress', function(data) {
    syncUpdateMsg('update-not-available: ' + JSON.stringify(data))
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
  // updaterWindow.webContents.openDevTools()
}

module.exports = {
  syncAutoUpdate,
}