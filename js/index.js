'use strict'

// globally self-installing deps
require('./lib/locale.js')
require('./lib/leaflet-0.7.7.js')
require('./lib/bing_layer.js')
require('./lib/d3.v4.js')
require('./lib/d3-dates.v4.js')

var $ = require('jquery')

// app
window.locale.en = require('../data/en')
window.locale.fr = require('../data/fr')
window.locale.es = require('../data/es')
window.locale.init();

var mapFilter = require('./mapfilter/mapfilter.js')

var hostname = window.location.hostname

window.app = mapFilter({
  // target for monitoring data
  url: '/json/Monitoring.json',

  // app container
  el: $('#app'),

  // An array of filters to explore the data.
  // `field` is the field/attribute to filter by
  // `type` should be `discrete` for string data and `continuous` for numbers or dates
  // `expanded` sets whether the filter view is expanded or collapsed by default
  filters: [{
    type: 'continuous',
    field: 'today',
    expanded: true
  }, {
    type: 'discrete',
    field: 'happening',
    expanded: true
  }, {
    type: 'discrete',
    field: 'people',
    expanded: true
  }],

  // Template to generate maptile urls. See http://leafletjs.com/reference.html#url-template
  tileUrl: '/monitoring-files/Maps/Tiles/{z}/{x}/{y}.png',
  // tileUrl: 'http://localhost:20008/tile/wapichana_background/{z}/{x}/{y}.png',

  // API key for Bing Maps use
  bingKey: 'AtCQswcYKiBKRMM8MHjAzncJvN6miHjgxbi2-m1oaFUHMa06gszNwt4Xe_te18FF'
})
