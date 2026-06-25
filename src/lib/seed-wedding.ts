import { prisma } from "@/lib/prisma";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function monthsBeforeDate(weddingDate: Date, months: number) {
  return new Date(weddingDate.getTime() - months * 30.4 * MS_PER_DAY);
}

export async function seedDefaultWeddingData(weddingId: string, ownerUserId: string) {
  const wedding = await prisma.wedding.findUniqueOrThrow({ where: { id: weddingId } });
  const weddingDate = wedding.weddingDate ?? new Date();

  const venue = await prisma.decisionItem.create({
    data: {
      weddingId,
      title: "婚宴場地",
      category: "婚宴",
      order: 0,
      suggestedDecideBy: monthsBeforeDate(weddingDate, 12),
      candidates: {
        create: [
          {
            name: "晶華酒店",
            type: "宴會廳 · 都會",
            price: 480000,
            availability: "OK",
            status: "DECIDED",
          },
          {
            name: "綠野莊園",
            type: "戶外庭園",
            price: 520000,
            availability: "OK",
            cons: "雨天備案需另外加價",
            status: "REJECTED",
            rejectedReason: "交通較不方便",
          },
        ],
      },
    },
    include: { candidates: true },
  });
  const venueWinner = venue.candidates.find((c) => c.status === "DECIDED")!;
  await prisma.decisionRecord.create({
    data: {
      decisionItemId: venue.id,
      chosenCandidateId: venueWinner.id,
      decidedById: ownerUserId,
      reason: "交通方便、餐點評價好，訂金已付清。",
    },
  });

  await prisma.decisionItem.create({
    data: {
      weddingId,
      title: "婚禮顧問 / 統籌",
      category: "婚顧",
      order: 1,
      suggestedDecideBy: monthsBeforeDate(weddingDate, 11),
      candidates: {
        create: [
          { name: "A 婚顧工作室", type: "全包統籌", price: 68000, availability: "OK" },
          { name: "B 統籌", type: "半包 · 當日", price: 45000, availability: "WAIT" },
        ],
      },
    },
  });

  await prisma.decisionItem.create({
    data: {
      weddingId,
      title: "婚紗禮服",
      category: "婚紗",
      order: 2,
      suggestedDecideBy: monthsBeforeDate(weddingDate, 8),
      candidates: {
        create: [
          {
            name: "La Belle 婚紗",
            type: "訂製 · 整體造型",
            price: 88000,
            availability: "OK",
            tag: "最喜歡",
            pros: "禮服風格多、可客製",
            cons: "價格較高，但方案比較完整",
          },
          {
            name: "白紗工作室",
            type: "租賃 · 韓系",
            note: "套組 38,000",
            availability: "OK",
            status: "REJECTED",
            rejectedReason: "禮服款式較少",
          },
          { name: "E 設計師品牌", type: "設計師 · 簡約", note: "套組 52,000", availability: "WAIT" },
        ],
      },
    },
  });

  await prisma.decisionItem.create({
    data: {
      weddingId,
      title: "婚紗攝影",
      category: "婚攝",
      order: 3,
      suggestedDecideBy: monthsBeforeDate(weddingDate, 8),
      candidates: {
        create: [
          {
            name: "光影紀錄工作室",
            type: "韓系清新",
            price: 68000,
            availability: "OK",
            tag: "最喜歡",
            pros: "風格自然、修圖快",
          },
          { name: "G 婚攝", type: "自然紀實", price: 55000, availability: "OK" },
          { name: "H 影像", type: "電影感", price: 72000, availability: "CONFLICT" },
          { name: "I 攝影", type: "日系", price: 60000, availability: "WAIT" },
        ],
      },
    },
  });

  const idleCategories: { title: string; category: string; months: number }[] = [
    { title: "婚錄", category: "婚錄", months: 6 },
    { title: "婚戒", category: "婚戒", months: 6 },
    { title: "喜餅", category: "喜餅", months: 5 },
    { title: "新祕 / 彩妝", category: "新祕", months: 3 },
    { title: "主持人", category: "主持", months: 3 },
    { title: "婚禮小物", category: "小物", months: 2 },
  ];
  for (const [i, cat] of idleCategories.entries()) {
    await prisma.decisionItem.create({
      data: {
        weddingId,
        title: cat.title,
        category: cat.category,
        order: 4 + i,
        suggestedDecideBy: monthsBeforeDate(weddingDate, cat.months),
      },
    });
  }

  const plannerItem = await prisma.decisionItem.findFirstOrThrow({
    where: { weddingId, title: "婚禮顧問 / 統籌" },
  });
  const dressItem = await prisma.decisionItem.findFirstOrThrow({
    where: { weddingId, title: "婚紗禮服" },
  });
  const photoItem = await prisma.decisionItem.findFirstOrThrow({
    where: { weddingId, title: "婚紗攝影" },
  });

  await prisma.budgetItem.createMany({
    data: [
      {
        weddingId,
        decisionItemId: venue.id,
        name: "婚宴場地 · 晶華酒店",
        category: "婚宴",
        totalAmount: 184000,
        depositAmount: 60000,
        paidAmount: 60000,
        status: "PARTIAL",
        note: "1,280 / 桌 × 12 桌 · 已付訂金 60,000",
        dueDate: new Date(Date.now() + 30 * MS_PER_DAY),
      },
      {
        weddingId,
        decisionItemId: plannerItem.id,
        name: "婚禮顧問",
        category: "婚顧",
        totalAmount: 60000,
        depositAmount: 20000,
        paidAmount: 0,
        status: "UNPAID",
        note: "簽約後支付",
        dueDate: new Date(Date.now() - 5 * MS_PER_DAY),
      },
      {
        weddingId,
        decisionItemId: dressItem.id,
        name: "婚紗禮服",
        category: "婚紗",
        totalAmount: 45000,
        paidAmount: 0,
        status: "UNPAID",
        note: "預估",
      },
      {
        weddingId,
        decisionItemId: photoItem.id,
        name: "婚紗攝影",
        category: "婚攝",
        totalAmount: 65000,
        paidAmount: 0,
        status: "UNPAID",
        note: "預估",
      },
      {
        weddingId,
        name: "新祕 · 婚錄 · 婚戒 · 其他",
        category: "其他",
        totalAmount: 0,
        paidAmount: 0,
        status: "UNPAID",
        note: "尚未估列",
      },
    ],
  });

  const phase = await prisma.timelinePhase.create({
    data: { weddingId, title: "待辦事項", order: 0 },
  });
  await prisma.timelineTask.createMany({
    data: [
      {
        phaseId: phase.id,
        title: "確認婚紗試穿時間",
        order: 0,
        completed: false,
        decisionItemId: dressItem.id,
      },
      {
        phaseId: phase.id,
        title: "比較三家婚攝報價",
        order: 1,
        completed: false,
        decisionItemId: photoItem.id,
      },
      { phaseId: phase.id, title: "擬訂初步賓客名單", order: 2, completed: false },
      { phaseId: phase.id, title: "預訂婚宴場地", order: 3, completed: true },
      { phaseId: phase.id, title: "簽訂場地合約", order: 4, completed: true },
    ],
  });
}
