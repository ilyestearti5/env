import {
  closePopup,
  getTemp,
  setTemp,
  showToast,
  useColorMerge,
  useCopyState,
  useIdleStatus,
} from "biqpod/ui/hooks";
import React, { useEffect } from "react";
import { apis } from "./apis";
import { allIcons } from "biqpod/ui/apis";
import {
  Card,
  Translate,
  CircleTip,
  Line,
  Scroll,
  Button,
  Icon,
  CardWait,
  CircleLoading,
  Anchor,
} from "biqpod/ui/components";
export const Notifications = () => {
  const requestedDevices = useIdleStatus(async () => {
    const devices = await apis.getRequetedDevices();
    return devices.filter((device) => {
      return device.status === "pending";
    });
  }, []);
  const uidState = getTemp<string>("uid");
  useEffect(() => {
    setTemp("devicesLength", requestedDevices.data.get?.length || 0);
  }, [requestedDevices.data.get]);
  const colorMerge = useColorMerge();
  useEffect(() => {
    if (uidState) {
      requestedDevices.status.set("idle");
    }
  }, [uidState]);
  const loading = useCopyState(false);
  return (
    <Card className="relative max-md:rounded-none w-5/6 max-md:w-full max-md:h-full overflow-hidden">
      <div className="flex justify-between items-center gap-x-2 p-3">
        <h1 className="text-4xl">
          <Translate content="Notifications" />
        </h1>
        <div>
          <CircleTip
            icon={allIcons.solid.faXmark}
            onClick={() => {
              closePopup();
            }}
          />
        </div>
      </div>
      <Line />
      <Scroll className="md:max-h-[60vh]">
        {requestedDevices.status.get === "success" &&
          requestedDevices.data.get?.map(({ status, requestId }) => {
            return (
              <div
                key={requestId}
                className="flex max-md:flex-col justify-between items-center gap-3 odd:bg-[--biqpod-primary-background] p-4"
              >
                <div className="flex items-center gap-x-2 max-md:w-full max-md:text-lg text-xl">
                  <span>Device</span>
                  <Anchor
                    onClick={async () => {
                      await navigator.clipboard.writeText(requestId);
                      showToast("device id copied", "info", {
                        id: requestId,
                      });
                    }}
                    className="inline-block bg-[--biqpod-gray-opacity] px-2 rounded-lg font-bold text-nowrap cursor-pointer"
                  >
                    {requestId}
                  </Anchor>{" "}
                  <span>Request</span>
                </div>
                <div className="flex justify-between gap-x-2 max-md:w-full">
                  <div />
                  <div className="flex gap-2">
                    <div>
                      <Button
                        icon={allIcons.solid.faXmark}
                        className="px-4 py-1"
                        style={{
                          ...colorMerge("error", {
                            color: "error.content",
                          }),
                        }}
                        onClick={async () => {
                          loading.set(true);
                          try {
                            await apis.refuseDevice(requestId);
                          } catch {}
                          loading.set(false);
                          requestedDevices.status.set("idle");
                        }}
                      >
                        <Translate content="deny" />
                      </Button>
                    </div>
                    <div>
                      <Button
                        icon={allIcons.solid.faCheck}
                        className="px-4 py-1"
                        onClick={async () => {
                          loading.set(true);
                          try {
                            await apis.approveDevice(requestId);
                          } catch {}
                          loading.set(false);
                          requestedDevices.status.set("idle");
                        }}
                      >
                        <Translate content="approved" />
                      </Button>
                    </div>
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
                <Icon icon={allIcons.solid.faBell} iconClassName="text-9xl" />
              </span>
              <h1 className="text-3xl">
                <Translate content="No Items" />
              </h1>
            </div>
          )}
        {requestedDevices.status.get === "loading" && (
          <CardWait className="h-full" />
        )}
      </Scroll>
      {loading.get && (
        <div className="absolute inset-0 flex justify-center items-center bg-[--biqpod-gray-opacity]">
          <CircleLoading />
        </div>
      )}
    </Card>
  );
};
