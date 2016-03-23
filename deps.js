'use strict'

// This module is one way of exposing subdependencies to dependent modules
// Modules are still `require`d on demand

const _ = require('lodash')
const fs = require('fs')
const path = require('path')

const modulePath = path.resolve(__dirname, 'node_modules')
fs.readdirSync(modulePath)
  .map(subDir => path.resolve(modulePath, subDir))
  .filter(file => fs.statSync(file).isDirectory() && fs.existsSync(path.resolve(file, 'package.json')))
  .forEach(moduleDir => {
    const moduleName = path.basename(moduleDir)
    Object.defineProperty(
        module.exports,
        moduleName,
        {
          get: () => require(moduleName)
        })
  })
