"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { assignMemberTable } from "@/lib/actions/tables";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "主辦人",
  COLLABORATOR: "協作者",
  VIEWER: "檢視者",
};

const IDENTITY_LABEL: Record<string, string> = {
  GROOM: "新郎",
  BRIDE: "新娘",
  PARTNER: "新人",
  OTHER: "其他協助者",
};

export type CollaboratorRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: "OWNER" | "COLLABORATOR" | "VIEWER";
  identity: "GROOM" | "BRIDE" | "PARTNER" | "OTHER" | null;
  tableId: string | null;
};

export function CollaboratorsPreview({
  collaborators,
  tables,
}: {
  collaborators: CollaboratorRow[];
  tables: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleAssign(memberId: string, tableId: string) {
    startTransition(async () => {
      await assignMemberTable(memberId, tableId);
      router.refresh();
    });
  }

  return (
    <div className="panel mb-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-[15px]">協作管理者</div>
        <Link href="/more/collaborators" className="text-xs text-accent-hover font-semibold">
          管理
        </Link>
      </div>
      <div className="flex flex-col gap-1.5">
        {collaborators.map((c) => (
          <div key={c.id} className="lrow flex-wrap gap-y-1.5">
            <span className="w-6 h-6 rounded-full bg-accent-soft text-accent-hover text-[11px] font-bold grid place-items-center flex-none">
              {(c.name || c.email || "?").charAt(0)}
            </span>
            <div className="flex-1 min-w-0 font-medium text-sm">
              {c.name || c.email || "未命名"}
              <span className="text-text-faint text-xs font-normal">
                {" "}
                · {c.identity ? IDENTITY_LABEL[c.identity] : ROLE_LABEL[c.role]}
              </span>
            </div>
            <select
              defaultValue={c.tableId ?? ""}
              disabled={pending || tables.length === 0}
              onChange={(e) => handleAssign(c.id, e.target.value)}
              className="border border-border rounded-[9px] px-2 py-1 text-xs bg-card flex-none max-w-[110px]"
            >
              <option value="">未安排桌位</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
