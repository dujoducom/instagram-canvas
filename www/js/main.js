var canvas, stage;

var mouseTarget;	// the display object currently under the mouse, or being dragged
var dragStarted;	// indicates whether we are currently in a drag operation

var dragging = false;

var offset;
var update = true;



var canvasW, canvasH;
var imageContainer;

// load the config file with client ID for instagram API
// Rename SAMPLE_config.json to config.json, replace the text
// with your instagram app client id
var config = window.config;

// load the config file with client ID for instagram API
var clientID = config.client_id;
var tracked_tag = config.tag;


var addEvent = function(elem, type, eventHandle) {
    if (elem == null || typeof(elem) == 'undefined') return;
    if ( elem.addEventListener ) {
        elem.addEventListener( type, eventHandle, false );
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandle );
    } else {
        elem["on"+type]=eventHandle;
    }
};

function setupCanvas() {
	canvas.width = document.body.clientWidth; //document.width is obsolete
    canvas.height = document.body.clientHeight; //document.height is obsolete
    canvasW = canvas.width;
    canvasH = canvas.height;
}

function resizeEvent() {
	
	setupCanvas();
	
	stageCenterW(imageContainer);
	stageCenterH(imageContainer);

	console.log("HEY");
	stage.update();

}

function init() {


	if (window.top != window) {
		document.getElementById("header").style.display = "none";
	}
	document.getElementById("loader").className = "loader";
	
	// create stage and point it to the canvas:
	canvas = document.getElementById("instaCanvas");

	setupCanvas();

 

    addEvent(window, "resize", resizeEvent);

	//check to see if we are running in a browser with touch support
	stage = new createjs.Stage(canvas);
	createjs.Touch.enable(stage);
	
	// enable touch interactions if supported on the current device:
	createjs.Touch.enable(stage);

	// enabled mouse over / out events
	stage.enableMouseOver(10);
	stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

	// setup background
	var bg = new createjs.Shape();
	bg.graphics.beginFill("#ddd");
	bg.graphics.drawRect(0,0,canvasW,canvasH);
	bg.graphics.endFill();
	
	imageContainer = new createjs.Container();

	stage.addChild(bg);

	createjs.Ticker.addEventListener("tick", stage);
	createjs.Ticker.setFPS(30);

	stage.update();

	var tag = tracked_tag; // pulled from config.json
	var request_url = "https://api.instagram.com/v1/tags/"+tag+"/media/recent?client_id=" + clientID; 
	var manifest = [];
	var frameLoader = new createjs.LoadQueue(false);
	
	frameLoader.on("fileload", handleFrameLoad, this);
	frameLoader.on("complete", handleFrameComplete, this);

	$.ajax({
		type: "GET",
		dataType: "jsonp",
		cache: false,
		url: request_url,
		success:  function(data) {
		 	
		 	console.log(data);
		 	var r = 0;
		 	var c = 0;

		 	$.each(data.data, function(i, item) {
		 		if(i > 0) {
			 		if((i % 5) == 0) {
			 			console.log("ROW");
			 			r++; c=0;
			 		}
		 		}

		 		console.log(item.images.standard_resolution.url);
		 		var s = item.images.low_resolution.url;
		 		var id = item.id;
		 		manifest.push({src:s, id:id, data:{r:r, c:c}})
				

		 		c++;

		 		
		 	});

		 	frameLoader.loadManifest(manifest);
			
		}
	});

}

function handleFrameLoad(data) {
	
	console.log(data);
	
	var image = data.result;
	var i = data.item;
	
	var c = i.data.c;
	var r = i.data.r;
	var scale = 0.6;

	
	var b = new createjs.Bitmap(i.src);
	
	console.log(c);
	
	b.x = image.width * c * scale;
	b.y = image.height * r * scale;
	b.scaleX = b.scaleY = scale;
	
	imageContainer.addChild(b);

}

function handleFrameComplete(data) {
	
	stageCenterW(imageContainer);
	stageCenterH(imageContainer);

	stage.addChild(imageContainer);

}

function stageCenterW(container) {
	var b = container.getBounds();
	container.x = (canvas.width - b.width) / 2;
}

function stageCenterH(container) {
	var b = container.getBounds();
	container.y = (canvas.height - b.height) / 2;
}