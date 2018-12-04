var fs = require("fs");
var csv = require("csvtojson");

async function readDetailsCSV() {
	var files = fs.readdirSync("./data/");
	var jsonArray = [];
	var writeCount = 0;
	openDatabase();
	for (var i = 0; i < files.length; i++) {
		if (files[i].startsWith("StormEvents_details")) {
			var data = await csv({noheader:true, output: "csv" }).fromFile("./data/" + files[i]);
			for (var j = 0; j < data.length; j++) {
				addLocation(data[j][14], data[j][9], data[j][13], data[j][15], data[j][8]);
				console.log(new Date(data[j][17]).getTime());
				addEvent(data[j][7], data[j][6], data[j][12], data[j][27], data[j][24],
					new Date(data[j][17]).getTime(), new Date(data[j][19]).getTime(), data[j][14],
					data[j][9]);
/* 				writeCount++;
				if (writeCount > 1000) {
					closeDatabase();
					openDatabase();
					writeCount = 0;
				} */
			}
			console.log(files[i]);
		}
	}
	closeDatabase();
}

function locationList() {
	openDatabase();
	getLocationList();
	closeDatabase();
}

function eventList() {
	openDatabase();
	getEventList();
	closeDatabase();
}