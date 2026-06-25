export type Task = {
  id: string;
  title: string;
  note?: string;
  done: boolean;
  daysBefore?: number;
  state?: "overdue" | "due" | "idle";
};

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "確認婚紗試穿時間",
    note: "婚紗禮服",
    done: false,
    daysBefore: 300,
    state: "overdue",
  },
  {
    id: "t2",
    title: "比較三家婚攝報價",
    note: "婚紗攝影",
    done: false,
    daysBefore: 296,
    state: "due",
  },
  { id: "t3", title: "擬訂初步賓客名單", done: false, daysBefore: 270 },
  { id: "t4", title: "預訂婚宴場地", done: true },
  { id: "t5", title: "簽訂場地合約", done: true },
];
