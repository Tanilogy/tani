var fs = require('fs-extra')
var c = require('chalk')
var path = require('path')

module.exports = function (argv) {

  if (argv.all) {
    var dialectsDir = process.cwd() + '/dialects'
    var queriesDir = process.cwd() + '/queries'
    fs.removeSync(dialectsDir)
    fs.removeSync(queriesDir)
    return
  }

  if (argv.queries) {
    var queriesDir = process.cwd() + '/queries'
    fs.removeSync(queriesDir)
    return
  }

  var param = argv._[1]
  var temp = param.split('/')

  if (temp.length > 0) {

    // blanket
    if (temp.length === 1) {
      var tribe = temp[0].toLowerCase()
      var tribeDir = process.cwd() + '/dialects/' + tribe
      if (fs.existsSync(tribeDir)) {

        var dialectDir = process.cwd() + '/dialects/' + tribe
        var queryDir = process.cwd() + '/queries/' + tribe
        fs.removeSync(dialectDir)
        fs.removeSync(queryDir)

        var tribeIndex = process.cwd() + '/queries/index.acf'
        var indexFileContent = fs.readFileSync(tribeIndex).toString()
        var includeString = 'include '+ tribe +'/index.acf\n'
        var updatedIndexFileContent = indexFileContent.replace(includeString, '')
        fs.writeFileSync(tribeIndex, updatedIndexFileContent)

      }
      else {
        return console.log(c.bold('\n %s') + c.red(' does not exists\n'), param)
      }
    }
    // singular entity
    else {
      var tribe = temp[0].toLowerCase()
      var locality = temp[1] ? temp[1].toLowerCase() : undefined
      removeEntry(tribe, locality)
    }

  } else {
    console.log(c.red('\n Invalid format\n'))
    console.log(' Use the format ' + c.bold('tani delete <tribe/locality>'))
    console.log(' Ex: tani delete adi/geling\n')
  }

}

function removeEntry(tribe, locality) {

  var localityPath = path.join(tribe, locality)
  // query files for the tribe
  var tribeDir = process.cwd() + '/queries/' + tribe
  var tribeDirIndex = process.cwd() + '/queries/' + tribe + '/index.acf'
  // where dialect files reside
  var localityDialectsDir = process.cwd() + '/dialects/' + localityPath
  // where query files reside
  var localityQueriesDir = process.cwd() + '/queries/' + localityPath

  if (fs.existsSync(localityDialectsDir)) {

    fs.removeSync(localityDialectsDir)
    fs.removeSync(localityQueriesDir)

    var indexFileContent = fs.readFileSync(tribeDirIndex).toString()
    var includeString = 'include '+ locality +'/index.acf\n'
    var updatedIndexFileContent = indexFileContent.replace(includeString, '')
    fs.writeFileSync(tribeDirIndex, updatedIndexFileContent)        

    // console.log(c.bold('\n %s') + ' deleted\n', path)
  } else {
    return console.log(c.bold('\n %s') + c.red(' does not exists\n'), localityPath)
  }

}
