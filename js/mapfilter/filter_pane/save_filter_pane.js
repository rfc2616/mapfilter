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
    'click #submit-save-filter': 'submit'
  },

  initialize: function (options) {
    options = options || {}
    if (options.id) this.$el.attr('id', options.id)
    this.config = options.config
    this.template = tpl
    this.community_filters = options.savedFilters || new SavedFilters();
  },

  // Populates the infopane contents with the data from the selected point
  render: function () {
    this.$el.html(this.template({targets: config.getSaveFilterTargets(), model: this.model}))
    return this
  },

  show: function (options) {
    this.hide()
    this.model = options.model
    this.render()
    this.$el.show()
  },

  close: function () {
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
      this.hide();
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
        zoom: this.config.get('mapZoom')
      } //TODO: lat/long/uri/anything else
      this.community_filters.url = path;
      this.community_filters.create(model_data, request_options);
    }
  }
})
