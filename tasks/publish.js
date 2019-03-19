'use strict'
const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')
const { publish } = require('libnpmpublish')

const projectRootDirectory = path.join(__dirname, '..')

;(async () => {
  // publish core package
  const corePkgName = childProcess.execSync(`npm pack`, { cwd: path.join(projectRootDirectory, 'packages', 'core') }).toString('utf-8').trim()
  const corePkg = require('../packages/core/package.json')
  const coreTarball = fs.createReadStream(path.join(projectRootDirectory, 'packages', 'core', corePkgName))
  await publish(corePkg, coreTarball, {
    token: process.env.NPM_AUTH_TOKEN
  })
  // publish main package
  const mainPkgName = childProcess.execSync(`npm pack`, { cwd: path.join(projectRootDirectory, 'packages', 'main') }).toString('utf-8').trim()
  const mainPkg = require('../packages/main/package.json')
  const mainTarball = fs.createReadStream(path.join(projectRootDirectory, mainPkgName))
  await publish(mainPkg, mainTarball, {
    token: process.env.NPM_AUTH_TOKEN
  })
})()
