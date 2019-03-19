'use strict'
const childProcess = require('child_process')
const path = require('path')
const fs = require('fs')
const log = require('bestikk-log')
const execModule = require('./exec')

const prepareRelease = (releaseVersion) => {
  log.task(`Release version: ${releaseVersion}`)
  if (process.env.DRY_RUN) {
    log.warn('Dry run! To perform the release, run the command again without DRY_RUN environment variable')
  } else {
    const projectRootDirectory = path.join(__dirname, '..', '..')
    try {
      childProcess.execSync(`git diff-index --quiet HEAD --`, { cwd: projectRootDirectory })
    } catch (e) {
      log.error('Git working directory not clean')
      const status = childProcess.execSync(`git status -s`)
      process.stdout.write(status)
      process.exit(1)
    }
    // update main package version and dependencies
    const mainPackage = require('../../packages/main/package.json')
    mainPackage.version = releaseVersion
    mainPackage.dependencies['demo-npm-meta-package-core'] = releaseVersion
    const mainPackageFilePath = path.join(projectRootDirectory, 'packages', 'main', 'package.json')
    fs.writeFileSync(mainPackageFilePath, JSON.stringify(mainPackage, null, 2).concat('\n'))
    // update core package version
    const corePackage = require('../../packages/core/package.json')
    corePackage.version = releaseVersion
    const corePackageFilePath = path.join(projectRootDirectory, 'packages', 'core', 'package.json')
    fs.writeFileSync(corePackageFilePath, JSON.stringify(corePackage, null, 2).concat('\n'))
    // git commit and tag
    childProcess.execSync(`git commit -a -m "${releaseVersion}"`, { cwd: projectRootDirectory })
    childProcess.execSync(`git tag v${releaseVersion} -m "${releaseVersion}"`, { cwd: projectRootDirectory })
  }
}

const pushRelease = () => {
  const remoteName = childProcess.execSync('git remote -v').toString('utf8')
    .split(/\r?\n/)
    .filter(line => { return line.includes('(push)') && line.includes('asciidoctor/asciidoctor.js.git')})
    .map(line => line.split('\t')[0])
    .reduce((a, b) => a + b, '')

  if (remoteName) {
    execModule.execSync(`git push ${remoteName} master`)
    execModule.execSync(`git push ${remoteName} --tags`)
    return true
  }
  log.warn('Unable to find the remote name of the original repository asciidoctor/asciidoctor.js')
  return false
}

const completeRelease = (releasePushed, releaseVersion) => {
  log.info('')
  log.info('To complete the release, you need to:')
  if (!releasePushed) {
    log.info('[ ] push changes upstream: `git push origin master && git push origin --tags`')
  }
  log.info(`[ ] edit the release page on GitHub: https://github.com/asciidoctor/asciidoctor.js/releases/tag/v${releaseVersion}`)
}

const release = (releaseVersion) => {
  const start = process.hrtime()
  prepareRelease(releaseVersion)
  //const releasePushed = pushRelease()
  const releasePushed = false
  completeRelease(releasePushed, releaseVersion)
  log.success(`Done in ${process.hrtime(start)[0]} s`)
}

module.exports = {
  release: release,
  // for testing purpose
  pushRelease: pushRelease
}
