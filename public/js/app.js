
$(document).ready(function() {

    var roompath = document.location.pathname;
    var roomid = roompath.substring(roompath.lastIndexOf('/')+1);
    var nextmsgnum = 1;
    
    function atBottom() {
        return (document.body.scrollHeight - document.body.scrollTop) == document.body.clientHeight;
    }
    
    var app = {

        ROOMID          : roomid,
        MAX_MSG_LEN     : 3000,
        MAX_USR_LEN     : 50,
        MAX_ROOMID_LEN  : 64,
        UP_URL          : '/r/'+roomid+'/upload',
        DOWN_URL        : '/download/',
        MAX_FILE_SIZE   : 1000 * 1024 * 1024, // 1000 MB
        msgCount        : 0,

        username        : 'Anonymous',

        messageBox          : $('#messageBox'),
        nameBox             : $('#nameBox'),
        messagesBox         : $('#messagesBox'),
        submitMessageButton : $('#submitMessageButton'),
        fileList            : $('#fileList'),
        browseButton        : $('#upFile'),
        uploadedFileBox     : $('#uploadedFile'),
        renameButton        : $('#renameButton'),
        fileContainer       : $('#fileContainer'),
        enterToSendCheckBox : $('#enterToSend'),
        
        showWelcomeMessage: function() {},
        
        addMessageToUl: function(msg) {
            var wasAtBottom = atBottom();
            app.messagesBox.append('<li>'+msg+'</li>');
            if(wasAtBottom) {
                document.body.scrollTop = app.messagesBox.get(0).scrollHeight;
            }
        },

        showMessage: function(msg) {
            app.msgCount = msg.num;
            var msgStr = '<div class="messageHeader">';
            msgStr += '<span class="nickname">'+common.htmlentities(msg.username)+'</span>';
            msgStr += ' - '+common.dateStr(msg.date);
            if(msg.num) {
                msgStr += ' - <span class="message-num">No.'+msg.num+'</span>';
            }
            msgStr += '</div><div class="message">';
            var file = msg.attachment;
            if(file) {
                file.url = app.DOWN_URL+file.servername+'/'+encodeURIComponent(file.originalname);
                msgStr += common.formatFile(file);
            }
            msgStr += common.processMessage(msg.body);
            msgStr += '</div>';
            app.addMessageToUl(msgStr);
            if(file && file.status == 'Uploading') {
                app.watchFile(file);
            }
        },

        showSystemMessage: function(msg) {
            app.addMessageToUl('* ' + msg);
        },

        setUsers: function(newusers) {},
        userJoined: function(newuser) {},
        userLeft: function(olduser) {},

        userRenamed: function(obj) {
            var oldname = obj.oldname;
            var newname = obj.newname;
            if(oldname == app.username) {
                var msg = "You are now known as "+common.htmlentities(newname)+".";
                app.username = newname;
                app.nameBox.val(newname);
                app.showSystemMessage(msg);
            }
        },

        updateFileStatus: function(file) {
            $('#c'+file.servername+'status').html(file.status);
            if(file.status == 'Uploading' && file.percent >= 0) {
                $('#c'+file.servername+'progress').html(file.percent+'%');
            } else {
                $('#c'+file.servername+'progress').html('');
            }
            if(file.status == 'Removed') {
                $('#c'+file.servername+'link').removeAttr('href');
            }
        },
  
        notifyMessage: function(msg) {
            if(userAway) {
                unreadMessages++;
                $.titleAlert("(+"+unreadMessages+") "+originalTitle, {
                    requireBlur: false,
                    stopOnFocus: true,
                    interval: 1500
                });
            }
        }
        
    }

    var userAway = false;
    var unreadMessages = 0;
    var originalTitle = document.title;
    
    // when the user goes idle
    $(document).bind("idle.idleTimer", function(){
        userAway = true;
    });

    // when the user becomes active again
    $(document).bind("active.idleTimer", function(){
        userAway = false;
        document.title = originalTitle;
        unreadMessages = 0;
    });
  
    $.idleTimer(5000);

    runChatClient(app);
    runFileClient(app);

})

