import {
  openMenu,
  showBottomSheet,
  showPopup,
  showToast,
  useColorMerge,
  useIdleStatus,
} from "biqpod/ui/hooks";
import { useEffect } from "react";
import { apis } from "./apis";
import {
  Button,
  Card,
  CardWait,
  CircleTip,
  EmptyComponent,
  Icon,
  Line,
  Scroll,
  Translate,
} from "biqpod/ui/components";
import warningSvg from "../public/warning-error.svg";
import { allIcons } from "biqpod/ui/apis";
import { AttendanceTeacher } from "./AttendanceTeacher";
export const Teacher = () => {
  const allTeachers = useIdleStatus(async () => {
    const teachers = await apis.getAllTeachers();
    return teachers;
  }, []);
  useEffect(() => {
    allTeachers.status.set("idle");
  }, []);
  const colorMerge = useColorMerge();
  return (
    <EmptyComponent>
      {allTeachers.status.get === "success" && (
        <Scroll>
          <div className="flex flex-wrap gap-2 p-2 w-full h-full">
            {allTeachers.data.get?.map((item) => {
              return (
                <Card
                  className="w-[calc(100%/3-8px)] max-md:w-[calc(100%/2-8px)] h-fit"
                  key={item.id}
                >
                  <div className="flex items-center p-4">
                    <h1 className="text-2xl capitalize">
                      {item.firstName} {item.lastName}
                    </h1>
                  </div>
                  <Line />
                  <div className="flex justify-between items-center p-2">
                    <span
                      className="inline-flex items-center gap-x-2 px-3 py-1 border border-transparent border-solid rounded-full"
                      style={{
                        ...colorMerge("secondary", {
                          borderColor: "primary",
                          color: "secondary.content",
                        }),
                      }}
                    >
                      <Icon icon={allIcons.solid.faCreditCardAlt} />
                      <span>{item.rfid}</span>
                    </span>
                    <div className="flex">
                      <CircleTip
                        icon={allIcons.solid.faEllipsisV}
                        onClick={({ clientX, clientY }) => {
                          openMenu({
                            x: clientX,
                            y: clientY,
                            menu: [
                              {
                                // see attendance
                                label: "Attendance",
                                defaultIcon: allIcons.solid.faClipboardCheck,
                                async click() {
                                  showPopup(
                                    <AttendanceTeacher teacherId={item.id} />,
                                    {
                                      type: "blur",
                                    }
                                  );
                                },
                              },
                              {
                                label: "Copy RFID",
                                defaultIcon: allIcons.regular.faCopy,
                                async click() {
                                  await navigator.clipboard.writeText(
                                    item.rfid
                                  );
                                  showToast("RFID Copy successfully");
                                },
                              },
                              {
                                label: "Show More",
                                defaultIcon: allIcons.solid.faInfoCircle,
                                async click() {
                                  showBottomSheet(
                                    <EmptyComponent>
                                      <div className="p-2">
                                        <h1 className="text-2xl">
                                          <span className="capitalize">
                                            {item.firstName} {item.lastName}
                                          </span>
                                          <sub className="bg-[var(--biqpod-gray-opacity)] ml-2 px-2 rounded-full text-sm">
                                            @{item.username}
                                          </sub>
                                        </h1>
                                      </div>
                                      <Line />
                                      <div className="flex flex-col gap-2 p-2">
                                        <div className="flex justify-between items-center">
                                          <span className="capitalize">
                                            <Translate content="first name" />
                                          </span>
                                          <span>{item.firstName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="capitalize">
                                            <Translate content="last name" />
                                          </span>
                                          <span>{item.lastName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>RFID</span>
                                          <span>{item.rfid}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>
                                            <Translate content="grade" />
                                          </span>
                                          <span>{item.grade}</span>
                                        </div>
                                      </div>
                                    </EmptyComponent>
                                  );
                                },
                              },
                            ],
                          });
                        }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Scroll>
      )}
      {allTeachers.status.get === "loading" && <CardWait />}
      {allTeachers.status.get === "error" && (
        <div className="flex justify-center items-center w-full h-full">
          <Card className="w-fit">
            <div className="flex justify-center items-center p-4">
              <img
                src={warningSvg}
                alt="warning"
                className="w-[200px] h-[200px]"
              />
            </div>
            <Line />
            <div className="flex items-center p-4">
              <h1 className="text-2xl capitalize">
                <Translate content="error during fetching data" /> (
                {allTeachers.error.get?.message})
              </h1>
            </div>
            <Line />
            <div className="flex items-center p-4">
              <Button
                onClick={() => {
                  allTeachers.status.set("idle");
                }}
              >
                <Translate content="retry" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </EmptyComponent>
  );
};
