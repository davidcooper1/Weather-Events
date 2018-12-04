const sqlite3 = require("sqlite3").verbose();

function allQuery(sql) {
	console.log(sql);
	var db = new sqlite3.Database("./db/Storm.db", (err) => {
	});
	db.all(sql, [], (err, rows) => {
		console.log(rows);
	});
	db.close((err) => {
	});
}

