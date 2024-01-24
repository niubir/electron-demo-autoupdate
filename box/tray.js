const { Tray, Menu, app } = require('electron')
const { showMainWindow } = require('./window')
const { name } = require('./package.json')
const { staticPathJoin } = require('./util')

let tray = null

const initTray = async () => {
  tray = new Tray(staticPathJoin('logo.png'))
  tray.setTitle(name)
  tray.setToolTip(name)
  tray.setContextMenu(Menu.buildFromTemplate([
    {label: '退出', type: 'normal', click: () => {
      app.quit()
    }},
  ]))
  tray.on('click', () => {
    showMainWindow()
  })
}

module.exports = {
  initTray,
}