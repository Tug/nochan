
module.exports = function(app, model) {

    var Category = model.mongoose.model('Category');
    
    var categories = [
        {shortname: "mu",    name: "Music"}
      , {shortname: "tv",    name: "Television"}
      , {shortname: "film",  name: "Film"}
      , {shortname: "vg",    name: "Video Games"}
      , {shortname: "anim",  name: "Anime & Manga"}
      , {shortname: "funny", name: "Funny"}
      , {shortname: "news",  name: "News"}
      , {shortname: "w",     name: "Wallpapers"}
      , {shortname: "tech",  name: "Technology"}
      , {shortname: "prog",  name: "Programming"}
      , {shortname: "sci",   name: "Science"}
      , {shortname: "tr",    name: "Travel"}
      , {shortname: "gif",   name: "Animated Gif"}
      , {shortname: "m",     name: "Miscellaneous"}
      , {shortname: "req",   name: "Request"}
    ];
    
    categories.forEach(function(categoryInfo){
        new Category(categoryInfo).save();
    });
    
};
