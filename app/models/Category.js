
module.exports = function(app, model) {
    
    var mongoose  = app.libs.mongoose;
    
    var Category = new mongoose.Schema({
        _id         : { type: String, index: { unique: true } }
      , name        : String
    },
    {safe: undefined});
    
    Category.virtual('shortname')
    .get(function() { return this._id; })
    .set(function(shortname) { this._id = shortname; });

    Category.statics.list = function(callback) {
        CategoryModel.find({}, callback);
    };
    
    var CategoryModel = model.mongoose.model('Category', Category);
    return CategoryModel;
}

