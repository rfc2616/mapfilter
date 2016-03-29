'use strict'

var d3 = window.d3
var BarChart = require('./bar_chart.js')
module.exports = require('backbone').View.extend({
  id: 'graph-pane',

  events: {
    'click .close': 'close',
    'click': 'noop'
  },

  initialize: function (options) {
    var self = this
    this.$el.append('<button type="button" class="close" aria-hidden="true">&times;</button>')
    var date = this.collection.dimension(function (d) { return new Date(d.get('today')) }),
      dates = date.group(d3.time.day)

    this.initialValue = options.initialValue
    this.barChart = BarChart()
      .collection(options.collection)
      .dimension(date)
      .group(dates)
      .round(d3.time.day.round)
      .x(d3.time.scale()
        .domain([new Date(2013, 9, 1), new Date(2013, 11, 20)])
        .range([0, 1400]))
      .on('brush', function () {
        if (!d3.event.target.empty()) {
          self.collection.trigger('filtered')
        }
      })
    this.listenTo(this.collection, 'filtered', this.render)
    this.listenTo(this.collection, 'change', this.updateDomain)
    this.listenTo(this.collection, 'firstfetch', this.load)
  },

  render: function () {
    if (!this.collection.length) return this
    d3.select(this.el).call(this.barChart)
    return this
  },

  load: function() {
    if (this.initialValue) {
      var data = this.initialValue
      this.format = window.locale.d3().timeFormat('%d %b %Y')

      var date = this.format.parse(data.startDate)
      var yesterday = new Date(date.getTime() - 24 * 60 * 60 * 100)

      this.updateDomain()
      //FIXME: This should not remove checkboxes, but it does...
      //this.barChart.filter([yesterday, this.format.parse(data.endDate)])
    }
  },

  updateDomain: function () {
    var dimension = this.barChart.dimension()
    this.barChart.x()
        .domain([dimension.bottom(1)[0].getDate(), dimension.top(1)[0].getDate()])
  },

  open: function () {
    this.trigger('opened')
    this.render()
  },

  close: function () {
    this.trigger('closed')
  },

  noop: function (e) {
    e.stopPropagation()
  }
})
