const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electron", {
	getSources: () => ipcRenderer.invoke("get-sources"),
	getSelectedSource: (srcId) => ipcRenderer.send("srcId", srcId),
});
