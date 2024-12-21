const {
	app,
	BrowserWindow,
	desktopCapturer,
	session,
	ipcMain,
} = require("electron/main");
const path = require("node:path");

let source = 0;

const createWindow = () => {
	const win = new BrowserWindow({
		width: 700,
		height: 700,
		title: "Screen Recorder",
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

	win.setMenuBarVisibility(false);

	session.defaultSession.setDisplayMediaRequestHandler(
		(request, callback) => {
			desktopCapturer
				.getSources({ types: ["window", "screen"] })
				.then((sources) => {
					callback({
						video: sources[source],
						audio: "loopback",
					});
				});
		},
		{ useSystemPicker: true }
	);

	ipcMain.handle("get-sources", () => {
		return desktopCapturer
			.getSources({ types: ["window", "screen"] })
			.then(async (sources) => {
				return sources;
			});
	});

	win.loadFile(path.join(__dirname, "index.html"));
};

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

ipcMain.on("srcId", (event, srcId) => {
	source = srcId;
});
