var fs = require('fs-extra')
var path = require('path')
var util = require(__dirname + '/util')

module.exports = function (argv) {

  if (argv.all) {

    var dialectsDir = process.cwd() + '/dialects'

    if (!fs.existsSync(dialectsDir)) {
      return console.log('\n Nothing to sync\n')
    }

    var tribes = fs.readdirSync(dialectsDir)
    tribes.forEach(function (tribe) {
      var tribeDialectsDir = dialectsDir + '/' + tribe
      var localities = fs.readdirSync(tribeDialectsDir)
      localities.forEach(function (locality) {
        syncDialect(tribe, locality)
      })
    })

  } else if (argv._.length === 2) {

    var localityPath = argv._[1]
    var temp = localityPath.split('/')

    if (temp.length === 2) {

      var tribe = temp[0].toLowerCase()
      var locality = temp[1].toLowerCase()
      var localityDir = path.join('dialects', tribe, locality)

      if (fs.existsSync(localityDir)) {
        syncDialect(tribe, locality)
      } else {
        util.errors.notFound(localityPath)
      }

    }
    else {
      util.errors.invalidFormat('sync')
    }

  } else {
    util.errors.invalidFormat('sync')
  }

}

function syncDialect(tribe, locality) {

  var localityPath = path.join(tribe, locality)

  Object.keys(util.constructs).forEach(function (concept) {
    var currentConceptsDir = process.cwd() + '/concepts/' + concept
    syncConcept(currentConceptsDir, tribe, locality)
  })

}

function syncConcept(currentConceptsDir, tribe, locality) {
  var files = fs.readdirSync(currentConceptsDir)
  files.forEach(function (file) {

    // if this file is not to be ignored
    if (util.ignore.indexOf(file) === -1) {

      var currentFilePath = currentConceptsDir + '/' + file
      var stat = fs.statSync(currentFilePath);
      if (stat.isDirectory()) {
        return syncConcept(currentFilePath, tribe, locality)
      }
      else {
        console.log(currentFilePath)
      }

    }
  })
}
