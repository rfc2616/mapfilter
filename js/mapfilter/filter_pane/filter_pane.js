/* global t */
// MapFilter.FilterPane
// --------------------

// The FilterPane shows the list of filters that can be used to explore data.
// It creates a filter view for each filter in the array `options.filters`
// which should have the following properties:
//
// - `field` is the field/attribute to filter by
// - `type` should be `discrete` for string data and `continuous` for numbers or dates
// - `expanded` sets whether the filter view is expanded or collapsed by default
'use strict'

var $ = require('jquery')
var GraphPane = require('./graph_pane.js')
var ContinuousFilterView = require('./continuous_filter_view.js')
var DiscreteFilterView = require('./discrete_filter_view.js')

module.exports = require('backbone').View.extend({
  events: {
    'click .print-preview': 'showPrintPreview',
    'click .save-filters': 'saveFilters'
  },

  initialize: function (options) {
    var filters = options.filters || []

    // Initialize a graph pane to hold charts for continuous filters
    this.graphPane = new GraphPane({
      collection: this.collection
    })

    this.models = []

    // Append the graph parent to this pane's parent
    this.$el.append(this.graphPane.render().el)

    this.$filters = $('<form class="form"/>').appendTo(this.el)

    // Loop through each filter and add a view to the pane
    filters.forEach(function (filter) {
      this.addFilter(filter)
    }, this)

    this.$filters.append(
      '<div>' +
      '<button type="button" class="btn btn-primary print-preview">' + 
      t('ui.filter_view.print_report') + 
      '</button> ' +
      '</div>')

    if (options.config.get('canSaveFilters')) {
      this.$filters.append(
        '<div>' + 
        '<div type"button" class="btn btn-default save-filters">' + 
        t('ui.filter_view.save_filters') +
        '</div>' +
        '</div>');
    }
  },

  // Add a filter on a field to the filter pane.
  addFilter: function (options) {
    var filterView

    if (!options.field) {
      console.error(t('error.filter_missing'))
      return
    }

    // Initialize a ContinuousFilterView or DiscreteFilterView
    // ContinousFilterView is linked to the GraphPane which will show
    // the bar chart for selecting ranges of data
    if (options.type === 'continuous') {
      filterView = new ContinuousFilterView({
        collection: this.collection,
        field: options.field,
        expanded: options.expanded || false,
        graphPane: this.graphPane
      })
    } else {
      filterView = new DiscreteFilterView({
        collection: this.collection,
        field: options.field,
        expanded: options.expanded || false
      })
    }

    this.models.push(filterView)
    this.$filters.append(filterView.render().el)
  },

  save: function() {
    var result = {}
    for (var i = 0; i < this.models.length; i++) {
      var filter = this.models[i];
      result[filter.field] = {
        field: filter.field,
        value: filter.save()
      };
    }
    return result;
  },

  // hide elements
  showPrintPreview: function () {
    this.trigger('print-preview')
  },

  // save filters
  saveFilters: function() {
    this.trigger('save-filters')
  }
})
