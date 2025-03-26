import {
  createMainWindow,
  setUpAppEnv,
  startApplicationForDesktop,
} from "biqpod/electron";
import express from "express";
let port = 2020;
const devUrl = "http://localhost:" + 3000;
const prodUrl = "http://localhost:" + port;
if (import.meta.env.DEV) {
  const app = express();
  app.use(express.static("dist"));
  app.listen(port);
}
setUpAppEnv({
  devUrl,
  prodUrl,
});
export var mainWindow: Electron.BrowserWindow | null = null;
startApplicationForDesktop(async () => {
  mainWindow = await createMainWindow();
});
