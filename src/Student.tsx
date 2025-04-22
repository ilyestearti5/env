import {
  openMenu,
  showPopup,
  showToast,
  useColorMerge,
  useCopyState,
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
  EnumFeild,
  Icon,
  Line,
  Scroll,
  Translate,
} from "biqpod/ui/components";
import warningSvg from "../public/warning-error.svg";
import { allIcons } from "biqpod/ui/apis";
import { Nothing } from "biqpod/ui/types";
import { delay } from "biqpod/ui/utils";
import { AttendanceStudent } from "./AttendanceStudent";
export const Student = () => {
  const selectedGroup = useCopyState<string | Nothing>(null);
  const colorMerge = useColorMerge();
  const allStudents = useIdleStatus(async () => {
    await delay(1000);
    return await apis.getAllStudents();
  }, []);
  useEffect(() => {
    allStudents.status.set("idle");
  }, []);
  const allStudentsInGroup = useIdleStatus(async () => {
    if (!selectedGroup.get) {
      return [];
    }
    console.log(selectedGroup.get);
    await delay(1000);
    return await apis.getStudentsInGroup(+selectedGroup.get);
  }, [selectedGroup.get]);
  useEffect(() => {
    allStudentsInGroup.status.set("idle");
  }, [selectedGroup.get]);
  const allGroups = useIdleStatus(async () => {
    await delay(1000);
    return await apis.getAllGroupes();
  }, []);
  useEffect(() => {
    allGroups.status.set("idle");
  }, []);
  const items = allStudents.data.get?.filter((student) => {
    return selectedGroup.get && allStudentsInGroup.data.get
      ? allStudentsInGroup.data.get.find((s) => s.id == student.id)
      : true;
  });

  const isLoading = [
    allStudents.status.get,
    allGroups.status.get,
    allStudentsInGroup.status.get,
  ].includes("loading");

  return (
    <EmptyComponent>
      {!isLoading && (
        <div className="flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-2">
            <div className="w-[200px]">
              <EnumFeild
                state={selectedGroup}
                config={{
                  search: true,
                  list: (allGroups.data.get || []).map((cls) => {
                    const id = cls.id.toString();
                    return {
                      value: id,
                      content: "Group " + id,
                    };
                  }),
                  placeholder: "Select Group",
                }}
                id="group-id"
              />
            </div>
          </div>
          <Line />
          {allStudentsInGroup.status.get === "success" &&
            allStudents.status.get === "success" && (
              <Scroll>
                <div className="flex flex-wrap gap-2 p-2 w-full h-full">
                  {items?.map((item) => {
                    return (
                      <Card
                        className="w-[calc(100%/3-8px)] max-md:w-[calc(100%/2-8px)]"
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
                          <div>
                            <CircleTip
                              icon={allIcons.solid.faList}
                              onClick={({ clientX, clientY }) => {
                                openMenu({
                                  x: clientX,
                                  y: clientY,
                                  menu: [
                                    {
                                      label: "Attendance",
                                      defaultIcon:
                                        allIcons.solid.faClipboardCheck,
                                      async click() {
                                        showPopup(
                                          <AttendanceStudent
                                            studentId={item.id}
                                          />
                                        );
                                      },
                                    },
                                    {
                                      label: "Copy",
                                      defaultIcon: allIcons.regular.faCopy,
                                      async click() {
                                        await navigator.clipboard.writeText(
                                          item.rfid
                                        );
                                        showToast("Copy successfully");
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
        </div>
      )}
      {isLoading && <CardWait />}
      {allStudents.status.get === "error" && (
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
                {allStudents.error.get?.message})
              </h1>
            </div>
            <Line />
            <div className="flex items-center p-4">
              <Button
                onClick={() => {
                  allStudents.status.set("idle");
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
