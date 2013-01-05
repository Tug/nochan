
var upm = require('upload-middleware');

module.exports = function(app) {

    var express = app.libs.express;
    
    return {
        urls : [
            ["/",                               "index.index",          "get"  ],
            ["/:catid",                         "category.index",       "get"  ],
            ["/:catid",                         "category.createRoom",  "post" , express.bodyParser()],
            ["/:catid/:roomid",                 "chat.index",           "get"  ],
            ["/:catid/:roomid/upload",          "file.upload",          "post" , [upm.upload, "session.load"],
                                                                                 [upm.errorHandler] ],
            ["/download/:servername/:filename", "file.download",        "get"  ],
        ]
        
      , ios : [
            ["/chat",                           "chat.socket",          "io"   ],
            ["/file",                           "file.socket",          "io"   ],
        ]
    };

}

