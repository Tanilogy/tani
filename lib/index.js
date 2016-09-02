var add = require(__dirname + '/add')
var del = require(__dirname + '/delete')
var init = require(__dirname + '/init')
var uninit = require(__dirname + '/uninit')
var consolidate = require(__dirname + '/consolidate')
var help = require(__dirname + '/help')
var compile = require(__dirname + '/compile')
var sync = require(__dirname + '/sync')
var publish = require(__dirname + '/publish')
var unpublish = require(__dirname + '/unpublish')
var move = require(__dirname + '/move')
var search = require(__dirname + '/search')
var status = require(__dirname + '/status')

module.exports = {
  help: help,
  add: add,
  delete: del,
  init: init,
  uninit: uninit,
  consolidate: consolidate,
  compile: compile,
  sync: sync,
  publish: publish,
  unpublish: unpublish,
  move: move,
  search: search,
  status: status
}
