export type TimelineTask = {
  id: string;
  title: string;
  completed: boolean;
  decisionSlug?: string;
};

export type TimelinePhase = {
  id: string;
  title: string;
  tasks: TimelineTask[];
};

export const mockTimelinePhases: TimelinePhase[] = [
  {
    id: "p12",
    title: "婚禮前 12 個月",
    tasks: [
      { id: "t1", title: "確定婚禮日期與預算", completed: true },
      { id: "t2", title: "選擇婚宴場地", completed: false, decisionSlug: "venue" },
    ],
  },
  {
    id: "p10",
    title: "婚禮前 10 個月",
    tasks: [
      { id: "t3", title: "選擇婚紗店", completed: true, decisionSlug: "dress" },
    ],
  },
  {
    id: "p8",
    title: "婚禮前 8 個月",
    tasks: [
      { id: "t4", title: "選擇婚攝", completed: false, decisionSlug: "photographer" },
      { id: "t5", title: "選擇新秘", completed: false },
    ],
  },
  {
    id: "p6",
    title: "婚禮前 6 個月",
    tasks: [
      { id: "t6", title: "訂喜餅", completed: false },
      { id: "t7", title: "挑選婚戒", completed: false },
    ],
  },
  {
    id: "p3",
    title: "婚禮前 3 個月",
    tasks: [
      { id: "t8", title: "印製喜帖", completed: false },
      { id: "t9", title: "確認賓客名單", completed: false },
    ],
  },
  {
    id: "p1m",
    title: "婚禮前 1 個月",
    tasks: [{ id: "t10", title: "確認婚禮當天流程", completed: false }],
  },
  {
    id: "p1w",
    title: "婚禮前 1 週",
    tasks: [{ id: "t11", title: "彩排", completed: false }],
  },
  {
    id: "pday",
    title: "婚禮當天",
    tasks: [{ id: "t12", title: "迎娶、儀式、宴客", completed: false }],
  },
  {
    id: "pafter",
    title: "婚禮後",
    tasks: [{ id: "t13", title: "寄送謝卡、整理照片", completed: false }],
  },
];
