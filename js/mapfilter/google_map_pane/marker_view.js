// MapFilter.MarkerView
// --------------------

// MapFilter MarkerView manages the markers displayed on the map. It should be 
// initialized with a reference to the model and to the map in the options hash
MapFilter.MarkerView = Backbone.View.extend({

    events: {
        "mouseover": "onMouseOver",
        "mouseout": "onMouseOut",
        "click": "onClick"
    },

    // default symbol as svg path
    symbol: {
        path: 'M 17,8 C 17,13 11,21 8.5,23.5 C 6,21 0,13 0,8 C 0,4 4,-0.5 8.5,-0.5 C 13,-0.5 17,4 17,8 z',
        fillOpacity: 0.8,
        scale: 1,
        size: [25, 34],
        // anchor: [25 / 2, 30],
    },

    initialize: function(options) {
        var loc = this.model.coordinates();

        // Sometimes models (monitoring reports) do not have coordinates
        if (!loc[0] || !loc[1]) loc = [0, 0];

        // Create a new marker with the default icon and add to the map
        this.marker = new CustomMarker({
            position: new google.maps.LatLng(loc[0], loc[1]),
            icon: {
                path: this.symbol.path,
                size: this.symbol.size
            },
            className: this.model.get("happening"),
            map: options.map
        });

        // Store a reference the icon div from this view's `el`
        this.setElement(this.marker.div_);
        this.$markerText = this.$(".marker-text");

        // Store a reference to the marker icon on the model - used for info view when printing
        this.model.icon = this.$el;

        // Reference the marker's current z-index (we change the z-index later
        // when the markers are filtered, so unfiltered markers appear on top)
        // this._lastZIndex = this.marker.options.zIndexOffset;
    },

    // TODO: remove/update this 
    render: function() {
        $(".marker-text", this.el).html("");
        this.marker.update();
    },

    // Removes this marker from the map 
    remove: function() {
        this.marker.map.removeLayer(this.marker);
    },

    // When the mouse is over the marker, show the info pane 
    onMouseOver: function(e) {
        e.stopPropagation();
        this.$el.addClass("hover",this.model);
        app.infoPane.show({
            model: this.model
        });
    },

    // Hide the infopane when the mouse leaves the marker 
    onMouseOut: function() {
        this.$el.removeClass("hover");
        app.infoPane.hide();
    },

    // When you click the marker, make the infoPane "stick" open
    // until you click on another marker 
    onClick: function(e) {
        e.stopPropagation();
        this.$el.toggleClass("clicked");
        app.infoPane.toggle({
            model: this.model,
            sticky: true,
            iconView: this
        });
    },

    // Shows or 'hides' a marker (hiding actually just reduces opacity
    // and send the marker behind shown markers)
    // `shown` is a boolean for whether the marker should be shown
    show: function(shown, i) {
        if (shown) {
            this.$el.removeClass("filtered");
            // this.marker.setZIndexOffset(this._lastZIndex);
            if (typeof i !== "undefined") {
                this.$markerText.html(String.fromCharCode(65 + i));
            }
        } else {
            this.$el.addClass("filtered");
            // Move 'hidden' markers behind the others
            // this._lastZIndex = this.marker.options.zIndexOffset;
            // this.marker.setZIndexOffset(-99999);
            this.$markerText.html("");
        }
    }
});
