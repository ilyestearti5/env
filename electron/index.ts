import {
  createMainWindow,
  setUpAppEnv,
  startApplicationForDesktop,
} from "biqpod/electron";
import project from "../project.config";
const { development, production } = project;
setUpAppEnv({
  devUrl: "http://localhost:" + development.port,
  prodUrl: production.url,
});
export var mainWindow: Electron.BrowserWindow | null = null;
startApplicationForDesktop(async () => {
  mainWindow = await createMainWindow();
});
