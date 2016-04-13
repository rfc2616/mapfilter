/* global L */
// MapFilter.MapPane
// -----------------

// The MapFilter MapPane manages the map and markers on the map, hiding markers which
// do not match the current filter whenever the filter changes.
//
// `options.center` is a [lat,lon] array of the starting center point for the map
// `options.zoom` is the initial zoom level for the map                                                                                                                                   this.markersById[model.cid]       =    new           MapFilter.MarkerView({ model: model, map:             this.map });     } [description]
// `options.tileUrl` is [URL template](http://leafletjs.com/reference.html#url-template) for map tile layer
'use strict'

var MarkerView = require('./marker_view.js')
var _ = require('lodash')
var TileLayers = require('../tile_layers.js')

var $ = require('jquery')

module.exports = require('backbone').View.extend({
  initialize: function (options) {
    // Initialize the [Leaflet](http://leafletjs.com/) map attaching to this view's element
    console.log('Initializing the map pane')
    var map = this.map = L.map(this.el, {
      center: options.center,
      zoom: options.zoom,
      scrollWheelZoom: options.scrollWheelZoom || true
    })

    this._interactive = options.interactive

    this.appView = options.appView

    this.config = options.config

    L.bingLayer.initialize = function (key, options) {
      L.Util.setOptions(this, options)

      var cachedMeta = {
        'resourceSets': [{
          'resources': [{
            'imageHeight': 256,
            'imageUrl': 'http:\/\/ecn.{subdomain}.tiles.virtualearth.net\/tiles\/a{quadkey}.jpeg?g=2732',
            'imageUrlSubdomains': ['t0', 't1', 't2', 't3'],
            'imageWidth': 256,
            'imageryProviders': null
          }]
        }],
        'statusCode': 200,
        'statusDescription': 'OK'
      }

      this._key = key
      this._url = null
      this.meta = cachedMeta
      this.initMetadata()
      this.loadMetadata()
    }

    // Create a layer with Bing satellite imagery
    this.bingLayer = L.bingLayer(options.bingKey).addTo(this.map)

    // this.cloudMadeLayer = L.tileLayer.provider('CloudMade', {
    //     apiKey: options.cloudMadeKey,
    //     styleID: '123'
    // })

    var baseMaps = {}
    baseMaps[t('ui.map_pane.layers.bing')] = this.bingLayer

    if (this.config.get('tileLayersUrl')) {
      var tileLayers = new TileLayers()
      tileLayers.url = this.config.get('tileLayersUrl')
      tileLayers.fetch({
        success: function (model, resp, opts) {
          console.log('Successfully fetched tile layers:')
          console.log(tileLayers)
          tileLayers.each(function (tileLayer) {
            console.log('+ adding a tile layer to the map:')
            console.log(tileLayer)
            var baseLayer = L.tileLayer(tracksConfig.tilesPath + '/' + tileLayer.attributes.name + '/{z}/{x}/{y}.png')
            baseMaps[tileLayer.attributes.name] = baseLayer
          })
          L.control.layers(baseMaps).addTo(map)
        },
        error: function (model, resp, opts) {
          console.log('Could not fetch more tile layers. Limited to Bing')
          L.control.layers(baseMaps).addTo(map)
        }
      })
    } else {
      L.control.layers(baseMaps).addTo(map)
    }

    if (this.config.isTracksEnabled()) {
      var tracksConfig = this.config.getTracksInfo();

      var popup_for = function (map_props) {
        var html = ''
        if (map_props.name) {
          html += '<div>' + map_props.name + '</div>'
        }
        if (map_props.time) {
          html += '<div>' + map_props.time + '</div>'
        }
        if (map_props.sym) {
          html += '<div>' + map_props.sym + '</div>'
        }
        if (map_props.voice_memo) {
          html += '<div><a target="_blank" href="' + 
            tracksConfig.soundsPath + '/' + map_props.voice_memo + '">' + 
            map_props.voice_memo + '</div>'
        }
        return html
      }
      var onEachFeature = function (feature, layer) {
        var map_props = feature.properties
        var popupContent = popup_for(map_props)
        layer.bindPopup(popupContent)
      }
      var tracksLayer = L.geoJson(null, {
        'onEachFeature': onEachFeature
      })

      baseMaps[t('ui.map_pane.layers.tracks')] = tracksLayer
      L.Icon.Default.imagePath = tracksConfig.iconPath

      $.ajax({
        dataType: 'json',
        url: tracksConfig.url,
        success: function (data) {
          $(data.features).each(function (key, data) {
            tracksLayer.addData(data)
            console.log('Added track feature')
            console.log(data)
          })
        }
      }).error(function (err) {
        console.log('Error loading tracks json')
        console.log(err)
      })
    }

    // Object to hold a reference to any markers added to the map
    this.markersById = {}

    // When a new model is created, add a new marker to the map
    this.listenTo(this.collection, 'add', this.addOne)

    // When the models are initially fetched, or the collection is reset
    // remove and re-add all the markers to the map
    this.listenTo(this.collection, 'firstfetch reset', this.addAll)

    // Remove a marker from the map when the model is removed from collection
    this.listenTo(this.collection, 'remove', this.removeOne)

    // Filter which markers are hidden or shown whenever the collection
    // is filtered
    this.listenTo(this.collection, 'filtered', this.filter)
  },

  // Create a new MarkerView for each model added to the collection,
  // and store a reference to that view in markersById
  addOne: function (model) {
    this.markersById[model.cid] = new MarkerView({
      model: model,
      map: this.map,
      appView: this.appView,
      interactive: this._interactive
    })
  },

  // Remove all the markers from the map and add a marker for each model
  // in the collection
  addAll: function () {
    this.removeAll()
    this.collection.each(this.addOne, this)
  },

  // Remove a single marker for a given model from the map
  removeOne: function (model) {
    this.markersById[model.cid].remove()
    // Remove reference to marker to allow garbage collection
    delete this.markersById[model.cid]
  },

  // Remove all markers from the map
  removeAll: function () {
    _.each(this.markersById, function (v) {
      this.removeOne(v.model)
    }, this)
  },

  // `this.collection.groupByCid.all()` is an array of every model in the collection by `cid`.
  // The value will be 0 for filtered models, 1 for models that are unfiltered.
  // This loops through `this.group.all()` and calls `MapFilter.MarkerView.show()`
  filter: function () {
    var i = 0
    this.collection.groupByCid.all().forEach(function (d) {
      this.markersById[d.key].show(d.value, i)
      i += d.value
    }, this)
  }
})
