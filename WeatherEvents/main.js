const {app, BrowserWindow} = require("electron")

let win;

function createWindow() {
	win = new BrowserWindow({
		minWidth: 600,
		minHeight: 400,
		width: 850,
		height: 650
	});
	
	win.loadFile("index.html");
	win.setMenu(null);
	
	win.webContents.openDevTools();
	
	win.webContents.on("before-input-event", (event, input) => {
		if (input.key == "F12") {
			if (win.webContents.isDevToolsOpened()) {
				win.webContents.closeDevTools();
			} else {
				win.webContents.openDevTools();
			}
		}
	});
	
	win.on("closed", () => {
		win = null;
	});
}



app.on("ready", createWindow);
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
app.on("activate", () => {
	if (win == null) {
		createWindow();
	}
});