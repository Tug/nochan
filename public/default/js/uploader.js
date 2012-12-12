
function loadUploader(app) {
    
    var uploader = new plupload.Uploader({
	      runtimes : 'html5,flash,gears,silverlight,browserplus,html4',
	      max_file_size : app.MAX_FILE_SIZE,
	      browse_button : app.browseButton.attr('id'),
	      container: app.uploadModal.attr('id'),
	      unique_names : true,
	      multipart: true,
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
    });

    uploader.bind('QueueChanged', function(up) {
        if(up.files.length > 0 && uploader.state != 2) {
            uploader.start();
        }
    });

    uploader.bind('BeforeUpload', function(up, file) {
        up.settings.multipart_params.filesize = file.size;
        up.settings.multipart_params.fileid = file.id;
        window.onbeforeunload = warningWhenQuit;
    });
    
    uploader.bind('FileUploaded', function(up, file, res) {
        if(res.response != "ok") {
            alert(res.response);
        } else {
            file.percent = 100;
        }
        window.onbeforeunload = null;
    });

    uploader.bind('Error', function(up, err) {
        alert('Error for '+err.file.name+' : '+err.message);
        up.refresh(); // Reposition Flash/Silverlight
    });

    uploader.init();

    return uploader;
}

