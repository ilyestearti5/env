import "./index.css";
import "biqpod/ui/biqpod.css";
import "./server";
import { startApplication } from "biqpod/ui/app";
import { App } from "./App";
import { BrowserRouter } from "react-router-dom";
import { addCommand } from "biqpod/ui/hooks";
startApplication(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  {
    isDev: import.meta.env.DEV,
    onPrepare() {
      addCommand(
        {
          commandId: "delete-focused-schedule",
          commands: [
            {
              type: "actions/exec",
              payload: ["delete-focused-schedule"],
            },
          ],
          label: "Schedule : Delete Focused",
        },
        [
          {
            value: "delete",
          },
        ],
      );
    },
  },
);
