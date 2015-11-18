'use strict'

var Collection = require('./collection.js')
var MonitoringPoint = require('./monitoring_point.js')
var AppView = require('./appview.js')

module.exports = function (options) {
  var appView = new AppView({
    el: options.el,

    collection: new Collection(void 0, {
      model: MonitoringPoint,
      url: options.url,
      comparator: 'start',
      githubToken: options.githubToken
    }),

    filters: options.filters,

    // Initial map center point (TODO: set this & zoom based on data bounds)
    mapCenter: [-3.917096328676119, -77.78382001878626],

    // Initial map zoom
    mapZoom: 13,

    tileUrl: options.tileUrl,

    bingKey: options.bingKey
  })

  return appView
}
