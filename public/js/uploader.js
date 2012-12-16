
function loadUploader(app) {
    
    var dragndropEnabled = false;
    var lastTimeUpload = 0;

    var uploader = app.browseButton.fineUploader({
        autoUpload: true,
        multiple: false,
        maxConnections: 1,
        request: {
            endpoint: app.UP_URL,
            forceMultipart: false
        },
        validation: {
            sizeLimit: app.MAX_FILE_SIZE
        },
        text: {
            uploadButton: 'Upload a file'
        },
        template: '<div class="qq-uploader span12">' +
                    '<div class="qq-upload-button btn btn-success" style="width: auto;">{uploadButtonText}</div>' +
                    '<div class="uplaod-info">1GB max every 6 hours. Must wait 30s between each file.</div>' +
                    '<ul class="qq-upload-list" style="margin-top: 10px; text-align: center;"></ul>' +
                  '</div>',
        classes: {
            success: 'alert alert-success',
            fail: 'alert alert-error'
        },
        failedUploadTextDisplay: {
            mode: 'custom',
            maxChars: 40,
            responseProperty: 'error',
            enableTooltip: true
        },
        debug: true
    })
    .on('submit', function(event, id, filename) {
        $(this).fineUploader('setParams', { cookie: document.cookie, fileid: id });
    })
    .on('upload', function(event, id, filename) {
        window.onbeforeunload = warningWhenQuit;
    })
    .on('cancel', function(event, id, fileName) {
        window.onbeforeunload = null;
    })
    .on('error', function(event, id, filename, reason) {
        window.onbeforeunload = null;
    })
    .on('complete', function(event, id, filename, responseJSON){
        window.onbeforeunload = null;
    });

    var warningWhenQuit = function() {
        return 'You are currently uploading a file.\nLeaving now will cause the file to be removed from the room.';
    };
    
}

