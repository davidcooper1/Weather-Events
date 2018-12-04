var fs = require("fs");

function readCWD() {
	var files = fs.readdirSync("");
	console.log(files);
}