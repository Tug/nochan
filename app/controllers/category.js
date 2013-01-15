
module.exports = function(app, model) {

    var Category = model.mongoose.model('Category')
      , Room = model.mongoose.model('Room')
      , Message = model.mongoose.model('Message')
      , Step = app.libs.Step
      , common = app.libs.common
      , maxLifeEmptyRoom = app.config.limits.maxLifeEmptyRoom
      , roomsPerCategory = app.config.limits.roomsPerCategory
      , roomsPerPage = app.config.limits.roomsPerPage;
    
    var actions = {};
    
    actions.index = function(req, res, error) {
        var catid = req.params.catid;
        if(catid === "private") {
            res.redirect("/");
            return;
        }
        var page = parseInt(req.query.p, 10) || 1;
        var totalCount = 0;
        Step(
            function countRooms() {
                Room
                .count({category: catid, messageCount: {$gt: 0}})
                .exec(this);
            },
            function loadRooms(err, count) {
                if(err) throw err;
                totalCount = count;
                Room
                .where('category', catid)
                .where('messageCount').gt(0)
                .sort('lastMessageDate')
                .limit(roomsPerPage)
                .skip(roomsPerPage*(page-1))
                .exec(this);
            },
            function fillLastMessages(err, rooms) {
                if(err) throw err;
                var group = this.group();
                rooms = rooms || [];
                var callbacks = rooms.map(function() { return group(); });
                rooms.forEach(function(room) {
                    Step(
                        function firstMessages() {
                            var next = this;
                            room.messages = [];
                            Message.firstOnes(room._id, 1, function(err, docs) {
                                room.messages = docs;
                                next();
                            });
                        },
                        function lastMessages() {
                            var next = this;
                            Message.lastOnes(room._id, 3, function(err, docs) {
                                var firstMessageNum = room.messages[room.messages.length-1].num;
                                var ommitedMesssages = docs[0].num - firstMessageNum;
                                docs.forEach(function(m) {
                                    if(m.num > firstMessageNum) room.messages.push(m);
                                });
                                next();
                            });
                        },
                        function roomLoaded() {
                            callbacks.shift()(null, room);
                        }
                    );
                    
                });
            },
            function formatTopics(err, rooms) {
                if(err) throw err;
                rooms = rooms || [];
                var topics = rooms.map(function(room) {
                    var messages = room.messages.map(function(message) {
                        var file = message.attachment;
                        if(file != null) {
                            file.url = app.routes.url("file.download", {
                                servername: file.servername,
                                filename  : encodeURIComponent(file.originalname)
                            });
                        }
                        return {
                            body     : common.formatFile(file) + common.processMessage(message.body)
                          , num      : message.num
                          , username : common.htmlentities(message.username, 'ENT_NOQUOTES')
                          , date     : common.dateStr(message.date)
                        };
                    });
                    return {
                        roomid    : room._id
                      , title     : common.htmlentities(room.title, 'ENT_NOQUOTES')
                      , catid     : catid
                      , msgsample  : messages
                    };
                });
                this(null, topics);
            },
            function mapView(err, topics) {
                if(err) throw err;
                var data = {
                    topic : topics
                  , title : "/"+catid+"/"
                  , catid : catid
                };
                var map = app.Plates.Map();
                map.className('header-title').to('title');
                map.where('href').has(/catid/).insert('catid');
                map.where('href').has(/roomid/).insert('roomid');
                map.className('topic').to('topic');
                map.className('topic-title').to('title');
                //var partial = app.viewEngine('category.message', )
                map.className('msgsample').to('msgsample');
                map.className('message').to('body');
                map.className('nickname').to('username');
                map.className('msgdate').to('date');
                map.className('message-num').to('num');
                this(null, map, data);
            },
            function loadCategories(err, map, data) {
                if(err) throw err;
                var nextstep = this;
                map.where('href').has(/caturl/).insert('shortname');
                map.className('category').to('category');
                map.className('shortname').to('shortname');
                Category.list(function(err, categories) {
                    if(err) nextstep(err);
                    data.category = categories;
                    nextstep(null, map, data);
                });
            },
            function loadPageLinks(err, map, data) {
                if(err) throw err;
                var nextstep = this;
                data.page = [];
                var totalPages = Math.ceil(totalCount/roomsPerPage);
                for(var i=1; i<=totalPages; i++) {
                    data.page.push({num: ""+i, pageurl: catid+"?p="+i});
                }
                map.className('page').to('page');
                map.className('pagelink').to('num');
                map.where('href').has(/pageurl/).insert('pageurl');
                this(null, map, data);
            },
            function renderView(err, map, data) {
                if(err) throw err;
                res.render('category', {
                    data : data
                  , map: map 
                });
            },
            error
        );
    };

    actions.create = function(req, res, next) {
        var shortname = req.query["catid"];
        var name = req.query["name"];
        var category = new Category({
            shortname   : shortname
          , name        : name
        });
        category.save(function(err) {
            res.send("category "+shortname+": '"+name+"' created");
        });
    };

    actions.createRoom = function(req, res, error) {
        var catid = req.params.catid;
        var ispublic = (catid === "private");
        var title = req.body.title || null;
        if(title !== null && (typeof title !== 'string' || title.length > 100)) {
            error(new Error("wrong input name"));
            return;
        }
        var room = new Room({ispublic: ispublic, title: title, category: catid});
        Step(
            function saveRoom() {
                room.save(this);
            },
            function removeOldRooms(err) {
                if(err) throw err;
                var next = this;
                Room
                .where('category', catid)
                .where('messageCount').gt(0)
                .sort('lastMessageDate')
                .exec(function(err, rooms) {
                    if(err || !rooms) error(err);
                    if(rooms.length <= roomsPerCategory) {
                        next();
                    } else {
                        var numOfRoomsToRemove = rooms.length - roomsPerCategory;
                        rooms.slice(0, numOfRoomsToRemove).forEach(function(room) { room.remove(); });
                        next();
                    }
                });
            },
            function removeOldEmptyRooms(err) {
                if(err) throw err;
                var next = this;
                Room
                .where('category', catid)
                .where('messageCount', 0)
                .where('creationDate').lt(new Date(Date.now() - maxLifeEmptyRoom))
                .exec(function(err, rooms) {
                    if(err || !rooms) error(err);
                    rooms.forEach(function(room) { room.remove(); });
                    next();
                });
            },
            function redirect(err) {
                if(err) throw err;
                res.redirect(app.routes.url("chat.index", {"catid": catid, "roomid": room.id }));
            },
            error
        );
    };

    return actions;
}
