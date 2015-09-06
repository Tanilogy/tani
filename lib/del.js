var fs = require('fs-extra')
var c = require('chalk')

module.exports = function (argv) {

  var path = argv._[1]
  var temp = path.split('/')
  if (temp.length === 2 || argv.force) {

    var constructsDir = process.cwd() + '/constructs'
    var localityPath

    if (fs.existsSync(constructsDir)) localityPath = 'dialects/' + path
    else localityPath = path

    if (fs.existsSync(localityPath)) {
      fs.removeSync(localityPath)
      console.log(c.bold('\n %s') + ' deleted\n', path)
    } else {
      return console.log(c.bold('\n %s') + c.red(' does not exists\n'), path)
    }

  } else {
    console.log(c.red('\n Invalid format'))
    console.log(' Use the format ' + c.bold('tani delete <tribe/locality>'))
    console.log(' Ex: tani delete adi/geling\n')
  }

}
