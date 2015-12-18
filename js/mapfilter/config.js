'use strict'

module.exports = require('backbone').Model.extend({

  url: './json/mapfilter-config.json',

  defaults: {
    canSaveFilters: false,
    dataUrl: '/json/Monitoring.json'
  },

  getFilterValue: function(field) {
    var filters = this.get('filters');
    var value = null;
    if (filters != null && filters != undefined) {
      if (filters[field])
        value = filters[field].value;
    }
    return value;
  }

})
