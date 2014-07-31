var polylineEncoded = require('polyline-encoded');
var zmq = require('zmq');
var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var sqlite3 = require('sqlite3').verbose();
var mongoose = require('mongoose');

var config = require('./config.json');

mongoose.connect(config.mongodb);

var models = require('./models.js'),
  Route = models.Route,
  Location = models.Location,
  RouteGeometry = models.RouteGeometry;

app.use("/static", express.static(path.join(__dirname, '/static')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', function(req, res) {
    var routeId = req.query.route_id;
    Route
        .find({})
        .exec(function(err, route) {
            res.render('index', {
                route_id: routeId || route[0]._id,
                routes: route
            });
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
    requester.connect(config.zmq);
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
            db.each("select * from locations where route_id = ?",  route._id, function(err, row) {
                delete row.route_id;
                delete row._id;
                row.route_id = route._id;
                var loc = new Location(row);
                loc.save(saveCallback);
                route.locations.push(loc);
                route.save(saveCallback);
            });

            db.each("select * from route_geometry where route_id = ?", route._id, function(err, row) {
                delete row.route_id;
                delete row._id;
                row.route_id = route._id;
                var rg = new RouteGeometry(row);
                route.geometries.push(rg);
                route.save(saveCallback);
                rg.save(saveCallback);
            });

        });
    });
    res.send("ok");
});

http.listen(config.http.port, config.http.ip, function() {
    console.log('listening on *:3000');
});
