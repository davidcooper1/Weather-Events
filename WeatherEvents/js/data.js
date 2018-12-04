// This script will download the NOAA's NWS Storm Events Database as multiple CSV files.

var Client = require("ftp");
var fs = require("fs");
var zlib = require("zlib");

var c = new Client();
var download = false;
c.on("ready", () => {
	if (download) {
		c.cwd("pub/data/swdi/stormevents/csvfiles/", (err, cwd) => {
			if (err) throw err;
		});
		c.list((err, list) => {
			if (err) throw err;
			fileList = list;
			getLocationAndFatalityFiles(c, list);
			c.end();
		});
	} else {
		c.end();
	}
});

c.on("end", () => {
	
});

c.connect({
	host: "ftp.ncdc.noaa.gov"
});

function getLocationAndFatalityFiles(c, list) {
	var totalNeeded = 0;
	var totalDownloaded = 0;
	var dataFiles = fs.readdirSync("./data/");
	for (var i = 0; i < list.length; i++) {
		var fileName = list[i].name;
		if (fileName.startsWith("StormEvents_details") || fileName.startsWith("StormEvents_fatalities")) {
			if (dataFiles.includes(fileName.substring(0, fileName.length - 3)) && 
				fs.statSync("./data/" + fileName.substring(0, fileName.length -3)).mtimeMs > list[i].date) {
					console.log("OLD");
					continue;
			}
			totalNeeded++;
			let fn = fileName;
			c.get(fn, (err, stream) => {
				if (err) throw err;
				var gunzip = zlib.createGunzip();
				var toDelay = null;
				function setDelay() {
					toDelay = setTimeout(() => {
						stream.end();
					}, 1000);
				}
				stream.once("close", () => { 
					console.log(fn + " done.");
					totalDownloaded++;
					updateProgressBar(totalDownloaded, totalNeeded);
				});
				stream.on("data", (chunk) => { 
					clearTimeout(toDelay);
					setDelay();
				});
				stream.pipe(gunzip).pipe(fs.createWriteStream("data/" + fn.substring(0, fn.length-3)));
				return;
			});
		}
	}
}

function updateProgressBar(current, total) {
	var percentComplete = Math.round((current / total) * 100) + "%";
	$("#downloadbar").css("width", percentComplete);
	$("#downloadbar").html(percentComplete);
}

function getDateLastModified(list) {
	var lastMod = 0;
	for (var i = 0; i < list.length; i++) {
		if (list[i].date.getTime() > lastMod) {
			lastMod = list[i].date.getTime();
		}
	}
	return lastMod;
}