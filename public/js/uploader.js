
function loadUploader(app) {
  
    var fileList = loadFileList(app.fileList);
    var dragndropEnabled = false;

    var uploader = new plupload.Uploader({
	      runtimes : 'gears,browserplus,html4,flash,silverlight,html5', // html5 + multipart is not supported in Webkit
	      max_file_size : app.MAX_FILE_SIZE,
	      browse_button : app.browseButton.attr('id'),
        drop_element: app.fileList.attr('id'),
	      unique_names : true,
	      multipart: true,
        multi_selection: false,
	      url : app.UP_URL,
	      flash_swf_url : app.PLUPLOAD_ROOT+'plupload.flash.swf',
	      silverlight_xap_url : app.PLUPLOAD_ROOT+'plupload.silverlight.xap',
	      multipart_params: { cookie: document.cookie }
    });

    var warningWhenQuit = function() {
        return 'You are currently uploading a file.\nLeaving now will cause the file to be removed from our server.';
    };

    uploader.bind('Init', function(up, params) {
        $('#runtimeInfo').html("Current runtime: " + params.runtime);
        dragndropEnabled = (params.runtime in ['gears','browserplus','html5']);
    });
    
    uploader.bind('FilesAdded', function(up, files) {
        fileList.clear();
        files.forEach(fileList.add);
        up.refresh(); // Reposition Flash/Silverlight
    });

    uploader.bind('QueueChanged', function(up) {
        if(up.files.length > 0 && uploader.state != 2) {
            uploader.start();
        }
    });

    uploader.bind('FilesRemoved', function(up, files) {
        files.forEach(fileList.remove);
        up.refresh();
    });
    
    uploader.bind('UploadFile', function(up, file) {
        fileList.update(file);
    });

    uploader.bind('UploadProgress', function(up, file) {
        file.bytesPerSec = up.total.bytesPerSec;
        fileList.update(file);
    });

    uploader.bind('BeforeUpload', function(up, file) {
        up.settings.multipart_params.filesize = file.size;
        up.settings.multipart_params.fileid = file.id;
        window.onbeforeunload = warningWhenQuit;
    });
    
    uploader.bind('FileUploaded', function(up, file, res) {
        if(res.response != "ok") {
           alert('Error while uploading '+file.name+': '+res.response);
        } else {
            file.percent = 100;
            fileList.update(file);
        }
        window.onbeforeunload = null;
    });

    uploader.bind('Error', function(up, err) {
        console.log('Error', err);
        //alert('Error : '+err.message);
        up.refresh(); // Reposition Flash/Silverlight
    });

    uploader.init();

    $(window).resize(function() {
        uploader.refresh();
    });
    
    return uploader;
}



function loadFileList(fileList) {
  
    function getStatusString(status) {
        switch(status) {
            case plupload.QUEUED: return "Queued";
            case plupload.UPLOADING: return "Uploading";
            case plupload.FAILED: return "Failed";
            case plupload.DONE: return "Done";
        }
        return "";
    }
    var lastStatus = -1000;
    
    return {
        add : function(file) {
            fileList.html('<li id="'+file.id+'">'
                          +'<ul class="fileitem">'
                            +'<li class="filenamefield">'
                              +'<span class="label label-info">'+file.name+'</span>'
                            +'</li>'
                            +'<li class="filestatusfield">'
                              +'<span id="'+file.id+'status" class="label">Queued</span>'
                            +'</li>'
                           +'</ul>'
                          +'</li>');
        },

        remove: function(file) {
            $('#'+file.id).remove();
        },

        update : function(file) {
            if(file.bytesPerSec)
                $('#uploadSpeedValue').html(readableSize(file.bytesPerSec)+'/s');
            if(file.status != lastStatus) {
                lastStatus = file.status;
                var statusStr = getStatusString(file.status);
                $('#'+file.id+'status').html(statusStr);
                $('#'+file.id+'status').removeClass('label-success');
                $('#'+file.id+'status').removeClass('label-info');
                $('#'+file.id+'status').removeClass('label-important');
                switch(file.status) {
                    case plupload.QUEUED:
                        break;
                    case plupload.UPLOADING:
                        $('#'+file.id+'status').addClass('label-warning');
                        break;
                    case plupload.FAILED:
                        $('#'+file.id+'status').addClass('label-important');
                        break;
                    case plupload.DONE:
                        $('#'+file.id+'status').addClass('label-success');
                        break;
                }
            }
        },
        
        clear : function() {
            fileList.html('');
        }
      
    };
  
}

