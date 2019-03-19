'use strict'
const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')
const { publish } = require('libnpmpublish')

const projectRootDirectory = path.join(__dirname, '..')

;(async () => {
  try {
    // publish core package
    const coreDirectory = path.join(projectRootDirectory, 'packages', 'core')
    const corePkgName = childProcess.execSync(`npm pack`, { cwd: coreDirectory }).toString('utf-8').trim()
    const corePkg = require('../packages/core/package.json')
    const coreTarball = fs.createReadStream(path.join(coreDirectory, corePkgName))
    await publish(corePkg, coreTarball, {
      token: process.env.NPM_AUTH_TOKEN
    })
    // publish main package
    const mainDirectory = path.join(projectRootDirectory, 'packages', 'main')
    const mainPkgName = childProcess.execSync(`npm pack`, { cwd: mainDirectory }).toString('utf-8').trim()
    const mainPkg = require('../packages/main/package.json')
    const mainTarball = fs.createReadStream(path.join(mainDirectory, mainPkgName))
    await publish(mainPkg, mainTarball, {
      token: process.env.NPM_AUTH_TOKEN
    })
  } catch (e) {
    console.log('Unable to publish the packages', e)
    process.exit(1)
  }
})()
