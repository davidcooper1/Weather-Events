// This script will download the NOAA's NWS Storm Events Database as multiple CSV files.

var Client = require("ftp");
var fs = require("fs");
var zlib = require("zlib");

var c = new Client();
c.on("ready", () => {
	c.cwd("pub/data/swdi/stormevents/csvfiles/", (err, cwd) => {
		if (err) throw err;
	});
	c.list((err, list) => {
		if (err) throw err;
		fileList = list;
		getLocationAndFatalityFiles(c, list);
		c.end();
	});
});

c.on("end", () => {
	
});

c.connect({
	host: "ftp.ncdc.noaa.gov"
});

function getLocationAndFatalityFiles(c, list) {
	for (var i = 0; i < list.length; i++) {
		var fileName = list[i].name;
		if (fileName.startsWith("StormEvents_locations") || fileName.startsWith("StormEvents_fatalities")) {
			let fn = fileName;
			c.get(fn, (err, stream) => {
				if (err) throw err;
				var gunzip = zlib.createGunzip();
				var toDelay = null;
				function setDelay() {
					toDelay = setTimeout(() => {
						stream.end();
					}, 100);
				}
				stream.once("close", () => { console.log(fn + "done.") });
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

function getDateLastModified(list) {
	var lastMod = 0;
	for (var i = 0; i < list.length; i++) {
		if (list[i].date.getTime() > lastMod) {
			lastMod = list[i].date.getTime();
		}
	}
	return lastMod;
}