var dropDot = function(theMap, lat, lng, color) {
    L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'count-icon-' + color,
            html: "",
            iconSize: [10, 10]
        })
    }).addTo(theMap);
}

var index = 0;
var addDot = function(theMap) {
    if (index < window.locs.length) {
        var value = window.locs[index];
        dropDot(theMap, value.corrected_lat, value.corrected_lng, 'red');
        dropDot(theMap, value.lat, value.lng, 'blue');
        console.log("Testing");
        console.log(index);
        ++index;
        window.setTimeout(function() {
            addDot(theMap)
        }, 200);
        theMap.setView([value.corrected_lat, value.corrected_lng], 18);
    }
}

$(function() {
    var initialLocation;
    if (window.locs.length) {
        initialLocation = new L.LatLng(window.locs[0].lat, window.locs[0].lng);
    } else {
        initialLocation = new L.LatLng(window.linePoints[0][0], window.linePoints[0][1]);
    }

    var map = L.mapbox.map('map', 'baldurg.j052a6a4')
        .setView([initialLocation.lat, initialLocation.lng], 18);
    var polyline = L.polyline([], {
        color: '#000'
    }).addTo(map);
    $.each(linePoints, function(index, value) {
        polyline.addLatLng(new L.LatLng(value[0], value[1]));
    });

    if (/slowmo/.test(location.search)) {
        addDot(map);
    } else {
        $.each(window.locs, function(index, value) {
            dropDot(map, value.corrected_lat, value.corrected_lng, 'red');
            dropDot(map, value.lat, value.lng, 'blue');
        })
    }


    var dropper = L.marker(initialLocation, {
        icon: L.mapbox.marker.icon({
            'marker-color': 'CC0033'
        }),
        draggable: true
    });
    var result = L.marker(initialLocation, {
        icon: L.divIcon({
            className: 'count-icon-corrector',
            html: "",
            iconSize: [10, 10]
        })
    }).addTo(map);

    var currentLeg = 0;
    var lat, lng;
    dropper.on('dragend', function(x) {
        var latLng = x.target.getLatLng();
        var newLatLng = new L.LatLng(latLng.lat, latLng.lng);
        $.get('snap?current_leg=' + currentLeg + '&route_id=' + $('#map').data().currentRoute + '&lat=' + latLng.lat + '&lng=' + latLng.lng, function(resp) {
            console.log("||||" + currentLeg + "||||");
            responseArray = resp.split(",");
            console.log(resp);
            if (responseArray.length > 2) {
                currentLeg = responseArray[2];
                lat = responseArray[0];
                lng = responseArray[1];
                result.setLatLng(new L.LatLng(lat, lng));
                console.log(newLatLng.distanceTo(new L.LatLng(lat, lng)));
            } else {
                console.log("LOST");
            }
        });
    });
    dropper.addTo(map);
});
