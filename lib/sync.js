var fs = require('fs-extra')
var path = require('path')
var util = require(__dirname + '/util')

module.exports = function (argv) {

  if (argv.all) {

    var dialectsDir = process.cwd() + '/dialects'

    if (!fs.existsSync(dialectsDir)) {
      return console.log('\n Nothing to compile\n')
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
  console.log(localityPath)
}
