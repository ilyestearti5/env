import {
  confirm,
  getTemp,
  openMenu,
  setTemp,
  showBottomSheet,
  showToast,
  useAction,
  useColorMerge,
  useCopyState,
  useIdleStatus,
} from "biqpod/ui/hooks";
import { useEffect } from "react";
import { apis, Schedule } from "./apis";
import {
  Button,
  Card,
  CardWait,
  CircleTip,
  EmptyComponent,
  EnumFeild,
  Line,
  Scroll,
  Translate,
} from "biqpod/ui/components";
import warningSvg from "../public/warning-error.svg";
import { allIcons } from "biqpod/ui/apis";
import { delay, mapAndFilter, mergeObject, range, tw } from "biqpod/ui/utils";
import { UpsertSchedule, days } from "./CreateSchedule";
import { Nothing } from "biqpod/ui/types";
interface ScheduleUi extends Schedule {
  left: number;
  width: number;
}
export const Schedules = () => {
  const atts = useIdleStatus(async () => {
    await delay(1000);
    const atts = await apis.getAllSchedules();
    return atts;
  }, []);
  const reloadToIdle = getTemp<boolean>("reloadSchedulesToIdle");
  useEffect(() => {
    atts.status.set("idle");
  }, []);
  useEffect(() => {
    setTemp("schedules", atts.data.get);
  }, [atts.data.get]);
  useEffect(() => {
    if (reloadToIdle) {
      atts.status.set("idle");
      setTemp("reloadSchedulesToIdle", false);
    }
  }, [reloadToIdle]);
  const colorMerge = useColorMerge();
  const classes = useIdleStatus(async () => {
    await delay(1000);
    const atts = await apis.getClasses();
    return atts;
  }, []);
  useEffect(() => {
    classes.status.set("idle");
  }, []);
  const classId = useCopyState<string | Nothing>(null);
  const selectedShedule = useCopyState<ScheduleUi | null>(null);
  useAction(
    "delete-focused-schedule",
    async () => {
      if (selectedShedule.get?.id) {
        const response = await confirm({
          message: "Are you sure you want to delete?",
          detail: `
First Name: ${selectedShedule.get.teacher.firstName} <br />
Last Name: ${selectedShedule.get.teacher.lastName} <br />
Group: ${selectedShedule.get.group.id} <br />
Class: ${selectedShedule.get.class.roomNumber} <br />
Day: ${selectedShedule.get.day} <br />
Start Time: ${selectedShedule.get.startTime} <br />
End Time: ${selectedShedule.get.endTime} <br />
          `,
          title: "Delete",
          defaultId: 0,
        });
        if (response) {
          await apis.deleteSchedule(selectedShedule.get.id);
          atts.data.set(
            atts.data.get?.filter((i) => i.id !== selectedShedule.get!.id)
          );
          selectedShedule.set(null);
        }
      } else {
        showToast("No schedule selected", "error");
      }
    },
    [selectedShedule.get?.id]
  );
  return (
    <EmptyComponent>
      <div
        className={tw(
          "flex flex-col overflow-hidden",
          atts.status.get === "success" && "h-full"
        )}
      >
        <div>
          <div
            className={tw(
              "max-h-[0px] overflow-hidden transition-[max-height] duration-500",
              atts.status.get === "success" && "max-h-[80px]"
            )}
          >
            <div className={tw("flex justify-between p-2")}>
              <div className="flex items-center gap-x-2">
                <div className="w-[200px]">
                  <EnumFeild
                    state={classId}
                    config={{
                      search: true,
                      list: (classes.data.get || []).map((cls) => {
                        return {
                          value: cls.id.toString(),
                          content: cls.roomNumber,
                        };
                      }),
                      placeholder: "Select class",
                    }}
                    id="classId"
                  />
                </div>
                {classId.get && (
                  <div>
                    <CircleTip
                      onClick={() => {
                        classId.set(null);
                      }}
                      icon={allIcons.solid.faTimes}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center gap-x-1">
                {selectedShedule.get && (
                  <EmptyComponent>
                    <Button
                      className="mr-2 w-fit"
                      style={{
                        ...colorMerge("gray.opacity", {
                          color: "text.color",
                        }),
                      }}
                      icon={allIcons.solid.faXmark}
                      onClick={async () => {
                        selectedShedule.set(null);
                      }}
                    >
                      <span className="max-md:hidden">
                        <Translate content="cancel" />
                      </span>
                    </Button>
                    <Button
                      className="mr-2 w-fit"
                      style={{
                        ...colorMerge("error", {
                          color: "error.content",
                        }),
                      }}
                      icon={allIcons.solid.faTrash}
                      onClick={async () => {
                        const response = await confirm({
                          message: "Are you sure you want to delete?",
                          title: "Delete",
                          defaultId: 0,
                        });
                        if (response) {
                          await apis.deleteSchedule(selectedShedule.get!.id);
                          atts.data.set(
                            atts.data.get?.filter(
                              (i) => i.id !== selectedShedule.get?.id
                            )
                          );
                          selectedShedule.set(null);
                        }
                      }}
                    >
                      <span className="max-md:hidden">
                        <Translate content="delete" />
                      </span>
                    </Button>
                  </EmptyComponent>
                )}
                <Button
                  className="w-fit"
                  onClick={() => {
                    showBottomSheet(
                      <UpsertSchedule item={selectedShedule.get ?? undefined} />
                    );
                  }}
                  icon={
                    selectedShedule.get
                      ? allIcons.solid.faPen
                      : allIcons.solid.faAdd
                  }
                >
                  <span className="max-md:hidden">
                    <Translate
                      content={selectedShedule.get ? "modify" : "add"}
                    />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Line />
        {atts.status.get === "success" && (
          // <Scroll>
          //   <div className="flex flex-wrap gap-2 p-2">
          //     {atts.data.get?.map((item) => {
          //       return (
          //         <Card
          //           className="w-[calc(100%/3-8px)] max-md:w-[calc(100%/2-8px)]"
          //           key={item.id}
          //         >
          //           <div className="flex flex-1 justify-between items-center p-4">
          //             <h1 className="text-2xl capitalize">
          //               {item.teacher.firstName} {item.teacher.lastName}
          //             </h1>
          //             <div>
          //               <CircleTip
          //                 icon={allIcons.solid.faEllipsisV}
          //                 onClick={({ clientX, clientY }) => {
          //                   openMenu({
          //                     x: clientX,
          //                     y: clientY,
          //                     menu: [
          //                       {
          //                         label: "Edit",
          //                         click: () => {
          //                           showBottomSheet(
          //                             <CreateSchedule item={item} />
          //                           );
          //                         },
          //                       },
          //                       {
          //                         label: "Delete",
          //                         click: async () => {
          //                           const response = await confirm({
          //                             message:
          //                               "Are you sure you want to delete?",
          //                             title: "Delete",
          //                             defaultId: 0,
          //                           });
          //                           if (response) {
          //                             await apis.deleteSchedule(item.id);
          //                             showToast(
          //                               "Successfully deleted",
          //                               "success"
          //                             );
          //                             atts.data.set(
          //                               atts.data.get?.filter(
          //                                 (i) => i.id !== item.id
          //                               )
          //                             );
          //                           }
          //                         },
          //                       },
          //                     ],
          //                   });
          //                 }}
          //               />
          //             </div>
          //           </div>
          //           <Line />
          //           <div className="flex flex-col gap-y-1 p-4">
          //             <div className="flex items-center gap-3">
          //               <Icon icon={allIcons.solid.faClock} />
          //               <span>{item.startTime}</span>
          //             </div>
          //             <div className="flex justify-between items-center pr-2">
          //               <div className="flex flex-col gap-y-1 mx-1">
          //                 {range(4).map((index) => {
          //                   return (
          //                     <span
          //                       className="inline-block rounded-full w-[7px] h-[7px]"
          //                       style={{
          //                         ...colorMerge("primary"),
          //                       }}
          //                       key={index}
          //                     />
          //                   );
          //                 })}
          //               </div>
          //               <span className="text-xl">
          //                 {item.day} at{" "}
          //                 <span
          //                   style={{
          //                     ...colorMerge({
          //                       color: "primary",
          //                     }),
          //                   }}
          //                 >
          //                   {item.class.roomNumber}
          //                 </span>
          //               </span>
          //             </div>
          //             <div className="flex items-center gap-3">
          //               <Icon icon={allIcons.solid.faClock} />
          //               <span>{item.endTime}</span>
          //             </div>
          //           </div>
          //         </Card>
          //       );
          //     })}
          //   </div>
          // </Scroll>
          <EmptyComponent>
            <div className="sticky flex overflow-x-auto">
              <div>
                <div className="md:w-[150px] max-md:w-[120px]"></div>
              </div>
              {range(8, 17, 1.5).map((item, index) => {
                const isAm = item < 12;
                const int = parseInt(item.toString());
                const f = item - int;
                const s = f * 60;
                return (
                  <div key={item} className="w-full">
                    <div className="relative flex flex-col items-center h-full">
                      <div
                        style={{
                          ...colorMerge({ borderColor: "borders" }),
                        }}
                        className={tw(
                          "flex max-md:flex-col justify-center items-center border-transparent border-r border-solid w-full h-[70px] max-md:text-xs",
                          index == 0 && "border-l"
                        )}
                      >
                        <span>
                          {int}
                          {s !== 0 && <EmptyComponent>:{s}</EmptyComponent>}
                        </span>{" "}
                        <span>{isAm ? "AM" : "PM"}</span>
                      </div>
                      <div className="bottom-0 absolute flex justify-evenly w-full h-[7px]">
                        {range(3).map((i) => {
                          return (
                            <div
                              key={i}
                              className="inline-block w-[1px] h-full"
                              style={{
                                ...colorMerge("borders"),
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    <Line />
                  </div>
                );
              })}
            </div>
            <Line />
            <Scroll className="select-none">
              <div>
                {days.map((day) => {
                  const attsByDay = mapAndFilter(atts.data.get || [], {
                    filter: (att) =>
                      (classId.get
                        ? att.class.id.toString() == classId.get
                        : true) && att.day.toLowerCase() === day.toLowerCase(),
                    map: (att) => {
                      const [startHour, startMinut] = att.startTime.split(
                        ":",
                        2
                      );
                      const [endHour, endMinut] = att.endTime.split(":", 2);
                      const startHourInt = parseInt(startHour) - 8;
                      const endHourInt = parseInt(endHour) - 8;
                      const startMinutInt = parseInt(startMinut);
                      const endMinutInt = parseInt(endMinut);
                      const startFullMinut =
                        startHourInt * 60 + startMinutInt - 8;
                      const endFullMinut = endHourInt * 60 + endMinutInt - 8;
                      const left = (startFullMinut * 100) / 540;
                      const width =
                        ((endFullMinut - startFullMinut) * 100) / 540;
                      return {
                        ...att,
                        left,
                        width,
                      };
                    },
                  });
                  const usedClasses = Array.from(
                    new Set(attsByDay.map((att) => att.class.roomNumber))
                  );
                  const sames = usedClasses.map((classId) => {
                    return {
                      classId,
                      atts: attsByDay.filter(
                        (att) => att.class.roomNumber == classId
                      ),
                    };
                  });
                  const isAfter =
                    selectedShedule.get?.day &&
                    days.indexOf(day) > days.indexOf(selectedShedule.get.day);
                  return (
                    <div key={day}>
                      <div className="flex items-stretch">
                        <div>
                          <div
                            className="flex justify-between items-stretch border-r border-solid md:w-[150px] max-md:w-[120px]"
                            style={{
                              ...colorMerge({ borderColor: "borders" }),
                            }}
                          >
                            <div className="flex items-center px-2 w-full h-full min-h-[60px]">
                              <span className="max-md:text-xs">
                                <span className="md:hidden">
                                  {day.slice(0, 3)}
                                </span>
                                <span className="max-md:hidden">{day}</span>
                              </span>
                            </div>
                            <div className="flex flex-col h-full">
                              {usedClasses.map((classId) => {
                                return (
                                  <div
                                    className="flex justify-between items-center hover:bg-[var(--biqpod-gray-opacity-2)] px-3"
                                    key={classId}
                                  >
                                    <div className="flex items-center w-fit h-[25px] cursor-pointer">
                                      {classId}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="relative flex flex-col w-full">
                          <div
                            className={tw(
                              "absolute inset-y-0 border-x-2 border-y-0 border-transparent border-solid transition-[left,width,background] duration-200 pointer-events-none"
                            )}
                            style={{
                              left: `${selectedShedule.get?.left}%`,
                              width: `${selectedShedule.get?.width}%`,
                              ...mergeObject(
                                selectedShedule.get && {
                                  borderColor: "red",
                                }
                              ),
                            }}
                          />
                          {sames.map((s, index) => {
                            return (
                              <div
                                className="relative w-full h-[25px]"
                                key={s.classId}
                              >
                                {s.atts.map((item) => {
                                  return (
                                    <div
                                      key={item.id}
                                      aria-label="time-line"
                                      className={tw(
                                        "absolute inset-y-1 flex justify-center items-center rounded-sm outline outline-2 outline-transparent -outline-offset-2 overflow-hidden text-xs truncate cursor-pointer",
                                        selectedShedule.get &&
                                          selectedShedule.get.id === item.id &&
                                          "z-[1000000000]"
                                      )}
                                      onClick={() => {
                                        selectedShedule.set(item);
                                      }}
                                      style={{
                                        left: `${item.left}%`,
                                        width: `${item.width}%`,
                                        ...colorMerge(
                                          {
                                            color: "primary.content",
                                            backgroundColor: "primary",
                                          },
                                          index % 2 && {
                                            backgroundColor: "secondary",
                                            color: "secondary.content",
                                          }
                                        ),
                                        ...mergeObject(
                                          selectedShedule.get &&
                                            selectedShedule.get.id ===
                                              item.id && {
                                              outlineColor: "red",
                                            }
                                        ),
                                      }}
                                    >
                                      <span className="inline-block px-2 truncate">
                                        {item.teacher.firstName}{" "}
                                        {item.teacher.lastName} With G
                                        {item.group.id}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <Line />
                    </div>
                  );
                })}
              </div>
            </Scroll>
          </EmptyComponent>
        )}
      </div>
      {atts.status.get === "loading" && (
        // <div className="flex flex-wrap gap-2 p-2">
        //   {range(5)?.map((item) => {
        //     return (
        //       <Card
        //         className="w-[calc(100%/3-8px)] max-md:w-[calc(100%/2-8px)] h-[220px]"
        //         key={item}
        //       >
        //         <div className="p-4">
        //           <CardWait className="h-[50px]" />
        //         </div>
        //         <Line />
        //         <div className="flex items-center px-4 h-full">
        //           <CardWait className="h-[90px]" />
        //         </div>
        //       </Card>
        //     );
        //   })}
        // </div>
        <CardWait className="w-full h-full" />
      )}
      {atts.status.get === "error" && (
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
                {atts.error.get?.message})
              </h1>
            </div>
            <Line />
            <div className="flex items-center p-4">
              <Button
                onClick={() => {
                  atts.status.set("idle");
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
