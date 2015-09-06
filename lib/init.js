var fs = require('fs-extra')
var c = require('chalk')
var util = require(__dirname + '/util')

module.exports = function (argv) {

  var path = argv._[1]
  var temp = path.split('/')
  if (temp.length === 2) {

    var tribe = temp[0].toLowerCase()
    var locality = temp[1].toLowerCase()

    var constructsDir = process.cwd() + '/constructs'
    var constructsDirExists = fs.existsSync(constructsDir)

    var localityPath
    if (constructsDirExists) localityPath = 'dialects/' + path
    else localityPath = path

    if (fs.existsSync(localityPath)) {
      return console.log(c.bold('\n %s') + ' already exists\n', path)
    }

    // from command
    if (argv._.indexOf('from') === 2 && argv._.length === 4) {

      var from = argv._[3]
      if (path === from) {
        return console.log('\n Cannot initialize ' + c.bold('%s') + ' from itself\n', path)
      }
      if (fs.existsSync(from)) {
        fs.copySync(from, localityPath)
      } else {
        return console.log(c.bold('\n %s') + c.red(' does not exists\n'), from)
      }

      console.log(c.bold('\n %s') + ' initialized from ' + c.bold('%s\n'), path, from)

    // normal initialization
    } else {

      var tribePath

      if (constructsDirExists) {
        tribePath = process.cwd() + '/dialects/' + tribe
      } else {
        tribePath = process.cwd() + '/' + tribe
      }

      var tribeIndexFile = tribePath + '/index.acf'

      if (fs.existsSync(tribeIndexFile)) {
        fs.appendFileSync(tribeIndexFile, 'include ' + locality + '/index.acf\n')
      } else {
        fs.createFileSync(tribeIndexFile)
        fs.appendFileSync(tribeIndexFile, 'var tribe = ' + tribe.capitalize() + '\n\n')
        fs.appendFileSync(tribeIndexFile, 'include ' + locality + '/index.acf\n')
      }

      fs.mkdirsSync(localityPath)

      var localityIndex = localityPath + '/index.acf'
      
      // locality headers
      var localityObject = "var locality = { name: '"+ locality.capitalize() +"', lat: 0, long: 0, script: 'default' }\n\n"
      fs.appendFileSync(localityIndex, localityObject)
      fs.appendFileSync(localityIndex, "CREATE (n:Locality %locality%)\n\n")

      util.constructs.forEach(function (construct) {

        var constructPath = localityPath + '/' + construct
        var constructEntries = constructPath + '/entries'
        var constructIndex = constructPath + '/index.acf'

        fs.mkdirsSync(constructPath)
        fs.mkdirsSync(constructEntries)
        fs.createFileSync(constructIndex)

        fs.appendFileSync(localityIndex, 'include ' + construct + '/index.acf\n')

        if (constructsDirExists) {

          var files = fs.readdirSync(constructsDir + '/'+ construct +'/' + 'entries')
          files.forEach(function (file) {
            var filePath = localityPath + '/' + construct + '/entries/' + file 
            fs.createFileSync(filePath)
            var includeString = 'include entries/' + file + '\n'
            fs.appendFileSync(constructIndex, includeString)
          })

        }

      })

      console.log(c.bold('\n %s') + ' initialized\n', path)

    }
  } else {
    console.log(c.red('\n Invalid format'))
    console.log(' Use the format ' + c.bold('tani init <tribe/locality>'))
    console.log(' Ex: tani init adi/geling\n')
  }

}
