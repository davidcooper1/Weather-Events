var fs = require("fs");
var csv = require("csvtojson");

async function createLocationsJSON() {
	var files = fs.readdirSync("./data/");
	var jsonArray = [];
	for (var i = 0; i < files.length; i++) {
		if (files[i].startsWith("StormEvents_locations")) {
			var fileJson = csv().fromFile(files[i]);
			jsonArray = jsonArray.concat(fileJson);
		}
	}
	return jsonArray;
}