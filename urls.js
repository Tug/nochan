
var upm = require('upload-middleware');

module.exports = function(app) {
    
    return {
        urls : [
            ["/",                               "index.index",          "get"  ],
            ["/:catid",                         "category.index",       "get"  ],
            ["/:catid",                         "category.createRoom",  "post" ],
            ["/:catid/:roomid",                 "chat.index",           "get"  ],
            ["/:catid/:roomid/upload",          "file.upload",          "post" , [upm.upload, "session.load"],
                                                                                 [upm.errorHandler] ],
            ["/download/:servername/:filename", "file.download",        "get"  ],
        ]
        
      , ios : [
            ["/chat",                           "chat.socket",          "on.connection"   ],
            ["/file",                           "file.socket",          "on.connection"   ],
        ]
    };

}

