export type CandidateStatus = "CANDIDATE" | "REJECTED" | "DECIDED";
export type Availability = "ok" | "wait" | "no";
export type CategoryState = "done" | "due" | "overdue" | "idle";

export type Candidate = {
  id: string;
  name: string;
  type?: string;
  price?: number;
  priceLabel?: string;
  availability?: Availability;
  pros?: string;
  cons?: string;
  note?: string;
  tag?: string;
  status: CandidateStatus;
  rejectedReason?: string;
  ratings: { member: string; score: number }[];
  comments: { member: string; content: string }[];
};

export type DecisionRecord = {
  chosenCandidateId: string;
  decidedBy: string;
  decidedAt: string;
  reason: string;
};

export type DecisionItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  month: string;
  state: CategoryState;
  statusText: string;
  metaText: string;
  candidates: Candidate[];
  decisionRecord?: DecisionRecord;
};

export const mockDecisionItems: DecisionItem[] = [
  {
    id: "d-venue",
    slug: "venue",
    title: "婚宴場地",
    category: "婚宴",
    month: "12月前",
    state: "done",
    statusText: "已定",
    metaText: "已定：晶華酒店 · 訂金已付",
    candidates: [
      {
        id: "c-venue-1",
        name: "晶華酒店",
        type: "宴會廳 · 都會",
        price: 480000,
        priceLabel: "1,280/桌",
        availability: "ok",
        status: "DECIDED",
        ratings: [{ member: "新娘", score: 5 }, { member: "新郎", score: 4 }],
        comments: [{ member: "新娘", content: "我喜歡這裡的採光。" }],
      },
      {
        id: "c-venue-2",
        name: "綠野莊園",
        type: "戶外庭園",
        price: 520000,
        availability: "ok",
        cons: "雨天備案需另外加價",
        status: "REJECTED",
        rejectedReason: "交通較不方便",
        ratings: [],
        comments: [],
      },
    ],
    decisionRecord: {
      chosenCandidateId: "c-venue-1",
      decidedBy: "新娘",
      decidedAt: "2026-01-10",
      reason: "交通方便、餐點評價好，訂金已付清。",
    },
  },
  {
    id: "d-planner",
    slug: "planner",
    title: "婚禮顧問 / 統籌",
    category: "婚顧",
    month: "11月前",
    state: "overdue",
    statusText: "逾期 · 比較中",
    metaText: "備選 2 家 · 已過建議決定時間",
    candidates: [
      {
        id: "c-planner-1",
        name: "A 婚顧工作室",
        type: "全包統籌",
        price: 68000,
        availability: "ok",
        status: "CANDIDATE",
        ratings: [{ member: "新郎", score: 5 }],
        comments: [],
      },
      {
        id: "c-planner-2",
        name: "B 統籌",
        type: "半包 · 當日",
        price: 45000,
        availability: "wait",
        status: "CANDIDATE",
        ratings: [],
        comments: [],
      },
    ],
  },
  {
    id: "d-dress",
    slug: "dress",
    title: "婚紗禮服",
    category: "婚紗",
    month: "8月前",
    state: "due",
    statusText: "本月該定",
    metaText: "備選 3 家",
    candidates: [
      {
        id: "c-dress-1",
        name: "La Belle 婚紗",
        type: "訂製 · 整體造型",
        price: 88000,
        availability: "ok",
        tag: "最喜歡",
        pros: "禮服風格多、可客製",
        cons: "價格較高，但方案比較完整",
        status: "CANDIDATE",
        ratings: [
          { member: "新娘", score: 5 },
          { member: "新郎", score: 4 },
          { member: "媽媽", score: 3 },
        ],
        comments: [
          { member: "新娘", content: "我喜歡這間的禮服風格。" },
          { member: "新郎", content: "價格比較高，但方案比較完整。" },
          { member: "媽媽", content: "交通比較不方便。" },
        ],
      },
      {
        id: "c-dress-2",
        name: "白紗工作室",
        type: "租賃 · 韓系",
        priceLabel: "套組 38,000",
        availability: "ok",
        status: "REJECTED",
        rejectedReason: "禮服款式較少",
        ratings: [],
        comments: [],
      },
      {
        id: "c-dress-3",
        name: "E 設計師品牌",
        type: "設計師 · 簡約",
        priceLabel: "套組 52,000",
        availability: "wait",
        status: "CANDIDATE",
        ratings: [],
        comments: [],
      },
    ],
  },
  {
    id: "d-photo",
    slug: "photo",
    title: "婚紗攝影",
    category: "婚攝",
    month: "8月前",
    state: "due",
    statusText: "本月該定",
    metaText: "備選 4 家",
    candidates: [
      {
        id: "c-photo-1",
        name: "光影紀錄工作室",
        type: "韓系清新",
        price: 68000,
        availability: "ok",
        tag: "最喜歡",
        pros: "風格自然、修圖快",
        status: "CANDIDATE",
        ratings: [{ member: "新郎", score: 5 }],
        comments: [],
      },
      {
        id: "c-photo-2",
        name: "G 婚攝",
        type: "自然紀實",
        price: 55000,
        availability: "ok",
        status: "CANDIDATE",
        ratings: [],
        comments: [],
      },
      {
        id: "c-photo-3",
        name: "H 影像",
        type: "電影感",
        price: 72000,
        availability: "no",
        status: "CANDIDATE",
        ratings: [],
        comments: [],
      },
      {
        id: "c-photo-4",
        name: "I 攝影",
        type: "日系",
        price: 60000,
        availability: "wait",
        status: "CANDIDATE",
        ratings: [],
        comments: [],
      },
    ],
  },
  {
    id: "d-video",
    slug: "video",
    title: "婚錄",
    category: "婚錄",
    month: "6月前",
    state: "idle",
    statusText: "未開始",
    metaText: "點開新增第一家備選",
    candidates: [],
  },
  {
    id: "d-ring",
    slug: "ring",
    title: "婚戒",
    category: "婚戒",
    month: "6月前",
    state: "idle",
    statusText: "未開始",
    metaText: "點開新增第一家備選",
    candidates: [],
  },
  {
    id: "d-cookie",
    slug: "cookie",
    title: "喜餅",
    category: "喜餅",
    month: "5月前",
    state: "idle",
    statusText: "未開始",
    metaText: "點開新增第一家備選",
    candidates: [],
  },
  {
    id: "d-mua",
    slug: "mua",
    title: "新祕 / 彩妝",
    category: "新祕",
    month: "3月前",
    state: "idle",
    statusText: "未開始",
    metaText: "點開新增第一家備選",
    candidates: [],
  },
  {
    id: "d-host",
    slug: "host",
    title: "主持人",
    category: "主持",
    month: "3月前",
    state: "idle",
    statusText: "未開始",
    metaText: "點開新增第一家備選",
    candidates: [],
  },
  {
    id: "d-favor",
    slug: "favor",
    title: "婚禮小物",
    category: "小物",
    month: "2月前",
    state: "idle",
    statusText: "未開始",
    metaText: "點開新增第一家備選",
    candidates: [],
  },
];

export function findDecisionItem(slug: string) {
  return mockDecisionItems.find((d) => d.slug === slug);
}

export const TODAY_AFTER_SLUG = "planner";
