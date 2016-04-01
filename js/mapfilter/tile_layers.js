'use strict'

var TileLayer = require('./tile_layer.js')

module.exports = require('backbone').Collection.extend({

  url: '/tileLayers',

  model: TileLayer,

  defaults: {
    name: 'Custom Tiles'
  }

})
