export type Vendor = {
  id: string;
  name: string;
  category: string;
  decisionTitle: string;
  type: string;
  priceLabel: string;
  description: string;
};

export const VENDOR_DIRECTORY: Vendor[] = [
  {
    id: "v1",
    name: "晴空樓",
    category: "婚宴",
    decisionTitle: "婚宴場地",
    type: "飯店宴會廳",
    priceLabel: "約 1,300 / 桌起",
    description: "交通方便、餐點評價好，適合 10～20 桌的中型婚宴。",
  },
  {
    id: "v2",
    name: "綠野莊園",
    category: "婚宴",
    decisionTitle: "婚宴場地",
    type: "戶外庭園",
    priceLabel: "約 1,500 / 桌起",
    description: "適合戶外證婚儀式，備有雨天備案場地。",
  },
  {
    id: "v3",
    name: "La Belle 婚紗",
    category: "婚紗",
    decisionTitle: "婚紗禮服",
    type: "訂製 · 整體造型",
    priceLabel: "套組約 80,000 起",
    description: "禮服款式多、可客製化調整，含整體造型團隊。",
  },
  {
    id: "v4",
    name: "光影紀錄工作室",
    category: "婚攝",
    decisionTitle: "婚紗攝影",
    type: "韓系清新",
    priceLabel: "約 60,000 起",
    description: "風格自然、修圖快，檔期熱門建議提早預約。",
  },
  {
    id: "v5",
    name: "A 婚顧工作室",
    category: "婚顧",
    decisionTitle: "婚禮顧問 / 統籌",
    type: "全包統籌",
    priceLabel: "約 60,000 起",
    description: "提供婚禮前期規劃到當天流程統籌的全包服務。",
  },
  {
    id: "v6",
    name: "甜時光喜餅",
    category: "喜餅",
    decisionTitle: "喜餅",
    type: "傳統 + 創意餅",
    priceLabel: "每盒約 150～350",
    description: "提供多種口味組合，可客製喜餅卡與提袋設計。",
  },
  {
    id: "v7",
    name: "花漾工作室",
    category: "鮮花",
    decisionTitle: "鮮花 / 捧花",
    type: "歐式自然風",
    priceLabel: "捧花約 3,000 起",
    description: "提供捧花、桌花、拱門佈置一站式花藝服務。",
  },
  {
    id: "v8",
    name: "聲動主持團隊",
    category: "主持",
    decisionTitle: "主持人",
    type: "中英雙語主持",
    priceLabel: "約 15,000 起",
    description: "擅長掌控節奏與互動遊戲，可中英雙語主持。",
  },
];
