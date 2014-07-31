var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

module.exports.Route = mongoose.model('Route', mongoose.Schema({
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

module.exports.Location = mongoose.model('Location', mongoose.Schema({
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
    bearing: Number,
    speed: Number,
    time: Date,
    route_id: {
        type: String,
        ref: 'Route'
    },
    dump: String
}));

module.exports.RouteGeometry = mongoose.model('RouteGeometry', mongoose.Schema({
    route_id: {
        type: String,
        ref: 'Route'
    },
    position: Number,
    lat: Number,
    lng: Number
}));

