import { delay, range, tw } from "biqpod/ui/utils";
import { apis, Device } from "./apis";
import {
  Card,
  CardWait,
  CircleTip,
  ClickedView,
  Icon,
  Line,
  Scroll,
  Translate,
} from "biqpod/ui/components";
import {
  confirm,
  getTemp,
  openMenu,
  setTemp,
  showToast,
  useColorMerge,
  useCopyState,
  useIdleStatus,
} from "biqpod/ui/hooks";
import { allIcons } from "biqpod/ui/apis";
import { useEffect } from "react";
interface DeviceRenderrProps {
  device: Device;
  roomNumber?: string;
}
const DeviceRenderr = ({ device, roomNumber }: DeviceRenderrProps) => {
  const pwdVisible = useCopyState(false);
  const colorMerge = useColorMerge();
  return (
    <div className="w-[calc(100%/2-4px)]">
      <Card className="w-full" key={device.id}>
        <div className="flex max-md:flex-col justify-between md:items-center md:gap-3">
          <div className="max-md:p-2 md:p-4">
            <h1 className="md:text-xl text-3xl capitalize">
              <Translate content="class" />{" "}
              <span className="font-bold">{roomNumber}</span>
            </h1>
          </div>
          <div className="md:hidden">
            <Line />
          </div>
          <div className="flex justify-between items-center gap-x-2 max-md:p-2 md:p-4 overflow-hidden">
            <div className="flex items-center gap-x-2 overflow-hidden">
              <span
                className="inline-block rounded-full cursor-pointer"
                style={{
                  ...colorMerge("gray.opacity"),
                }}
                onClick={() => {
                  pwdVisible.set(!pwdVisible.get);
                }}
              >
                <span className="flex items-center">
                  <span className="inline-flex justify-center items-center rounded-full w-[26px] h-[26px]">
                    <Icon icon={allIcons.solid.faEye} />
                  </span>
                  <span
                    className={tw(
                      "inline-block max-w-[0px] overflow-hidden transition-[margin-left,,padding-right,opacity,transform,max-width] duration-500",
                      pwdVisible.get && "pr-[13px] ml-2 max-w-[100px]"
                    )}
                  >
                    {device.password}
                  </span>
                </span>
              </span>
              <ClickedView
                className="inline-block p-2 rounded-full w-fit font-bold max-md:text-xs cursor-pointer"
                style={{
                  ...colorMerge("gray.opacity"),
                }}
              >
                {device.macAddress}
              </ClickedView>
            </div>
            <div>
              <CircleTip
                icon={allIcons.solid.faEllipsisV}
                onClick={({ clientX, clientY }) => {
                  openMenu({
                    x: clientX,
                    y: clientY,
                    menu: [
                      {
                        label: "Copy Mac",
                        async click() {
                          await navigator.clipboard.writeText(
                            device.macAddress
                          );
                          showToast("Mac Address Copyed");
                        },
                        defaultIcon: allIcons.regular.faCopy,
                      },
                      {
                        type: "separator",
                      },
                      {
                        label: "Modify",
                        defaultIcon: allIcons.solid.faPen,
                        async click() {
                          showToast(
                            "This `feature` is not available yet",
                            "warning"
                          );
                        },
                      },
                      {
                        label: "Delete",
                        defaultIcon: allIcons.solid.faTrash,
                        async click() {
                          const response = await confirm({
                            title: "Delete",
                            message:
                              "Are you sure you want to delete this device?",
                            type: "warning",
                            defaultId: 0,
                          });
                          if (response) {
                            await apis.deleteDevice(device.id);
                            showToast("Device Deleted");
                            setTemp("refreshDevices", true);
                          }
                        },
                      },
                    ],
                  });
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
export const Devices = () => {
  const devices = useIdleStatus(async () => {
    delay(400);
    const data = await apis.getAllDevices();
    return data;
  }, []);
  useEffect(() => {
    devices.status.set("idle");
  }, []);
  const refreshDevices = getTemp<boolean>("refreshDevices");
  useEffect(() => {
    if (refreshDevices) {
      devices.status.set("idle");
      setTemp("refreshDevices", false);
    }
  }, [refreshDevices]);
  const allClasses = useIdleStatus(async () => {
    return await apis.getClasses();
  }, []);
  useEffect(() => {
    allClasses.status.set("idle");
  }, []);
  return (
    <Scroll className="flex flex-wrap gap-2 p-2">
      {devices.status.get === "loading" &&
        range(5).map((i) => {
          return <CardWait className="w-full" key={i} />;
        })}
      {devices.status.get === "success" &&
        allClasses.status.get === "success" &&
        devices.data.get?.map((device, index) => {
          const roomNumber = allClasses.data.get?.find(
            (s) => s.id === device.classId
          )?.roomNumber;
          return (
            <DeviceRenderr
              device={device}
              roomNumber={roomNumber}
              key={index}
            />
          );
        })}
    </Scroll>
  );
};
