const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("seven", {
  call: (action, args) => ipcRenderer.invoke("seven:call", action, args),
  on: (event, callback) => {
    if (!["change", "log", "chat"].includes(event)) return;
    const fn = (_, data) => callback(data);
    ipcRenderer.on("seven:" + event, fn);
    return () => ipcRenderer.removeListener("seven:" + event, fn);
  },
});
