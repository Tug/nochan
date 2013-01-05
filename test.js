

var mongoose = require('mongoose');

var Room = new mongoose.Schema({
      _id             : { type: String, index: {unique: true}, default: "qqqqqqq" }
    , title           : String
    , creationDate    : { type: Date, default: Date.now }
    , deathDate       : Date
    , messageCount    : {type: Number, default: 0 }
    , ispublic        : {type: Boolean, default: false, index: true}
    , users           : [{ type: String }]
},
{safe: undefined});

var Category = new mongoose.Schema({
    shortname   : { type: String, index: { unique: true } }
  , name        : String
  , rooms       : [{ type: String, ref: 'Room' }]
},
{safe: undefined});

mongoose.connect('mongodb://localhost/testdb');

var RoomModel = mongoose.model('Room', Room);
var CategoryModel = mongoose.model('Category', Category);

var room1 = new RoomModel({_id: "adwdede", title: "room1"});
var room2 = new RoomModel({_id: "fvdvdrs", title: "room2"});

room1.save();
room2.save();

var cat = new CategoryModel({shortname: "h", name: "hello", rooms: [room1.id, room2.id]});

cat.save();

setTimeout(function() {
	CategoryModel.findOne({shortname: "h"}).populate("rooms").exec(function(err, catDoc) {
		console.log(catDoc);
	})
}, 10 * 1000);
