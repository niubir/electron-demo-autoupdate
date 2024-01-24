const path = require('path')

const isProduction = () => {
  return __dirname.split(path.sep).indexOf("app.asar") >= 0
}

const staticPathJoin = (...args) => {
  let dir = ''
  if (isProduction()) {
    dir = path.join(process.resourcesPath, 'static')
  } else {
    dir = path.join(__dirname, 'static')
  }
  return path.join(dir, ...args)
}

const nodeModulesPathJoin = (...args) => {
  const dir = path.join(__dirname, 'node_modules')
  return path.join(dir, ...args)
}

module.exports = {
  isProduction,
  staticPathJoin,
  nodeModulesPathJoin,
}