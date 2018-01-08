function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {    
    var btnloc = document.getElementById("location");
    btnloc.addEventListener("click", map ,false);
    document.getElementById("createFile").addEventListener("click", createFile);
    document.getElementById("writeFile").addEventListener("click", writeFile);
    document.getElementById("readFl").addEventListener("click", readFl);
    document.getElementById("removeFile").addEventListener("click", removeFile);
}


 $.ajax({
            url: "http://api.weatherunlocked.com/api/current/36.050845,14.267482?app_id=60699ace&app_key=dc9f0fbd88ee849547c1d63e3dfa2a5d",
            type: "GET",
            accept:"text/json",
            success: function (parsedResponse, statusText, jqXhr) {

                console.log(parsedResponse);
                var weatherShow = "<p><img src='http://www.weatherunlocked.com/Images/icons/1/" + parsedResponse["wx_icon"] + "' />" + parsedResponse["wx_desc"] + "</p><p>Temperature: " + parsedResponse["temp_c"] + "<sup>o</sup>C</p>";
                $("#weatherInfo").html(weatherShow);

            },
            error: function (error) {

                console.log(error);
            }
        });




//camera v2 saves to file
 $("#camera2").click(function() {
        navigator.camera.getPicture(cameraSuccess, cameraFail, { quality: 100,
        destinationType: Camera.DestinationType.DATA_URL});
        var btnTakePicture2 = document.getElementById("captureImage");
        btnTakePicture2.addEventListener("click", onTakePictureBtnClick2, false);
        
        
    });
    


    function cameraSuccess(imageData) {
        //imageData contains base64 data of the image
        //call writeFile and send base64 data
        writePic(imageData);         
        var imgPicture2 = document.getElementById("myImage");
        imgPicture2.src = "data:image/jpeg;base64," + imageData;
       
    }

    function cameraFail(message) {
        alert('Camera Failed because: ' + message);
    }



    function writePic(imageData) {
        //get access to Persistent file storage
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            var blob = new Blob([imageData], { type: 'image/jpg' });
            var d = new Date();
            //setting filename according to date
            var fileName = d.getDay() + "-" + d.getMonth() + "-" + d.getYear() + "-" + d.getHours() + "-" + d.getMinutes() + "-" +  d.getSeconds() + ".jpg";
            
            
            function onTakePictureBtnClick2() {
                navigator.camera.getPicture(onSuccess, onFailure, {
                    quality: 100,
                    destinationType: Camera.DestinationType.DATA_URL
                });
            }
        
             fs.root.getDirectory("RedWolfApp", {create: true, exclusive: false}, function(dir){
                alert(dir.fullPath);
                    dir.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {                
                          fileEntry.createWriter(function (fileWriter) {

                            //when the file is written...
                            fileWriter.onwriteend = function() {
                                alert("Successful file write...");
                                //read file straight away
                                readFile(fileName);
                            };

                            //file write error
                            fileWriter.onerror = function (e) {
                                alert("Failed file write: " + e.toString());
                            };

                            //write in fileName
                            fileWriter.write(blob);
                        });
                
                }, errorCallback);
            }, errorCallback);
        
        }, errorCallback);
    }
    
   function readFile(fileName) {
       //alert('reading..');
       window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            fs.root.getDirectory("RedWolfApp", {create: true, exclusive: false}, function(dir){
                alert(dir.fullPath);
                    dir.getFile(fileName, {}, function(fileEntry) {
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                        
                        var elem = document.getElementById('myImage');
                        elem.src = "data:image/jpeg;base64," + this.result;
                    };

                    reader.readAsBinaryString(file);

                 }, errorCallback);
            }, errorCallback);
         },errorCallback);
        },errorCallback); 
   }


    function errorCallback(error) {
        alert("File error: " + error.message + "Code: " + error.code);
    }

//geolocation
function map(){
        document.addEventListener("deviceready", function(){
        navigator.geolocation.getCurrentPosition(function(position){   
            var mapProp = {center:new google.maps.LatLng(position.coords.latitude,position.coords.longitude), zoom:5, mapTypeId:google.maps.MapTypeId.ROADMAP};
            var map=new google.maps.Map(document.getElementById("googleMap"), mapProp);
            var marker=new google.maps.Marker({position:new google.maps.LatLng(position.coords.latitude,position.coords.longitude)});
            marker.setMap(map);
            }, function(error){
                if(error.code == PositionError.PERMISSION_DENIED)
                {
                    alert("No permission to use GPS, please allow app to use the GPS");
                }
                else if(error.code == PositionError.POSITION_UNAVAILABLE)
                {
                    alert("GPS not allowed in this device");
                }
                else if(error.code == PositionError.TIMEOUT)
                {
                    alert("Its taking too long to find user location");
                }
                else
                {
                    alert("An unknown error occured");
                }
            }, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
        }, false);

}











//file create, modify & delete


function createFile() {
   var type = window.TEMPORARY;
   var size = 7*1024*1024;
   window.requestFileSystem(type, size, successCallback, errorCallback);

   function successCallback(fs) {
      fs.root.getFile('log.txt', {create: true, exclusive: true}, function(fileEntry) {
         alert('File creation successfull!');
      }, errorCallback);
   }

   function errorCallback(error) {
      alert("ERROR: " + error.code);
   }
	
}



function writeFile() {
   var type = window.PERSISTENT;
   var size = 5*1024*1024;
   window.requestFileSystem(type, size, successCallback, errorCallback);

   function successCallback(fs) {
       fs.root.getDirectory("newDir", {create: true, exclusive: false}, function(dir){
           alert(dir.fullPath);
           dir.getFile('log.txt', {create: true}, function(fileEntry) {          
             fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function(e) {
                   alert('Write completed x.');
                };

                fileWriter.onerror = function(e) {
                   alert('Write failed: ' + e.toString());
                };
                 
                 var logtext = document.getElementById('textarea').value;
                 alert(logtext);

                var blob = new Blob([logtext], {type: 'text/plain'});
                fileWriter.write(blob);
             }, errorCallback);
          }, errorCallback);
       }, errorCallback);

   }

   function errorCallback(error) {
      alert("ERROR: " + error.code);
   }
}

function readFl() {
   var type = window.PERSISTENT;
   var size = 7*1024*1024;
   window.requestFileSystem(type, size, successCallback, errorCallback);

   function successCallback(fs) {
       fs.root.getDirectory("newDir", {create: true, exclusive: false}, function(dir){
           alert(dir.fullPath);
      dir.getFile('log.txt', {}, function(fileEntry) {

         fileEntry.file(function(file) {
            var reader = new FileReader();

            reader.onloadend = function(e) {
               var txtArea = document.getElementById('textarea');
               txtArea.value = this.result;
            };
            reader.readAsText(file);
         }, errorCallback);
      }, errorCallback);
      }, errorCallback);
   }

   function errorCallback(error) {
      alert("ERROR: " + error.code);
   }
}

function removeFile() {
   var type = window.TEMPORARY;
   var size = 5*1024*1024;
   window.requestFileSystem(type, size, successCallback, errorCallback);

   function successCallback(fs) {
      fs.root.getFile('log.txt', {create: false}, function(fileEntry) {

         fileEntry.remove(function() {
            alert('File removed.');
         }, errorCallback);
      }, errorCallback);
   }

   function errorCallback(error) {
      alert("ERROR: " + error.code);
   }
}	


function myEventHandler() {
    "use strict" ;

    var ua = navigator.userAgent ;
    var str ;

    if( window.Cordova && dev.isDeviceReady.c_cordova_ready__ ) {
            str = "It worked! Cordova device ready detected at " + dev.isDeviceReady.c_cordova_ready__ + " milliseconds!" ;
    }
    else if( window.intel && intel.xdk && dev.isDeviceReady.d_xdk_ready______ ) {
            str = "It worked! Intel XDK device ready detected at " + dev.isDeviceReady.d_xdk_ready______ + " milliseconds!" ;
    }
    else {
        str = "Bad device ready, or none available because we're running in a browser." ;
    }

    alert(str) ;
}




//display first 10 photos that comes up in the search.
        $(function() {
            $("#search_photo").click(function() {
                topPhotos($("#keyword").val());
            });
        });
        
        function topPhotos(keyword) {
            
            $.ajax({
                url: "https://api.unsplash.com/search/photos/?client_id=d8d66749b3b92cf219d6bc4499069115b28dd94e76cb2c7f54ae132b2efae0e1&query="+keyword,
                type: "GET",
                accept:"text/json",
                success: function (parsedResponse, statusText, jqXhr) {

                    console.log(parsedResponse);
                    for (var i = 0; i < 10; i++) { 
                        var url = parsedResponse["results"][i]["urls"]["regular"];
                        $("#pic"+(i+1)+" img").attr("src", url);
                        $("#pic"+(i+1)+" p").html(parsedResponse["results"][i]["description"]);
                    }
                    
                    

                },
                error: function (error) {

                    console.log(error);
                }
            });
        }

