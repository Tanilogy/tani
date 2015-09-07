var fs = require('fs-extra')
var c = require('chalk')

module.exports = function (argv) {

  var path = argv._[1]
  var temp = path.split('/')

  if (path === 'all') {
    var dialectsDir = process.cwd() + '/dialects'
    var queriesDir = process.cwd() + '/system/queries'
    fs.removeSync(dialectsDir)
    fs.removeSync(queriesDir)
    return
  }

  if (temp.length === 2 || argv.force) {

    var tribe = temp[0].toLowerCase()
    var locality = temp[1] ? temp[1].toLowerCase() : undefined

    // query files for the tribe
    var tribeDir = process.cwd() + '/system/queries/' + tribe
    var tribeDirIndex = process.cwd() + '/system/queries/' + tribe + '/index.acf'
    // where dialect files reside
    var localityDialectsDir = process.cwd() + '/dialects/' + path
    // where query files reside
    var localityQueriesDir = process.cwd() + '/system/queries/' + path

    if (fs.existsSync(localityDialectsDir)) {

      fs.removeSync(localityDialectsDir)
      fs.removeSync(localityQueriesDir)

      if (locality) {
        var indexFileContent = fs.readFileSync(tribeDirIndex).toString()
        var includeString = 'include '+ locality +'/index.acf\n'
        var updatedIndexFileContent = indexFileContent.replace(includeString, '')
        fs.writeFileSync(tribeDirIndex, updatedIndexFileContent)        
      }

      // console.log(c.bold('\n %s') + ' deleted\n', path)
    } else {
      return console.log(c.bold('\n %s') + c.red(' does not exists\n'), path)
    }

  } else {
    console.log(c.red('\n Invalid format\n'))
    console.log(' Use the format ' + c.bold('tani delete <tribe/locality>'))
    console.log(' Ex: tani delete adi/geling\n')
  }

}
