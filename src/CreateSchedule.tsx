import { allIcons } from "biqpod/ui/apis";
import {
  Button,
  CircleLoading,
  CircleTip,
  DateFeild,
  EmptyComponent,
  EnumFeild,
  Field,
  Line,
  Translate,
} from "biqpod/ui/components";
import React, { useEffect } from "react";
import { apis, CreateScheduleForFn, Schedule } from "./apis";
import {
  closeBottomSheet,
  getTemp,
  openMenu,
  setTemp,
  showToast,
  startReloadTemps,
  useColorMerge,
  useCopyState,
  useIdleStatus,
} from "biqpod/ui/hooks";
import { Nothing } from "biqpod/ui/types";
import { range } from "biqpod/ui/utils";
export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
interface CreateScheduleProps {
  item?: Schedule;
}
export const UpsertSchedule = ({ item }: CreateScheduleProps) => {
  const selectedDay = useCopyState<string | Nothing>(null);
  const colorMerge = useColorMerge();
  const startAt = useCopyState<string | null | undefined>(null);
  const endAt = useCopyState<string | null | undefined>(null);
  const teacherChoiser = useCopyState<string | Nothing>(null);
  const groupChoiser = useCopyState<string | Nothing>(null);
  const classChoiser = useCopyState<string | Nothing>(null);
  useEffect(() => {
    console.log(item);
    if (item) {
      const capilaized = item.day.charAt(0).toUpperCase() + item.day.slice(1);
      selectedDay.set(capilaized);
      startAt.set(item.startTime);
      endAt.set(item.endTime);
    } else {
      selectedDay.set(null);
      startAt.set(null);
      endAt.set(null);
    }
  }, []);
  const allTeachers = useIdleStatus(async () => {
    return await apis.getAllTeachers();
  }, []);
  useEffect(() => {
    allTeachers.status.set("idle");
  }, []);
  useEffect(() => {
    if (allTeachers.status.get === "success") {
      teacherChoiser.set(item?.teacher.id.toString());
    }
  }, [allTeachers.status.get]);
  const allGroups = useIdleStatus(async () => {
    return await apis.getAllGroupes();
  }, []);
  useEffect(() => {
    allGroups.status.set("idle");
  }, []);
  useEffect(() => {
    if (allGroups.status.get === "success") {
      groupChoiser.set(item?.group.id.toString());
    }
  }, [allGroups.status.get]);
  const allClasses = useIdleStatus(async () => {
    return await apis.getClasses();
  }, []);
  useEffect(() => {
    allClasses.status.set("idle");
  }, []);
  useEffect(() => {
    if (allClasses.status.get === "success") {
      classChoiser.set(item?.class.id.toString());
    }
  }, [allClasses.status.get]);
  const isLoading = useCopyState(false);
  const schedules = getTemp<Schedule[]>("schedules");
  return (
    <EmptyComponent>
      <div className="flex justify-between items-center p-3">
        <h1 className="text-3xl capitalize">
          <Translate content={item ? "modify schedule" : "new schedule"} />
        </h1>
        <div className="flex gap-2">
          <CircleTip
            icon={allIcons.regular.faCopy}
            onClick={async () => {
              if (
                !classChoiser.get ||
                !groupChoiser.get ||
                !teacherChoiser.get ||
                !selectedDay.get ||
                !startAt.get ||
                !endAt.get
              ) {
                showToast("please fill all fields", "warning");
                return;
              }
              const data: CreateScheduleForFn = {
                classId: parseInt(classChoiser.get),
                groupId: parseInt(groupChoiser.get),
                teacherId: parseInt(teacherChoiser.get),
                day: selectedDay.get,
                startTime: startAt.get,
                endTime: endAt.get,
              };
              const content = JSON.stringify(data);
              await navigator.clipboard.writeText(content);
              showToast("copied to clipboard", "success");
            }}
          />
          <CircleTip
            icon={allIcons.regular.faPaste}
            onClick={async () => {
              const content = await navigator.clipboard.readText();
              try {
                const result: CreateScheduleForFn = JSON.parse(content);
                startAt.set(result.startTime);
                endAt.set(result.endTime);
                selectedDay.set(result.day);
                classChoiser.set(result.classId.toString());
                groupChoiser.set(result.groupId.toString());
                teacherChoiser.set(result.teacherId.toString());
              } catch {}
            }}
          />
        </div>
      </div>
      <Line />
      <div className="flex flex-col gap-y-2 p-3">
        <div className="flex items-center gap-3">
          <EnumFeild
            id="class-choiser"
            config={{
              search: true,
              list: (allClasses.data.get ?? []).map((c) => {
                return {
                  content: `Class ${c.roomNumber}`,
                  value: c.id.toString(),
                };
              }),
              placeholder: "select class",
            }}
            state={classChoiser}
          />
          <EnumFeild
            id="group-choiser"
            config={{
              search: true,
              list: (allGroups.data.get ?? []).map((g) => {
                return {
                  content: `Group ${g.id}`,
                  value: g.id.toString(),
                };
              }),
              placeholder: "select group",
            }}
            state={groupChoiser}
          />
        </div>
        <EnumFeild
          id="teacher-choiser"
          config={{
            search: true,
            list: (allTeachers.data.get ?? []).map((teacher) => {
              return {
                content: `${teacher.firstName} ${teacher.lastName} \`(${teacher.grade})\``,
                value: teacher.id.toString(),
              };
            }),
            placeholder: "select teacher",
          }}
          state={teacherChoiser}
        />
        <EnumFeild
          id="day-choiser"
          config={{
            list: days.map((day) => {
              return {
                content: day,
                value: day,
              };
            }),
            placeholder: "select day",
          }}
          state={selectedDay}
        />
        <DateFeild
          state={startAt}
          id="start-at-form"
          config={{
            format: "time",
          }}
        />
        <div className="flex flex-col gap-1 pl-4">
          {range(4).map((i) => {
            return (
              <span
                style={{
                  ...colorMerge(
                    "gray.opacity",
                    startAt.get && endAt.get && "primary"
                  ),
                }}
                className="inline-block rounded-full w-[13px] h-[13px]"
                key={i}
              />
            );
          })}
        </div>
        <DateFeild
          state={endAt}
          id="end-at-form"
          config={{
            format: "time",
          }}
        />
      </div>
      <Line />
      <div className="p-3">
        <Button
          icon={item ? allIcons.solid.faPencil : allIcons.solid.faPlusCircle}
          onClick={async () => {
            if (!classChoiser.get) {
              showToast("please select class", "warning");
              return;
            }
            if (!groupChoiser.get) {
              showToast("please select group", "warning");
              return;
            }
            if (!teacherChoiser.get) {
              showToast("please select teacher", "warning");
              return;
            }
            if (!selectedDay.get) {
              showToast("please select day", "warning");
              return;
            }
            if (!startAt.get) {
              showToast("please select start time", "warning");
              return;
            }
            if (!endAt.get) {
              showToast("please select end time", "warning");
              return;
            }
            const [startAtHours, startMinuts] = startAt.get
              .split(":")
              .map((n) => +n);
            const [endAtHours, endAtMinuts] = endAt.get
              .split(":")
              .map((n) => +n);
            const startAtFullMinutes = startMinuts + startAtHours * 60;
            const endAtFullMinutes = endAtMinuts + endAtHours * 60;
            const founded = schedules?.find(({ startTime, endTime }) => {
              const [startTimeHourCheck, startTimeMinutCheck] =
                startTime.split(":");
              const [endTimeHourCheck, endTimeMinutCheck] = endTime.split(":");
              const startTimeCheck =
                parseInt(startTimeHourCheck) * 60 +
                parseInt(startTimeMinutCheck);
              const endTimeCheck =
                parseInt(endTimeHourCheck) * 60 + parseInt(endTimeMinutCheck);
              if (
                classChoiser.get === item?.class.id.toString() &&
                startTimeCheck <= startAtFullMinutes &&
                endTimeCheck >= endAtFullMinutes
              ) {
                return true;
              }
            });
            if (!item) {
              if (founded) {
                showToast("This time is already assigned", "warning");
                return;
              }
            }
            isLoading.set(true);
            try {
              const option: CreateScheduleForFn = {
                classId: parseInt(classChoiser.get),
                day: selectedDay.get.toLowerCase(),
                groupId: parseInt(groupChoiser.get),
                startTime: startAt.get,
                endTime: endAt.get,
                teacherId: parseInt(teacherChoiser.get),
              };
              console.log(option);
              if (item) {
                await apis.updateSchedule(item.id, option);
              } else {
                await apis.createSchedule(option);
              }
              closeBottomSheet();
              setTemp("reloadSchedulesToIdle", true);
            } catch {}
            isLoading.set(false);
            // Add your code here
          }}
        >
          <Translate content={item ? "modify" : "add"} />
        </Button>
      </div>
      {isLoading.get && (
        <div
          className="absolute inset-0 flex justify-center items-center"
          style={{
            ...colorMerge("gray.opacity"),
          }}
        >
          <CircleLoading />
        </div>
      )}
    </EmptyComponent>
  );
};
