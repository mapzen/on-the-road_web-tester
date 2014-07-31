var MAPZEN = {
    map: null,
    resultDot: null,
    getCorrectedDot: function(x) {
        var currentLeg = 0;
        var lat, lng;
        var latLng = x.target.getLatLng();
        var newLatLng = new L.LatLng(latLng.lat, latLng.lng);
        var params = $.param({
            current_leg: currentLeg,
            route_id: $('#map').data().currentRoute,
            lat: latLng.lat,
            lng: latLng.lng
        });

        $.get('snap?' + params, function(resp) {
            responseArray = resp.split(",");
            if (responseArray.length > 2) {
                currentLeg = responseArray[2];
                MAPZEN.resultDot.setLatLng(new L.LatLng(responseArray[0], responseArray[1]));
            } else {
                console.log("LOST");
            }
        });
    },
    addLocations: function(index, value) {
        L.marker([value.corrected_lat, value.corrected_lng], {
            icon: L.divIcon({
                className: 'count-icon-' + 'red',
                html: "",
                iconSize: [10, 10]
            })
        }).addTo(MAPZEN.map);
        L.marker([value.lat, value.lng], {
            icon: L.divIcon({
                className: 'count-icon-' + 'blue',
                html: "",
                iconSize: [10, 10]
            })
        }).on('mouseover', function(e) {
            var popup = L.popup().setLatLng(e.latlng) 
                .setContent("location: " + e.latlng.toString() 
                             + "speed: " + value.speed 
                             + ", bearing: " + value.bearing)
                .openOn(MAPZEN.map);
        }).addTo(MAPZEN.map);
    },
    initialLocation: null,
    init: function() {
        if (window.locs.length) {
            MAPZEN.initialLocation = new L.LatLng(window.locs[0].lat, window.locs[0].lng);
        } else {
            MAPZEN.initialLocation = new L.LatLng(window.linePoints[0][0], window.linePoints[0][1]);
        }

        MAPZEN.map = L.mapbox.map('map', 'baldurg.j052a6a4')
            .setView([MAPZEN.initialLocation.lat, MAPZEN.initialLocation.lng], 18);
    },
    addRouteLine: function() {
        var polyline = L.polyline([], {
            color: '#000'
        }).addTo(MAPZEN.map);

        $.each(linePoints, function(index, value) {
            polyline.addLatLng(new L.LatLng(value[0], value[1]));
        });
    },
    populateDots: function() {
        $.each(window.locs, MAPZEN.addLocations);
    },
    addDropper: function() {
        var dropper = L.marker(MAPZEN.initialLocation, {
            icon: L.mapbox.marker.icon({
                'marker-color': 'CC0033'
            }),
            draggable: true
        });

        MAPZEN.resultDot = L.marker(MAPZEN.initialLocation, {
            zIndexOffset: 1000,
            icon: L.divIcon({
                className: 'count-icon-corrector',
                html: "",
                iconSize: [10, 10]
            })
        }).addTo(MAPZEN.map);

        dropper.on('dragend', MAPZEN.getCorrectedDot);
        dropper.addTo(MAPZEN.map);
    }
};

$(function() {
    MAPZEN.init();
    MAPZEN.addRouteLine();
    MAPZEN.populateDots();
    MAPZEN.addDropper();
});
