'use strict'

var Collection = require('./collection.js')
var MonitoringPoint = require('./monitoring_point.js')
var AppView = require('./appview.js')

module.exports = function (options) {
  var appView = new AppView({
    el: options.el,

    config: options.config,

    collection: new Collection(void 0, {
      model: MonitoringPoint,
      url: options.url,
      comparator: 'start',
      githubToken: options.githubToken
    }),

    filters: options.filters,

    // Initial map center point (TODO: set this & zoom based on data bounds)
    mapCenter: options.config.getMapCenter(),

    // Initial map zoom
    mapZoom: options.config.get('mapZoom'),

    tileUrl: options.tileUrl,

    bingKey: options.bingKey
  })

  return appView
}
