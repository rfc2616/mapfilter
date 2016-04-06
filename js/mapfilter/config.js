'use strict'

module.exports = require('backbone').Model.extend({

  url: './json/mapfilter-config.json',

  defaults: {
    canSaveFilters: false,
    saveFilterTargets: [],
    imageUrlRoot: '/monitoring-files',
    dataUrl: '/json/Monitoring.json',
    mapZoom: 13,
    mapCenterLat: -3.917096328676119,
    mapCenterLong: -77.78382001878626
  },

  getBingProxyPath: function(url) {
    if (this.get('bingProxy')) {
      return this.get('bingProxy') + '/' + encodeURIComponent(url);
    } else
      return url;
  },

  getBingMetadataPath: function(url) {
    if (this.get('bingMetadata')) {
      return this.get('bingMetadata') + '/' + encodeURIComponent(url);
    } else
      return url;
  },

  getSaveFilterTargets: function() {
    return this.get('saveFilterTargets');
  },

  getFilterValue: function(field) {
    var filters = this.get('filters');
    var value = null;
    if (filters != null && filters != undefined) {
      if (filters[field])
        value = filters[field].value;
    }
    return value;
  },

  getImageUrl: function(path) {
    if (path)
      return this.get('imageUrlRoot') + (path.startsWith('/') ? path : ("/" + path));
  },

  getMapCenter: function() {
    var lat = this.get('mapCenterLat'), lng = this.get('mapCenterLong');
    if (lat && lng)
      return [lat, lng];
    else
      return [this.defaults.mapCenterLat, this.defaults.mapCenterLong];
  }

})
