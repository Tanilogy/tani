var exec = require('child_process').exec

module.exports = function status() {

  exec('git status', function(error, stdout, stderr) {
    if (error) return console.log(error)
    var statusString = stdout
    console.log('\n' + statusString)
  })

}
