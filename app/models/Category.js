
module.exports = function(app, model) {
    
    var mongoose  = app.libs.mongoose;
    
    var Category = new mongoose.Schema({
        shortname   : { type: String, index: { unique: true } }
      , name        : String
      , rooms       : [{ type: String, ref: 'Room' }]
    },
    {safe: undefined});
    
    Category.statics.addRoom = function(catid, room, callback) {
        CategoryModel.update({shortname: catid}, { $addToSet: {rooms: room._id}}, callback);
    };

    Category.statics.removeRoom = function(catid, room, callback) {
        CategoryModel.update({shortname: catid}, { $pull: {rooms: room._id}}, callback);
    };

    Category.statics.list = function(callback) {
        CategoryModel.find({}, callback);
    };
    
    var CategoryModel = model.mongoose.model('Category', Category);
    return CategoryModel;
}

