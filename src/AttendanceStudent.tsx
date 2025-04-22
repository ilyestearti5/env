import { allIcons } from "biqpod/ui/apis";
import { Card, Translate, Line, CircleTip, Icon } from "biqpod/ui/components";
import { closePopup, getTemp, useIdleStatus } from "biqpod/ui/hooks";
import { apis, Attendance } from "./apis";
import { useEffect } from "react";
interface AttendanceStudentProps {
  studentId: number;
}
export const AttendanceStudent = ({ studentId }: AttendanceStudentProps) => {
  const uidState = getTemp<string>("uid");
  const attendances = useIdleStatus(async () => {
    const attendances = await apis.getStudentAttendance(studentId);
    return attendances;
  }, []);
  useEffect(() => {
    if (uidState) {
      attendances.status.set("idle");
    }
  }, [uidState]);
  return (
    <Card className="max-md:w-5/6">
      <div className="flex justify-between items-center gap-2 p-3 w-full h-full">
        <h1 className="text-2xl capitalize">
          <Translate content="attendance" />
        </h1>
        <div>
          <CircleTip
            icon={allIcons.solid.faXmark}
            onClick={() => {
              // close the attendance teacher
              closePopup();
            }}
          />
        </div>
      </div>
      <Line />
      <div className="p-2">
        {attendances.data.get?.map((att) => {
          const date = new Date(att.dateTime);
          return (
            <div
              className="flex justify-between items-center gap-2 p-2"
              key={att.id!}
            >
              <div className="flex items-center gap-2">
                <Icon
                  iconClassName="text-[--biqpod-gray-opacity]"
                  icon={allIcons.solid.faClock}
                />
                <span>{date.toLocaleString()}</span>
              </div>
              <span className="text-3xl">
                {att.status === "Confirmed" && (
                  <Icon
                    iconClassName="text-[--biqpod-success]"
                    icon={allIcons.solid.faCheckCircle}
                  />
                )}
                {att.status === "Not Confirmed" && (
                  <Icon
                    iconClassName="text-[--biqpod-warning-text]"
                    icon={allIcons.solid.faClock}
                  />
                )}
                {att.status === "Refused" && (
                  <Icon
                    iconClassName="text-[--biqpod-error]"
                    icon={allIcons.solid.faTimesCircle}
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
