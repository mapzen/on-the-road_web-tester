var polylineEncoded = require('polyline-encoded');
var zmq = require('zmq');
var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var sqlite3 = require('sqlite3').verbose();
var mongoose = require('mongoose');
mongoose.connect('mongodb://0.0.0.0/on_the_road');

app.use("/static", express.static(path.join(__dirname, '/static')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    res.render('index', {
        route_id: req.query.route_id
    });
});

app.get('/data', function(req, res) {
    Route
        .find({
            _id: req.query.route_id
        })
        .populate('locations')
        .exec(function(err, route) {
            console.log(route.length);
            var decoded = polylineEncoded.decode(JSON.parse(route[0].raw).route_geometry, 6);
            response = "window.locs = " + JSON.stringify(route[0].locations) + ";";
            response += "window.linePoints = " + JSON.stringify(decoded) + ";";
            res.send(response);
        });
})

app.get('/snap', function(req, res) {
    var requester = zmq.socket('req');
    requester.connect("tcp://0.0.0.0:5555");
    requester.on("message", function(reply) {
        console.log('testing');
        console.log(reply.toString());
        res.send(reply.toString());
        requester.close();
    });
    Route
        .find({
            _id: req.query.route_id
        })
        .exec(function(err, route) {
            requester.send(JSON.stringify({
                coordinates: [req.query.lat, req.query.lng],
                current_leg: parseInt(req.query.current_leg),
                route: route[0]
            }));
        });
});

var Route = mongoose.model('Route', mongoose.Schema({
    _id: String,
    uploaded: Number,
    ready_for_upload: Number,
    raw: String,
    locations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    }],
    geometries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RouteGeometry'
    }]
}));

var Location = mongoose.model('Location', mongoose.Schema({
    lat: Number,
    lng: Number,
    provider: String,
    corrected_lat: Number,
    corrected_lng: Number,
    instruction_lat: Number,
    instruction_lng: Number,
    instruction_bearing: Number,
    alt: String,
    acc: Number,
    time: Date,
    route_id: {
        type: String,
        ref: 'Route'
    },
    dump: String
}));

var RouteGeometry = mongoose.model('RouteGeometry', mongoose.Schema({
    route_id: {
        type: String,
        ref: 'Route'
    },
    position: Number,
    lat: Number,
    lng: Number
}));

var saveCallback = function(err) {
    if (err) {
        return console.log(err);
    }
}

app.post('/upload', function(req, res) {
    console.log(req.headers['x-file']);
    var db = new sqlite3.Database(req.headers['x-file']);
    db.each("select * from routes", function(err, row) {
        var route = new Route(row);
        route.save(function(err) {
            db.each("select * from locations where route_id = " + route._id, function(err, row) {
                delete row.route_id;
                delete row._id;
                row.route_id = route._id;
                var loc = new Location(row);
                loc.save(saveNotice);
                route.locations.push(loc);
                route.save(saveCallback);
            });

            db.each("select * from route_geometry where route_id = " + route._id, function(err, row) {
                delete row.route_id;
                delete row._id;
                row.route_id = route._id;
                var rg = new RouteGeometry(row);
                route.geometries.push(rg);
                route.save(saveNotice);
                rg.save(saveCallback);
            });

        });
    });
    res.send("ok");
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
