export type CandidateStatus = "CANDIDATE" | "REJECTED" | "DECIDED";

export type Candidate = {
  id: string;
  name: string;
  type?: string;
  price?: number;
  url?: string;
  pros?: string;
  cons?: string;
  note?: string;
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
  candidates: Candidate[];
  decisionRecord?: DecisionRecord;
};

export const mockDecisionItems: DecisionItem[] = [
  {
    id: "d1",
    slug: "venue",
    title: "婚宴場地",
    category: "婚宴",
    candidates: [
      {
        id: "c1",
        name: "晴空樓",
        type: "飯店宴會廳",
        price: 480000,
        pros: "交通方便、餐點評價好",
        cons: "場地較小",
        status: "CANDIDATE",
        ratings: [{ member: "新娘", score: 5 }, { member: "新郎", score: 4 }],
        comments: [{ member: "新娘", content: "我喜歡這裡的採光。" }],
      },
      {
        id: "c2",
        name: "綠野莊園",
        type: "戶外庭園",
        price: 520000,
        pros: "空間大、適合戶外儀式",
        cons: "雨天備案需另外加價",
        status: "CANDIDATE",
        ratings: [{ member: "新娘", score: 4 }, { member: "媽媽", score: 3 }],
        comments: [{ member: "媽媽", content: "交通比較不方便。" }],
      },
      {
        id: "c3",
        name: "old-castle",
        type: "城堡風宴會廳",
        price: 560000,
        status: "REJECTED",
        rejectedReason: "預算超出太多",
        ratings: [],
        comments: [],
      },
    ],
  },
  {
    id: "d2",
    slug: "dress",
    title: "婚紗店",
    category: "婚紗",
    candidates: [
      {
        id: "c4",
        name: "La Belle 婚紗",
        type: "整體造型",
        price: 88000,
        pros: "禮服風格多、可客製",
        cons: "價格較高，但方案比較完整",
        status: "DECIDED",
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
        id: "c5",
        name: "白紗工作室",
        type: "個人工作室",
        price: 62000,
        status: "REJECTED",
        rejectedReason: "禮服款式較少",
        ratings: [],
        comments: [],
      },
    ],
    decisionRecord: {
      chosenCandidateId: "c4",
      decidedBy: "新娘",
      decidedAt: "2026-05-02",
      reason: "整體方案最完整，禮服風格也最符合期待。",
    },
  },
  {
    id: "d3",
    slug: "photographer",
    title: "婚攝",
    category: "婚攝",
    candidates: [
      {
        id: "c6",
        name: "光影紀錄工作室",
        type: "婚攝",
        price: 38000,
        pros: "風格自然、修圖快",
        status: "CANDIDATE",
        ratings: [{ member: "新郎", score: 5 }],
        comments: [],
      },
    ],
  },
];

export function findDecisionItem(slug: string) {
  return mockDecisionItems.find((d) => d.slug === slug);
}
