(function(window) {
	var app = angular.module("hamrSJ", []);

	// Controller for recorder
	app.controller("SJController", function() {
		this.appName = "SawaalJawaab";
	});

	app.controller("SegmentationController", function() {
		this.doSeg = function() {
			console.log("Start doing segmentation ....");
			var fd = new FormData(); 

            $.ajax({
                type: "POST",
                url: "http://127.0.0.1:5000/do_seg",
                data: fd,
                processData: false,
                contentType: false
            }).done(function(data) {
                seg_info = data;
                // playBackWithDelay();
                console.log(seg_info);
            });
		};
	});

	app.controller("RecordController", function($scope,$timeout) {
		this.recording = false;

		////////////////////////////////////////////////////////////////////////////

		// setting up the filesystem api
		//window.requestFileSystem = 

		// seeting up the for the recorder
		var navigator = window.navigator;
		navigator.getUserMedia = (
			navigator.getUserMedia ||
	  		navigator.webkitGetUserMedia ||
	    	navigator.mozGetUserMedia ||
	    	navigator.msGetUserMedia
			);
		var Context = window.AudioContext || window.webkitAudioContext;
		var context = new Context();

		// we need these variables for later use with the stop function
		var mediaStream;
		var rec;

		var record =function() {

                    $("#recordingInfo").html("Recording ...");
                    
                    console.log("Started Recording!");
                    console.log(new Date().getTime());
                    // ask for permission and start recording
		  	navigator.getUserMedia({audio: true}, function(localMediaStream){
		    mediaStream = localMediaStream;

		    // create a stream source to pass to Recorder.js
		    var mediaStreamSource = context.createMediaStreamSource(localMediaStream);

		    // create new instance of Recorder.js using the mediaStreamSource
		    rec = new Recorder(mediaStreamSource, {
		      // pass the path to recorderWorker.js file here
		      workerPath: '/bower_components/recorderjs/recorderWorker.js'
		    });

		    // start recording
		    rec.record();
		  }, function(err){
		    console.log('Browser not supported');
		  });
		};

		var stopRec = function() {
		  // stop the media stream
		  mediaStream.stop();

		  // stop Recorder.js
		  rec.stop();                

		    document.getElementById("recordingInfo").innerHTML = "Computing...  <img src=\"images/computing.gif\" alt=\"Computing... \" style=\"width:50px;height:14px;\">";

		  // export it to WAV
		  rec.exportWAV(function(e){
		    rec.clear();
                    
                    var fd = new FormData();
                    
                    fd.append('data', e);
                    $.ajax({
                        type: "POST",
                        url: "http://127.0.0.1:5000/do_seg",
                        data: fd,
                        processData: false,
                        contentType: false
                    }).done(function(data) {
                        console.log("Got the callback!!");
                        seg_info = data;
                	// playBackWithDelay();
                	console.log(seg_info);

                        // Update data visualization
		        updateData();
                    });
                    //console.log(e.slice(0));
		    //Recorder.forceDownload(e, "filename.wav");
		  });

		};


		///////////////////////////////////////////////////////////////////////////////////////////////////////////
		// functions for the template
		this.isRecording = function() {
			return this.recording;
		};

		this.startRecording = function() {
			console.log("Recording ....");
			this.recording = true;
			//$("#recordingInfo").html("Waiting for next sam (downbeat) to start recording...");
                        document.getElementById("recordingInfo").innerHTML = "Recording...  <img src=\"images/recording.gif\" alt=\"Recording... \" style=\"width:50px;height:14px;\">";

			$timeout(record, 0);
		};

		this.stopRecording = function(callback) {
			console.log("Recording Stopped ....");
			this.recording = false;
			stopRec();

                        // Update recordingInfo
                        document.getElementById("recordingInfo").innerHTML = "Recording finished. Click and hold to record again.";
		};
	});

	app.controller("TempoController", function() {
		this.tempo = 100;
	});

})(window);


function checkTime() {
    console.log("check time", nextSamaTime - new Date().getTime(), new Date().getTime());
}
