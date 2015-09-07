var fs = require('fs-extra')
var c = require('chalk')

module.exports = function (argv) {

  var path = argv._[1]
  var temp = path.split('/')
  if (temp.length === 2) {

    var conceptID = conceptFileContent.split(' ')[1]

            // include the query files in the index file
            //var queryFilePath = localityQueriesDir + '/' + construct + '/entries/' + file
            //fs.createFileSync(queryFilePath)
            //var includeString = 'include entries/' + file + '\n'
            //fs.appendFileSync(constructIndex, includeString)

  } else {
    console.log(c.red('\n Invalid format'))
    console.log(' Use the format ' + c.bold('tani compile <tribe/locality>'))
    console.log(' Ex: tani compile adi/geling\n')
  }

}
