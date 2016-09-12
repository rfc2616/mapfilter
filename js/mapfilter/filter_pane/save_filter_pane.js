// MapFilter.SaveFilterPane
// ------------------

// The SaveFilterPane presents a dialog allowing a user to save their filter 
// information to CommunityLands.
'use strict'

var $ = require('jquery')
var tpl = require('../../../templates/save-filter-pane.tpl')
var SavedFilters = require('../saved_filters.js')

module.exports = require('backbone').View.extend({
  events: {
    'click .close': 'close',
    'click #cancel-save-filter': 'close',
    'click #submit-save-filter': 'submit',
    'change input[name=filter-coordinate-zoom-source]': 'swapCZSource'
  },

  initialize: function (options) {
    options = options || {}
    if (options.id) this.$el.attr('id', options.id)
    this.config = options.config
    this.template = tpl
    this.community_filters = options.savedFilters || new SavedFilters();
    this.mapPane = options.mapPane;
  },

  // Populates the infopane contents with the data from the selected point
  render: function () {
    this.$el.html(this.template({map: this.mapPane.getMap(), targets: config.getSaveFilterTargets(), model: this.model}))
    return this
  },

  show: function (options) {
    this.hide()
    this.model = options.model
    this.render()
    this.$el.show()
    var map = this.mapPane.getMap();
    map.on('zoomend', this.updateCZ, this);
    map.on('moveend', this.updateCZ, this);
  },

  close: function () {
    var map = this.mapPane.getMap();
    map.off('zoomend', this.updateCZ);
    map.off('moveend', this.updateCZ);
    this.hide()
  },

  hide: function () {
    this.$el.hide()
  },

  submit: function() {
    var name = this.$('#filter-name').val();
    var target = this.$('#filter-target').val();
    var path = this.$('#target-' + target).data('path');
    if (!(name == null || name == '' || name == undefined)) {
      this.close();
      var request_options = {
        wait: true,
        success: function(m, r, o) {
          if (r && r.error)
            alert(t('error.' + (r.code || 'unknown')));
          else
            alert(t('message.filter_saved'))
        },
        error: function(m, err, o) {
          var error_key = 'unknown'
          if (err && err.responseJSON) {
            var r = err.responseJSON
            if (r.code)
              error_key = r.code
          }
          alert(t('error.' + error_key));
        }
      }

      var model_data = {
        name: name,
        value: this.model,
        zoom: parseInt(this.$("#filter-zoom").html()),
        latitude: parseFloat(this.$("#filter-latitude").html()),
        longitude: parseFloat(this.$("#filter-longitude").html()),
        locations: this.mapPane.getPoints(function(value) {
          return value.getIdentifier();
        })
      } //TODO: lat/long/uri/anything else
      if (window.currentBaseLayer)
        model_data['baseLayer'] = window.currentBaseLayer;
      this.community_filters.url = path;
      this.community_filters.create(model_data, request_options);
    }
  },

  swapCZSource: function() {
    var source = this.$("input[name=filter-coordinate-zoom-source]:checked").val()
    var cz;
    if (source == 'compute') {
      var map = this.mapPane.getMap();
      cz = {
        latitude: map.getCenter().lat,
        longitude: map.getCenter().lng,
        zoom: map.getZoom()
      };
    } else {
      cz = {
        latitude: this.config.get('mapCenterLat'),
        longitude: this.config.get('mapCenterLong'),
        zoom: this.config.get('mapZoom')
      };
    }
    for (var key in cz)
      $("#filter-" + key).html(cz[key])
  },

  updateCZ: function() {
    var source = this.$("input[name=filter-coordinate-zoom-source]:checked").val()
    if (source == 'compute') {
      var map = this.mapPane.getMap();
      var cz = {
        latitude: map.getCenter().lat,
        longitude: map.getCenter().lng,
        zoom: map.getZoom()
      };
      for (var key in cz)
        $("#filter-" + key).html(cz[key]);
    }
  }

})
