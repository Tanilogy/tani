var init = require(__dirname + '/init')
var consolidate = require(__dirname + '/consolidate')
var reset = require(__dirname + '/reset')
var del = require(__dirname + '/del')
var help = require(__dirname + '/help')
var compile = require(__dirname + '/compile')
var sync = require(__dirname + '/sync')
var publish = require(__dirname + '/publish')

module.exports = {
  init: init,
  consolidate: consolidate,
  reset: reset,
  del: del,
  help: help,
  compile: compile,
  sync: sync,
  publish: publish
}
