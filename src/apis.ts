import { getUserFunction } from "biqpod/ui/apis";
export interface Schedule {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  group: {
    id: number;
  };
  class: {
    id: number;
    roomNumber: string;
  };
  teacher: {
    id: number;
    firstName: string;
    lastName: string;
  };
}
export interface CreateScheduleForFn {
  startTime: string;
  endTime: string;
  groupId: number;
  day: string;
  classId: number;
  teacherId: number;
}
export type Teacher = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  rfid: string;
  grade: string;
};
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  rfid: string;
  username: string;
}
export interface LogAccesse {
  id: number;
  rfid: string;
  dateTime: string;
  classId: number;
  class: string;
}
export interface Device {
  id: number;
  macAddress: string;
  password: string;
  psk: string;
  classId: number;
  class: {
    id: number;
    roomNumber: string;
    device: string;
    logAccesses: LogAccesse[];
    schedules: {
      id: number;
      startTime: string;
      day: string;
      endTime: string;
      groupId: number;
      classId: number;
      teacherId: number;
      module: string;
      class: string;
      group: {
        id: number;
        schedules: string[];
        studentGroups: {
          id: number;
          studentId: number;
          groupId: number;
          group: string;
          student: {
            id: number;
            personId: number;
            person: string;
            studentAttendances: {
              studentId: number;
              attendanceId: number;
              status: string;
              attendance: string;
              student: string;
            }[];
            studentGroups: string[];
          };
        }[];
      };
      teacher: {
        id: number;
        grade: string;
        personId: number;
        person: {
          id: number;
          firstName: string;
          lastName: string;
          username: string;
          passwordHash: string;
          rfid: string;
          admin: {
            id: number;
            personId: number;
            person: string;
          };
          student: {
            id: number;
            personId: number;
            person: string;
            studentAttendances: {
              studentId: number;
              attendanceId: number;
              status: string;
              attendance: string;
              student: string;
            }[];
            studentGroups: string[];
          };
          teacher: string;
          permissions: {
            id: number;
            role: string;
            privilege: string;
            people: string[];
          }[];
        };
        schedules: string[];
        teacherAttendances: {
          teacherId: number;
          attendanceId: number;
          status: string;
          attendance: {
            id: number;
            dateTime: string;
            studentAttendances: {
              studentId: number;
              attendanceId: number;
              status: string;
              attendance: string;
              student: string;
            }[];
            teacherAttendances: string[];
          };
          teacher: string;
        }[];
      };
    }[];
  };
}
export interface Attendance {
  id?: number;
  firstName: string;
  lastName: string;
  username: string;
  rfid: string;
  status: "Not Confirmed" | "Confirmed" | "Refused";
  dateTime: string;
}
export interface ClassRoom {
  id: number;
  roomNumber: string;
}
export type RequestedDevices = Record<
  string,
  "approved" | "pending" | "refused"
>;
export interface StudentInGroup {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
}
export interface RequestDevice {
  requestId: string;
  status: "approved" | "pending" | "refused";
}
interface Group {
  id: number;
}
export const apis = {
  async getAllSchedules() {
    const fn = await getUserFunction<Schedule[]>("Schedule.All", false, {
      method: "GET",
      isQuery: true,
    });
    return await fn?.({});
  },
  async getSchedule(id: number) {
    const fn = await getUserFunction<Schedule>("Schedule.One." + id, false, {
      method: "GET",
      isQuery: true,
    });
    return await fn?.({});
  },
  async deleteSchedule(id: number) {
    const fn = await getUserFunction<void>("Schedule.Delete." + id, false, {
      method: "DELETE",
    });
    return await fn?.({});
  },
  async createSchedule(data: CreateScheduleForFn) {
    const fn = await getUserFunction<void>("Schedule.Create", false, {
      method: "POST",
    });
    return await fn?.(data);
  },
  async updateSchedule(id: number, data: CreateScheduleForFn) {
    const fn = await getUserFunction<void>("Schedule.Update." + id, false, {
      method: "PUT",
    });
    return await fn?.(data);
  },
  async getAllTeachers() {
    const fn = await getUserFunction<Teacher[]>("Teacher.All", false, {
      method: "GET",
      isQuery: true,
    });
    return await fn?.({});
  },
  async getAllStudents() {
    const fn = await getUserFunction<Student[]>("Student.All", false, {
      method: "GET",
      isQuery: true,
    });
    return await fn?.({});
  },
  async getTeacher(id: number) {
    const fn = await getUserFunction<Teacher>("Teacher.One." + id, false, {
      method: "GET",
      isQuery: true,
    });
    return await fn?.({});
  },
  async getStudent(id: number) {
    const fn = await getUserFunction<Student>("Student.One." + id, false, {
      method: "GET",
      isQuery: true,
    });
    return await fn?.({});
  },
  async getClasses() {
    const fn = await getUserFunction<ClassRoom[]>("Class.All", false, {
      method: "GET",
      isQuery: true,
    });
    return await fn?.({});
  },
  async getRequetedDevices(): Promise<RequestDevice[]> {
    const fn = await getUserFunction<RequestedDevices>(
      "device.configuration.requested-devices",
      false,
      {
        method: "GET",
        isQuery: true,
      }
    );
    const object = await fn?.({});
    return Object.entries(object || {}).map(([requestId, status]) => ({
      requestId,
      status,
    }));
  },
  async getAllGroupes() {
    const fn = await getUserFunction<Group[]>("Group.All", false, {
      method: "GET",
      isQuery: true,
    });
    return await fn?.({});
  },
  async getStudentsInGroup(id: number) {
    const fn = await getUserFunction<StudentInGroup[]>(
      "Group.Students." + id,
      false,
      {
        method: "GET",
        isQuery: true,
      }
    );
    return await fn?.({});
  },
  async getAllDevices() {
    const fn = await getUserFunction<Device[]>("Device.All", false, {
      method: "GET",
      isQuery: true,
    });
    return await fn?.({});
  },
  async deleteDevice(id: number) {
    const fn = await getUserFunction<void>("Device.Delete." + id, false, {
      method: "DELETE",
      isQuery: true,
    });
    return await fn?.({});
  },
  async approveDevice(id: string) {
    const fn = await getUserFunction<void>(
      "device.configuration.approve." + id,
      false,
      {
        method: "POST",
      }
    );
    return await fn?.({});
  },
  async refuseDevice(id: string) {
    const fn = await getUserFunction<void>(
      "device.configuration.refuse." + id,
      false,
      {
        method: "DELETE",
      }
    );
    return await fn?.({});
  },
  async getStudentAttendance(id: number) {
    const fn = await getUserFunction<Attendance[]>(
      "Student." + id + ".Attendances",
      false,
      {
        method: "GET",
        isQuery: true,
      }
    );
    return await fn?.({});
  },
  async getTeacherAttendance(id: number) {
    const fn = await getUserFunction<Attendance[]>(
      "Teacher." + id + ".Attendances",
      false,
      {
        method: "GET",
        isQuery: true,
      }
    );
    return await fn?.({});
  },
};
