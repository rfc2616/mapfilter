// MonitoringPoint
// ---------------

// MonitoringPoint extends `Backbone.Model` with accessor methods
// which format the model attributes for use in the view templates.
// If the fields on the model should change, you can just change these
// methods without needing to modify the rest of the application.
'use strict'

var t = window.t

module.exports = require('backbone').Model.extend({
  idAttribute: '_uuid',

  // Override the default Backbone `get()` so that `undefined`
  // attributes are returned as 'not_recorded'
  get: function (attr) {
    return this.attributes.properties[attr] || 'not_recorded'
  },

  // Should return a [lat, lon] array for the point
  coordinates: function () {
    if (this.attributes.geometry) {
      var lat = this.attributes.geometry.coordinates[1]
      var lon = this.attributes.geometry.coordinates[0]

      return [lat, lon]
    } else if (this.attributes.properties.group_location && this.attributes.properties.group_location.lat) {
      var lat = this.attributes.properties.group_location.lat
      var lon = this.attributes.properties.group_location.lon

      return [lat, lon]
    }
  },

  getFormatedCoords: function (digits) {
    digits = digits || 5

    var lat = this.coordinates()[0].toFixed(digits)
    var lon = this.coordinates()[1].toFixed(digits)

    lat += (lat > 0) ? '&deg; N' : '&deg; S'
    lon += (lon > 0) ? '&deg; E' : '&deg; W'

    return lat + ' ' + lon
  },

  getWhat: function () {
    return this._getOther('happening', 'happening_other')
  },

  hasImpacts: function() {
    if (this.attributes.properties['impacts'] ||
        this.attributes.properties['impacts_other'])
      return true
    else
      return false
  },

  getImpacts: function () {
    return this._getOther('impacts', 'impacts_other')
  },

  // legacy: for Wapichan style title-or-extension location
  hasLocation: function () {
    if(this.attributes.properties['myarea']){
      return true;
    } else {
      return false;
    }
  },

  // legacy: for Wapichan style title-or-extension location
  getLocation: function () {
    var location = this.get('myarea')
    var titleOrExtension = ''

    if (this.get('landtitle') === 'yes') {
      titleOrExtension = 'land title'
    } else if (this.get('customary') === 'yes') {
      titleOrExtension = 'extension area'
    }
    location = (location && location !== 'other') ? '<em>' + t(location) + '</em> in ' : ''
    location += '<em>' + t(this.get('myarea_village')) + '</em> ' + titleOrExtension
    return location
  },

  getPlacename: function () {
    var placename = this.get('placename')
    if (placename === 'not_recorded') placename = this.get('myarea')
    return this._toSentenceCase(placename)
  },

  getWho: function () {
    return this._getOther('people', 'people_other')
  },

  getWhen: function () {
    return this.get('today')
  },

  getDate: function () {
    var d = this.get('today').split('-')
    return new Date(d[0], d[1] - 1, d[2])
  },

  getImgUrl: function () {
    var photos = this.get('photos')
    if(photos && !(photos=='not_recorded')){
      return window.config.getImageUrl(photos['picture']);
    } else {
      var picture = this.get('picture');
      if(picture && !(picture=='not_recorded')){
        return window.config.getImageUrl(picture);
      } else {
        return undefined;
      }
    }
  },

  getImgCaption: function () {
    var photos = this.attributes.properties['photos']
    if(photos){
      // legacy Wapichan-style nested photos with caption
      return photos['caption']
    } else {
      if(this.attributes.properties['caption']) {
        return this.get('caption');
      }
    }
  },

  getFormattedAttributes: function() {
    var out = ""
    var props = this.attributes.properties
    for (var key in props) {
      if (props.hasOwnProperty(key)) {
        if(!(
          key == 'people' ||
          key == 'placename' ||
          key == 'location' ||
          key == 'picture' ||
          key == 'caption' ||
          key == 'happening' ||
          key == 'happening_other' ||
          key == 'impacts' ||
          key == 'impacts_other' ||
          key == 'today' ||
          key == 'start' ||
          key == 'end' ||
          key == 'meta'
        )){
          out = out + "<tr><th>"+t('ui.info_pane.'+key, { default: this._toSentenceCase(key) })+":</th><td>"+props[key]+"</td></tr>"
        }
      }
    }
    return out
  },

  // Takes a field that is a space-separated list of values, which may include "other"
  // and formats that field together with the "other" field into a comma-separated
  // list of readable text.
  _getOther: function (attr, attr_other) {
    var value = this.get(attr)
    var output = []
    var stripStyle = function (k) {
      if (k.indexOf('^') > -1) {
        return k.match(/^(.*)\^/)[1]
      } else {
        return k
      }
    }

    value = value || ''
    value = '' + value

    value.split(' ').forEach(function (v, i) {
      if (v === 'other') {
        output[i] = this._toSentenceCase(this.get(attr_other))
      } else {
        output[i] = t(attr + '.' + stripStyle(v))
      }
    }, this)

    return output.join(', ')
  },

  // Converts a string to sentence case
  _toSentenceCase: function (s) {
    s = s || ''
    s = '' + s
    s = s.replace(/_/g,' ')
    // Matches the first letter in the string and the first letter that follows a
    // period (and 1 or more spaces) and transforms that letter to uppercase.
    return s.replace(/(^[a-z])|(\.\s*[a-z])/g, function (s) { return s.toUpperCase() })
  }
})
