import { allIcons } from "biqpod/ui/apis";
import {
  BlurOverlay,
  Button,
  Card,
  CardWait,
  CircleTip,
  Icon,
  Line,
  Scroll,
  Translate,
} from "biqpod/ui/components";
import {
  BottomSheetLayout,
  Commands,
  Container,
  DialogBoxLayout,
  EnumLayout,
  Header,
  LeftSide,
  MenuLayout,
  PopupLayout,
  RightSide,
  Toasts,
  Window,
} from "biqpod/ui/layouts";
import {
  getTemp,
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
import { Link } from "react-router-dom";
import { Devices } from "./Devices";
import { Teacher } from "./Teacher";
import { Student } from "./Student";
import { Groups } from "./Groups";
import { useEffect } from "react";
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
  const uidState = useTemp<string>("uid");
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
        <Container>
          <Switch>
            <Route path="/login">
              <LoginAdmin />
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
        </Container>
        <RightSide />
      </Window>
      <BottomSheetLayout />
      <MenuLayout />
      <PopupLayout />
      <DialogBoxLayout />
      <Commands />
      <Toasts />
      <EnumLayout />
      <div hidden>
        <Link to="/account/schedules" id="account" />
        <Link to="/login" id="login" />
      </div>
    </div>
  );
};
