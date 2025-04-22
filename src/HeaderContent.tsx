import { allIcons } from "biqpod/ui/apis";
import { isDesktop } from "biqpod/ui/app";
import {
  Button,
  CircleTip,
  DarkLightIcon,
  EmptyComponent,
  Icon,
  Translate,
  WindowControls,
} from "biqpod/ui/components";
import {
  getTemp,
  openMenu,
  setSettingValue,
  showPopup,
  useSettingValue,
  useTemp,
  visibilityTemp,
} from "biqpod/ui/hooks";
import { cloud } from "./server";
import { Notifications } from "./Notifications";
export const HeaderContent = () => {
  const selectedTab = getTemp<Tab>("selectedTab");
  const visible = visibilityTemp.useTemp("devices");
  const uidState = useTemp<string>("uid");
  const devicesLength = getTemp<number>("devicesLength");
  const isDark = useSettingValue("window/dark.boolean");
  return (
    <EmptyComponent>
      <div className="flex justify-between items-center px-4 w-full">
        <div className="flex items-center gap-x-4">
          {selectedTab && (
            <EmptyComponent>
              <Icon iconClassName="text-2xl" icon={selectedTab.icon} />
              <h1 className="text-3xl">{selectedTab?.name}</h1>
            </EmptyComponent>
          )}
        </div>
        <div className="hidden max-md:flex items-center gap-x-4">
          <CircleTip
            onClick={({ clientX, clientY }) => {
              openMenu({
                x: clientX,
                y: clientY,
                menu: [
                  {
                    defaultIcon: allIcons.solid.faBell,
                    label: "Notifications",
                    click() {
                      showPopup(<Notifications />, {
                        type: "blur",
                      });
                    },
                  },
                  {
                    defaultIcon: allIcons.solid.faSignOutAlt,
                    label: "Logout",
                    click() {
                      cloud.app.auth.signOut();
                    },
                  },
                  {
                    type: "separator",
                  },
                  {
                    label: "Dark Mode",
                    checked: !!isDark,
                    click() {
                      setSettingValue("window/dark.boolean", !isDark);
                    },
                  },
                ],
              });
            }}
            icon={allIcons.solid.faEllipsisV}
          />
        </div>
        <div className="max-md:hidden flex items-center gap-x-4">
          <div className="relative">
            <CircleTip
              onClick={() => {
                showPopup(<Notifications />, {
                  type: "blur",
                });
              }}
              icon={allIcons.solid.faBell}
            />
            {!!devicesLength && devicesLength > 0 && (
              <span className="inline-block top-2 right-2 absolute bg-red-600 rounded-full w-[10px] h-[10px]" />
            )}
          </div>
          <div>
            <DarkLightIcon />
          </div>
          {uidState.get && (
            <Button
              className="rounded-full"
              icon={allIcons.solid.faSignOutAlt}
              onClick={() => {
                cloud.app.auth.signOut();
              }}
            >
              <Translate content="logout" />
            </Button>
          )}
        </div>
      </div>
      {isDesktop && <WindowControls />}
    </EmptyComponent>
  );
};
