"use strict"
// to check if the camera status is initialised or not
let cameraStatus = false;

function cameraErrorCallback(error)
    {
        //displayElementsWithClass("cameraValue", false);
        console.log("Camera error: ", error);
    }

function stopCamera()
{
    if(cameraStatus)
    {
        let videoElem = document.getElementById("cameraVideo");
        let stream = videoElem.srcObject;
        let tracks = stream.getTracks();

        tracks.forEach(function(track) {
          track.stop();
        });

      videoElem.srcObject = null;
      cameraStatus = false;
    }
}

function initialiseCamera()
{
    if(!cameraStatus)
    {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
        {
            cameraErrorCallback("enumerateDevices() not supported.");
            return;
        }

        // Support different browsers
        navigator.getUserMedia = navigator.getUserMedia ||
                                 navigator.webkitGetUserMedia ||
                                 navigator.mozGetUserMedia ||
                                 navigator.msGetUserMedia;

        var videoDevices = [];
        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            devices.forEach(function (device) {

                if (device.kind == "videoinput") {
                    videoDevices.push(device);
                }
            });
        }).then(function() {
            var deviceId = videoDevices[videoDevices.length - 1].deviceId;

            var constraints = {
                audio:false,
                video: {
                    deviceId: deviceId
                },
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then(function(mediaStream) {
                    var videoElement = document.querySelector("video");
                    videoElement.srcObject = mediaStream;
                    videoElement.onloadedmetadata = function(e) {
                        videoElement.play();
                    };
                    // displayElementsWithClass("cameraError", false);
                })
                .catch(function(err) {
                    cameraErrorCallback(err);
                });
        });
        cameraStatus = true;
      }
}
