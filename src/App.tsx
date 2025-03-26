import { allIcons } from "biqpod/ui/apis";
import {
  BlurOverlay,
  Button,
  Card,
  CardWait,
  CircleTip,
  Icon,
  InnerWindow,
  Line,
  Scroll,
  Translate,
} from "biqpod/ui/components";
import {
  BottomSheetLayout,
  Commands,
  DialogBoxLayout,
  EnumLayout,
  Header,
  LeftSide,
  MenuLayout,
  RightSide,
  Toasts,
  Window,
} from "biqpod/ui/layouts";
import {
  setTemp,
  showBottomSheet,
  useColorMerge,
  useCopyState,
  useIdleStatus,
  useTemp,
  visibilityTemp,
} from "biqpod/ui/hooks";
import { Route, Switch, useLocation } from "react-router";
import { Schedules } from "./Schedules";
import { LoginAdmin } from "./LoginAdmin";
import photo from "../public/admin.svg";
import { Link } from "react-router-dom";
import { Devices } from "./Devices";
import { Teacher } from "./Teacher";
import { Student } from "./Student";
import { Groups } from "./Groups";
import { useEffect } from "react";
import { apis } from "./apis";
import { onAuthStateChanged } from "./server";
import { HeaderContent } from "./HeaderContent";
export const tabs: Tab[] = [
  {
    name: "Devices",
    link: "/account/devices",
    icon: allIcons.solid.faMobileAlt,
  },
  {
    name: "Schedule",
    link: "/account/schedules",
    icon: allIcons.solid.faCalendarAlt,
  },
  {
    name: "Teacher",
    link: "/account/teachers",
    icon: allIcons.solid.faChalkboardTeacher,
  },
  {
    name: "Student",
    link: "/account/students",
    icon: allIcons.solid.faUserGraduate,
  },
];
export const App = () => {
  const colorMerge = useColorMerge();
  const loc = useLocation();
  const selectedTab = tabs.find((item) => item.link === loc.pathname);
  useEffect(() => {
    setTemp("selectedTab", selectedTab);
  }, [selectedTab]);
  const visible = visibilityTemp.useTemp("devices");
  const requestedDevices = useIdleStatus(async () => {
    const devices = await apis.getRequetedDevices();
    return devices.filter((device) => {
      !["approved", "refused"].includes(device.status);
    });
  }, []);
  useEffect(() => {
    setTemp("devicesLength", requestedDevices.data.get?.length || 0);
  }, [requestedDevices.data.get]);
  const uidState = useTemp<string>("uid");
  useEffect(() => {
    if (uidState.get) {
      requestedDevices.status.set("idle");
    }
  }, [uidState.get]);
  const useLoaded = useCopyState(false);
  useEffect(() => {
    return onAuthStateChanged((uid) => {
      const element = document.getElementById(uid ? "account" : "login");
      element?.click();
      useLoaded.set(true);
      uidState.set(uid);
    });
  }, []);
  return (
    <div className="flex flex-col h-full">
      <Header>
        <HeaderContent />
      </Header>
      <Window>
        <LeftSide />
        <InnerWindow>
          <Switch>
            <Route path="/login">
              <div className="flex flex-col justify-center items-center gap-y-10 h-full">
                <img
                  src={photo}
                  className="opacity-60 w-[350px] h-[350px] object-cover rotate-45"
                />
                <Button
                  onClick={() => {
                    showBottomSheet(<LoginAdmin />);
                  }}
                  className="gap-x-4 px-8 py-4 rounded-full w-fit text-3xl"
                  rightIcon={allIcons.solid.faChevronRight}
                >
                  <Translate content="login" />
                </Button>
              </div>
            </Route>
            <Route path="/account">
              <div className="flex flex-col justify-between h-full">
                <Scroll>
                  <Switch>
                    <Route path="/account/schedules">
                      <Schedules />
                    </Route>
                    <Route path="/account/devices">
                      <Devices />
                    </Route>
                    <Route path="/account/teachers">
                      <Teacher />
                    </Route>
                    <Route path="/account/students">
                      <Student />
                    </Route>
                    <Route path="/account/groups">
                      <Groups />
                    </Route>
                  </Switch>
                </Scroll>
                <Line />
                <div
                  style={{
                    ...colorMerge("primary.background"),
                  }}
                  className="flex justify-evenly gap-2 p-2"
                >
                  {tabs.map((item, index) => {
                    const isSelected = loc.pathname === item.link;
                    return (
                      <Link to={item.link} key={index}>
                        <Button
                          className="rounded-full max-md:w-[50px] max-md:h-[50px]"
                          icon={item.icon}
                          iconClassName="text-xl"
                          style={{
                            ...colorMerge(
                              !isSelected && "gray.opacity",
                              !isSelected && {
                                color: "text.color",
                              }
                            ),
                          }}
                        >
                          <span className="max-md:hidden">
                            <Translate content={item.name} />
                          </span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Route>
          </Switch>
        </InnerWindow>
        <RightSide />
      </Window>
      <BottomSheetLayout />
      <MenuLayout />
      <DialogBoxLayout />
      <Commands />
      <Toasts />
      <EnumLayout />
      <BlurOverlay hidden={!visible.get}>
        <Card className="max-md:rounded-none w-fit max-md:w-full max-md:h-full">
          <div className="flex justify-between items-center gap-x-2 p-3">
            <h1 className="text-4xl">
              <Translate content="Notifications" />
            </h1>
            <div>
              <CircleTip
                icon={allIcons.solid.faXmark}
                onClick={() => {
                  visible.set(false);
                }}
              />
            </div>
          </div>
          <Line />
          <Scroll className="md:max-h-[60vh]">
            {requestedDevices.status.get === "success" &&
              requestedDevices.data.get?.map(({ deviceId, status }) => {
                return (
                  <div
                    key={deviceId}
                    className="flex justify-between items-center gap-3 p-4"
                  >
                    <div className="flex items-center gap-x-2 text-xl">
                      <span>Device</span>
                      <span className="inline-block max-w-[50px] font-bold truncate">
                        {deviceId}
                      </span>{" "}
                      <span>Request</span>
                    </div>
                    <div className="flex gap-x-2">
                      <div>
                        <Button
                          icon={allIcons.solid.faXmark}
                          className="px-4 py-1"
                          style={{
                            ...colorMerge("error", {
                              color: "error.content",
                            }),
                          }}
                          onClick={() => {
                            apis.refuseDevice(deviceId);
                            requestedDevices.data.set(
                              requestedDevices.data.get?.filter(
                                (item) => item.deviceId !== deviceId
                              ) || null
                            );
                          }}
                        >
                          <Translate content="deny" />
                        </Button>
                      </div>
                      <div>
                        <Button
                          icon={allIcons.solid.faCheck}
                          className="px-4 py-1"
                          onClick={() => {
                            apis.approveDevice(deviceId);
                            requestedDevices.data.set(
                              requestedDevices.data.get?.filter(
                                (item) => item.deviceId !== deviceId
                              ) || null
                            );
                          }}
                        >
                          <Translate content="approved" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            {requestedDevices.status.get === "success" &&
              !requestedDevices.data.get?.length && (
                <div className="flex flex-col justify-center items-center gap-4 p-5 h-full">
                  <span
                    style={{
                      color: "#f9c23c",
                    }}
                  >
                    <Icon
                      icon={allIcons.solid.faBell}
                      iconClassName="text-9xl"
                    />
                  </span>
                  <h1 className="text-3xl">
                    <Translate content="No Items" />
                  </h1>
                </div>
              )}
            {requestedDevices.status.get === "loading" && (
              <CardWait className="h-[70px]" />
            )}
          </Scroll>
        </Card>
      </BlurOverlay>
      <div hidden>
        <Link to="/account/schedules" id="account" />
        <Link to="/login" id="login" />
      </div>
    </div>
  );
};
