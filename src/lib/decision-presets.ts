export type DecisionPreset = {
  title: string;
  category: string;
  /** 建議在婚禮前幾個月決定 */
  months: number;
};

export const DECISION_PRESETS: DecisionPreset[] = [
  { title: "鮮花 / 捧花", category: "鮮花", months: 2 },
  { title: "試菜", category: "婚宴", months: 5 },
  { title: "喜帖", category: "喜帖", months: 4 },
  { title: "新郎西裝", category: "西裝", months: 6 },
  { title: "蜜月旅行", category: "蜜月", months: 4 },
  { title: "婚禮錄影直播", category: "婚錄", months: 3 },
  { title: "交通接送", category: "交通", months: 2 },
  { title: "證婚人", category: "儀式", months: 4 },
  { title: "婚禮樂團 / 主持音樂", category: "音樂", months: 3 },
  { title: "保險", category: "其他", months: 6 },
];
