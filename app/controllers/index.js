
module.exports = function(app, model) {

    var Category = model.mongoose.model('Category');
    
    var actions = {};

    actions.index = function(req, res, next) {
        var query = Category.find();
        query.exec(function(err, docs) {
            var map = app.Plates.Map();
            map.className('category').to('category');
            map.className('cat-title').to('name');
            map.where('href').has(/catid/).insert('shortname');
            res.render('home', { data : { category : docs }, map: map });
        });
    };
    
    return actions;

}

