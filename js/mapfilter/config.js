'use strict'

module.exports = require('backbone').Model.extend({

  url: './json/mapfilter-config.json',

  defaults: {
    canSaveFilters: false,
    dataUrl: '/json/Monitoring.json'
  }


})
