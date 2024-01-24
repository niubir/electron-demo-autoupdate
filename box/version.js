const { app, BrowserWindow } = require('electron')
const { autoUpdater } = require('electron-updater')
const { isProduction, staticPathJoin } = require('./util')
const { ipcHandler, ipcSend } = require('./ipc')
const { showMainWindow } = require('./window')
const { version: localVersion , build: { publish } } = require('./package.json')

const preloadFile = staticPathJoin('preload.js')
const updaterWindowLoadFile = staticPathJoin('updater/index.html')
const updaterWindowLoadURL = 'http://127.0.0.1:10001'
const devUpdateConfigPath = staticPathJoin('app-update-dev.yml')
const iconFile = staticPathJoin('logo.png')
//  最新
const STATUS_LATEST = 'LATEST'
//  过时
const STATUS_OUTDATED = 'OUTDATED'
//  下载中
const STATUS_DOWNLOADING = 'DOWNLOADING'
//  下载完成
const STATUS_DOWNLOADED = 'DOWNLOADED'
//  安装中
const STATUS_INSTALLING = 'INSTALLING'
//  安装完成
const STATUS_INSTALLED = 'INSTALLED'
//  错误
const STATUS_ERROR = 'ERROR'

let feedURL = null
try {feedURL = publish[0].url}catch(err) {}

let version = {
  local: localVersion,
  server: null,
  isLatest: true,
  isForce: false,
  status: STATUS_LATEST,

  status_error: null,
  status_downloading: null,
}
let updaterWindow = null

// ***************** window *****************
const createUpdaterWindow = () => {
  showMainWindow((mainWindow)=>{
    updaterWindow = new BrowserWindow({
      parent: mainWindow,
      modal: true,
      width: 400,
      height: 200,
      icon: iconFile,
      webPreferences: {
        preload: preloadFile,
      }
    })
    if (isProduction()) {
      updaterWindow.loadFile(updaterWindowLoadFile)
    } else {
      updaterWindow.loadURL(updaterWindowLoadURL)
      updaterWindow.webContents.openDevTools()
    }
  })
}
const isDestroyedUpdaterWindow = () => {
  return !updaterWindow || updaterWindow.isDestroyed()
}
const showUpdaterWindow = (afterDo) => {
  if (isDestroyedUpdaterWindow()) {
    createUpdaterWindow()
  } else {
    updaterWindow.show()
  }
  if (afterDo) {
    afterDo(updaterWindow)
  }
}
const hideUpdaterWindow = () => {
  if (isDestroyedUpdaterWindow()) {
    updaterWindow.hide()
  }
}
// ***************** window *****************

// ***************** auto update *****************
const autoUpdateLog = (event, data) => {
  if (data) {
    console.info(`[AUTO UPDATE][${event}]`, data)
  } else {
    console.info(`[AUTO UPDATE][${event}]`)
  }
}

const initAutoUpdateIPC = () => {
  ipcHandler('VersionDownload', () => {
    return autoUpdateDownload()
  })
}

const syncDownloadProgress = (data) => {
  ipcSend('ListenVersionDownloadProgress', data)
}

const initAutoUpdate = () => {
  if (!isProduction()) {
    Object.defineProperty(app, 'isPackaged', {
      get() {
        return true
      }
    })

    autoUpdater.updateConfigPath = devUpdateConfigPath
  }

  if (!feedURL) {
    return
  }

  initAutoUpdateIPC()

  autoUpdater.setFeedURL(feedURL)
  autoUpdater.requestHeaders = {
    Platform: process.platform,
    Arch: process.arch,
    Version: localVersion,
  }
  // 是否自动更新
  autoUpdater.autoDownload = false
  // 应用退出后自动安装
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('error', (err) => {
    autoUpdateLog('ERROR', err)
    setVersionStatus(STATUS_ERROR, err)
  })
  autoUpdater.on('checking-for-update', (data) => {
    autoUpdateLog('CHECKING_FOR_UPDATE', data)
  })
  autoUpdater.on('update-available', (data) => {
    autoUpdateLog('UPDATE_AVAILABLE', data)
    setVersion(data.version, data.isLatest, data.isForce, showUpdaterWindow)
  })
  autoUpdater.on('update-not-available', (data) => {
    autoUpdateLog('UPDATE_NOT_AVAILABLE', data)
    setVersion(data.version, data.isLatest, data.isForce, showUpdaterWindow)
  })
  autoUpdater.on('download-progress', function(data) {
    autoUpdateLog('DOWNLOAD_PROGRESS', data)
    syncDownloadProgress(data)
  })
  autoUpdater.on('update-downloaded', function(data) {
    autoUpdateLog('UPDATE_DOWNLOADED', data)
    setVersionStatus(STATUS_DOWNLOADED)
  })
  autoUpdater.checkForUpdates()

  // 退出并更新
  // TODO
  // autoUpdater.quitAndInstall()
}

const autoUpdateDownload = () => {
  autoUpdater.downloadUpdate()
}
// ***************** auto update *****************

// ***************** version *****************
const initVersionIPC = () => {
  ipcHandler('Version', () => {
    return {
      local: version.local,
      server: version.server,
      isLatest: version.isLatest,
      isForce: version.isForce,
      status: version.status,
    }
  })
}

const syncVersion = () => {
  ipcSend('ListenVersion', {
    local: version.local,
    server: version.server,
    isLatest: version.isLatest,
    isForce: version.isForce,
    status: version.status,
  })
}

const setVersion = (server, isLatest, isForce, outdatedDo) => {
  version.server = server
  version.isLatest = isLatest
  version.isForce = isForce
  if (isLatest) {
    version.status = STATUS_LATEST
  } else {
    version.status = STATUS_OUTDATED
  }

  if (version.status == STATUS_OUTDATED && outdatedDo) {
    outdatedDo()
  }

  syncVersion()
}

const setVersionStatus = (status, data) => {
  version.status = status
  // TODO data
  syncVersion()
}
// ***************** version *****************


const initVersion = () => {
  return new Promise((resolve, reject) => {
    resolve()
    initVersionIPC()
    initAutoUpdate()
  })
}

module.exports = {
  initVersion,
}