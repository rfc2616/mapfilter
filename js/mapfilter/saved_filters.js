'use strict'

var SavedFilter = require('./saved_filter.js')

module.exports = require('backbone').Collection.extend({

  url: '/filters',

  model: SavedFilter,

  defaults: {
    name: 'New Filter',
    value: {}
  }


})
