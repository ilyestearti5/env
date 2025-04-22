import biqpodConfig from "./project.config";
import type { CapacitorConfig } from "@capacitor/cli";
const config: CapacitorConfig = {
  appId: `com.${biqpodConfig.appId}.app`,
  appName: biqpodConfig.appName,
  webDir: "dist",
};
export default config;
