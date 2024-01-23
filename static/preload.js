const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  Version: () => invoke('Version'),
  UpdateMessageListen: (cb) => on('UpdateMessageListen', cb),
})

const on = (chan, cb) => {
  ipcRenderer.on(chan, (e, ...args) => {
    log(`On(${chan})`, args)
    cb(args[0])
  })
}

const invoke = (chan, ...args) => {
  log(`Invoke(${chan}) Req`, args)
  return new Promise((resolve, reject) => {
    ipcRenderer.invoke(chan, ...args).then((data) => {
      log(`Invoke(${chan}) Resp`, data)
      resolve(data)
    }).catch(err=>{
      error(`Invoke(${chan}) Error`, err)
      err = err + ''
      err = err.replace('Error: Error invoking remote method \''+chan+'\': ', '')
      reject(err)
    })
  })
}

const log = (msg, data) => {
  // console.info(`[${new Date}] api ${msg}`, data)
}

const error = (msg, err) => {
  console.error(`[${new Date}] api ${msg}`, err)
}