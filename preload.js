const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  printReceipt: (data) => ipcRenderer.invoke("print-receipt", data),
});
