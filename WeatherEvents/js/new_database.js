const sqlite3 = require("sqlite3").verbose();
const csv = require("csvtojson");
const fs = require("fs");

function createTables() {
	var db = new sqlite3.Database("./db/Storm.db");
	db.serialize(() => {
		db.run(
			"CREATE TABLE IF NOT EXISTS locations (\
				cz_fips			INTEGER,\
				state_fips		INTEGER,\
				cz_type			TEXT,\
				cz_name			TEXT,\
				state_name		TEXT,\
				PRIMARY KEY(cz_fips, state_fips)\
			);", [], (err) => {
				console.log("Weather Events table created!");
		}).run(
			"CREATE TABLE IF NOT EXISTS weather_events (\
				event_id		INTEGER,\
				episode_id		INTEGER,\
				type			TEXT,\
				magnitude		REAL,\
				property_damage	TEXT,\
				start_date		INTEGER,\
				end_date		INTEGER,\
				cz_fips			INTEGER,\
				state_fips		INTEGER,\
				PRIMARY KEY (event_id),\
				FOREIGN KEY (cz_fips, state_fips) references locations\
			);", [], (err) => {
				console.log("Location table created!");
		}).run(
			"CREATE TABLE IF NOT EXISTS fatalities (\
				fatality_id		INTEGER,\
				event_id		INTEGER,\
				f_type			TEXT,\
				date			INTEGER,\
				age				INTEGER,\
				gender			TEXT,\
				PRIMARY KEY (fatality_id),\
				FOREIGN KEY (event_id) REFERENCES weather_events\
			);", [], (err) => {
				console.log("Fatality table created!");
		});
	});
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		readCSVFiles();
	});
}

function parseDetailsJson(data) {
	console.log(data);
	var rowCount = data.length;
	var rowsProcessed = 0;
	var i = 0;
	
	function updateProgressBar() {
		rowsProcessed++;
		var percentComplete = Math.floor((rowsProcessed / rowCount) * 100) + "%";
		console.log(percentComplete);
		//$("#downloadbar").css("width", percentComplete);
		//$("#downloadbar").html(percentComplete);
	}
	
	var db = new sqlite3.Database("./db/Storm.db", (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log("Connected to the user database.");
	});
	function nextRows() {
		db.parallelize(() => {
			db.run("INSERT INTO locations VALUES (?, ?, ?, ?, ?)", [data[i][14], data[i][9], data[i][13], data[i][15], data[i][8]], (err) => {
				//if (err) console.log(err.message);
			})
			db.run("INSERT INTO weather_events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [data[i][7], data[i][6], data[i][12], data[i][27],
				data[i][24], new Date(data[i][17]).getTime(), new Date(data[i][19]).getTime(), data[i][14], data[i][9]], (err) => {
				//if (err) console.log(err.message);
			});

		});
		updateProgressBar();
		closeAndRestart();
	}
	nextRows();
	
	function closeAndRestart() {
		db.close((err) => {
			if (err) {
				return console.error(err.message);
			}
			//console.log("Database connection has been closed.");
			i++;
			if (i < rowCount) {
				db = new sqlite3.Database("./db/Storm.db", (err) => {
					if (err) {
						console.error(err.message);
					}
					//console.log("Connected to the user database.");
				});
				nextRows();
			}
		});
	}
	
	
}

function parseFatalitiesJson(data) {
	console.log(data);
	var rowCount = data.length;
	var rowsProcessed = 0;
	var i = 0;
	
	function updateProgressBar() {
		rowsProcessed++;
		var percentComplete = Math.floor((rowsProcessed / rowCount) * 100) + "%";
		$("#downloadbar").css("width", percentComplete);
		$("#downloadbar").html(percentComplete);
	}
	
	var db = new sqlite3.Database("./db/Storm.db", (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log("Connected to the user database.");
	});
	function nextRows() {
		db.run("INSERT INTO fatalities VALUES (?, ?, ?, ?, ?, ?)", [data[i][3], data[i][4], data[i][5], new Date(data[i][6]).getTime(), data[i][7], data[i][8]], (err) => {
			if (err) console.log(err.message);
			updateProgressBar();
			closeAndRestart();
		});
	}
	nextRows();
	
	function closeAndRestart() {
		db.close((err) => {
			if (err) {
				return console.error(err.message);
			}
			//console.log("Database connection has been closed.");
			i++;
			if (i < rowCount) {
				db = new sqlite3.Database("./db/Storm.db", (err) => {
					if (err) {
						console.error(err.message);
					}
					//console.log("Connected to the user database.");
				});
				nextRows();
			}
		});
	}
	
	
}

function readCSVFiles() {
	var files = fs.readdirSync("./data/");
	for (var i = 0; i < files.length; i++) {
		if (files[i].startsWith("StormEvents_details")) {
			csv({output: "csv" }).fromFile("./data/" + files[i]).then(parseDetailsJson);
		} else if (files[i].startsWith("StormEvents_fatalities")) {
			csv({output: "csv" }).fromFile("./data/" + files[i]).then(parseFatalitiesJson);
		}
	}
}

createTables();