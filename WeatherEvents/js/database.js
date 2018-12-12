var sqlite3 = require("sqlite3").verbose();

let db;

function openDatabase() {
	if (db != null)
		return;
	db = new sqlite3.Database("./db/Storm.db", (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log("Connected to the user database");
	});
}

function closeDatabase() {
	if (db == null)
		return console.error("Error: Database is not open.");
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log("Database connection has been closed.");
	});
	db = null;
}

function addLocation(cz_fips, state_fips, cz_type, cz_name, state_name) {
	db.run("INSERT INTO locations VALUES (?, ?, ?, ?, ?)", [cz_fips, state_fips, cz_type, cz_name, state_name], (err) => {
		if (err) {
			//return console.log(err.message);
		}
	});
}

function addEvent(event_id, episode_id, type, magnitude, property_damage, start_date, end_date, cz_fips, state_fips) {
	db.run("INSERT INTO weather_events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [event_id, episode_id, type, magnitude, property_damage, start_date, end_date, cz_fips, state_fips], (err) => {
		if (err) {
			return console.log(err.message);
		}
	});
}

function getLocationList() {
	db.all("SELECT * FROM locations", [], (err, rows) => {
		if (err) {
			throw err;
		}
		console.log(rows);
	});
}

function getEventList() {
	db.all("SELECT * FROM weather_events", [], (err, rows) => {
		if (err) {
			throw err;
		}
		console.log(rows);
	});
}

openDatabase();
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
closeDatabase();