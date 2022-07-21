const { dirname, relative } = require('path')
const beautify = require('beautify')
const simpleGit = require('simple-git')
const hash = require('object-hash')
const { FsConnector } = require('unifile');
const jsondiffpatch = require('jsondiffpatch').create({
  objectHash: function(obj) {
    return obj.id || hash(obj);
  },
  arrays: {
    detectMove: false,
  },
})

const { JSDOM } = require("jsdom")

const diff = require("virtual-dom/diff")
const patch = require("virtual-dom/patch")

const parser = require('vdom-parser')
console.error('FIXME: this parser removes comments, and some of them are essential to Silex')
// This does not work, patch is always empty:
// const parser = require('html2hscript')
// async function parseDom(dom) {
//   return new Promise((resolve, reject) => {
//     parser(dom.window.document.documentElement, function(err, hscript) {
//       if(err) {
//         console.error('PARSING ERROR', err)
//         reject(err)
//       } else {
//         console.log('success', hscript, typeof hscript)
//         resolve(hscript)
//       }
//     })
//   })
// }

/**
 * Service connector extends the local filesystem connector (unifile-fs)
 * The root URL will depend on the user name, i.e. in ${ rootUrl }/${ session.user }/
 */
class GitService extends FsConnector {
  static async diffDom(dom1, dom2) {
    const hscript1 = parser(dom1.window.document.documentElement)
    const hscript2 = parser(dom2.window.document.documentElement)
    var patches = diff(hscript1, hscript2)
    return patches
  }

  static async patchDom(dom, patches) {
    patch(dom.window.document.documentElement, patches)
  }


  // **
  // extend Fs service
  constructor(config) {
    super(config);
    // change fs infos
    this.name = 'git-service';
    this.infos.name = 'git-service';
    this.infos.displayName = 'Git Service';
    this.infos.description = 'This is a custom service to enable multi-user editing';
  }

  async getGitFiles({ path, oldRevparse, session }) {
    const dir = dirname(path)
    const revparse = await simpleGit(dir).revparse('HEAD')
    const rootDir = await simpleGit(dir).revparse('--show-toplevel')
    const relPath = relative(rootDir, path)
    const oldData = await simpleGit(dir).show(`${oldRevparse}:${relPath}`)
    const currentData = (await super.readFile(session, path)).toString()
    return [oldData, currentData]
  }

  // **
  //Filesystem commands: prepend the user to all paths
  // readdir(session, path) {
  //   return super.readdir(session, `/tmp/${ session.user }/${ path }`)
  // }
  async writeFile(session, path, data) {
    if(path.endsWith('.html')) {
      // Parse the data to save
      const dom = new JSDOM(data)
      const { window } = dom
      const { document } = window
      // Get the version on which this data was based
      const oldRevparse = document.documentElement.getAttribute('revparse')
      // Remove the version from the data
      document.documentElement.removeAttribute('revparse')
      // Get the data to diff and patch
      const [oldData, currentData] = await this.getGitFiles({ path, oldRevparse, session })
      console.log({oldRevparse})
      // Diff
      const oldDom = new JSDOM(oldData)
      const delta = await GitService.diffDom(oldDom, dom)
      // Patch
      const currentDom = new JSDOM(currentData)
      await GitService.patchDom(currentDom, delta)
      // Beautify scripts and styles
      Array.from(currentDom.window.document.querySelectorAll('script:not([src])'))
        .forEach(el => {
          el.innerHTML = beautify(el.innerHTML, { format: 'js' })
        })
      Array.from(currentDom.window.document.querySelectorAll('style'))
        .forEach(el => {
          el.textContent = beautify(el.textContent, { format: 'css' })
        })
      // Final write
      return super.writeFile(session, path, beautify(currentDom.serialize(), { format: 'html'}))
    } else if(path.endsWith('.html.json')) {
      // Parse the data to save
      const newData = JSON.parse(data)
      // Get the version on which this data was based
      const oldRevparse = newData.site.revparse
      // Remove the version from the data
      delete newData.site.revparse
      // Get the data to diff and patch
      const [oldData, currentData] = await this.getGitFiles({ path, oldRevparse, session })
      // Diff
      const delta = jsondiffpatch.diff(JSON.parse(oldData), newData)
      // Patch
      const finalData = jsondiffpatch.patch(JSON.parse(currentData), delta)
      // Final write
      return super.writeFile(session, path, beautify(JSON.stringify(finalData), { format: 'json'}))
    }
    return super.writeFile(session, path, data)
  }
  async readFile(session, path) {
    const dir = '/' + dirname(path)
    const revparse = await simpleGit(dir).revparse('HEAD')
    const data = (await super.readFile(session, path)).toString()
    if(path.endsWith('.html')) {
      const dom = new JSDOM(data)
      dom.window.document.documentElement.setAttribute('revparse', revparse)
      return dom.serialize()
    } else if(path.endsWith('.html.json')) {
      const newData = JSON.parse(data.toString())
      return JSON.stringify({
        ...newData,
        site: {
          ...newData.site,
          revparse,
        },
      })
    }
    return data
  }
  // stat(session, path) {
  //   return super.stat(session, `/tmp/${ session.user }/${ path }`)
  // }
  // mkdir(session, path) {
  //   return super.mkdir(session, `/tmp/${ session.user }/${ path }`)
  // }
  // createWriteStream(session, path) {
  //   return super.createWriteStream(session, `/tmp/${ session.user }/${ path }`)
  // }
  // createReadStream(session, path) {
  //   return super.createReadStream(session, `/tmp/${ session.user }/${ path }`)
  // }
  // rename(session, src, dest) {
  //   return super.rename(session, src, dest)
  // }
  // unlink(session, path) {
  //   return super.unlink(session, `/tmp/${ session.user }/${ path }`)
  // }
  // rmdir(session, path) {
  //   return super.rmdir(session, `/tmp/${ session.user }/${ path }`)
  // }
  // batch(session, actions, message) {
  //   return super.batch(session, actions, message)
  // }
}
// export for use in index.js
module.exports = GitService;
