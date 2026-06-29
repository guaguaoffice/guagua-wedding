import Link from "next/link";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "主辦人",
  COLLABORATOR: "協作者",
  VIEWER: "檢視者",
};

export type CollaboratorRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: "OWNER" | "COLLABORATOR" | "VIEWER";
};

export function CollaboratorsPreview({ collaborators }: { collaborators: CollaboratorRow[] }) {
  return (
    <div className="panel mb-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-[15px]">協作管理者</div>
        <Link href="/more/collaborators" className="text-xs text-accent-hover font-semibold">
          管理
        </Link>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {collaborators.map((c) => (
          <span
            key={c.id}
            className="text-[12px] font-medium pl-1 pr-2.5 py-1 rounded-full bg-card-hover text-text flex items-center gap-1.5"
          >
            <span className="w-5 h-5 rounded-full bg-accent-soft text-accent-hover text-[11px] font-bold grid place-items-center flex-none">
              {(c.name || c.email || "?").charAt(0)}
            </span>
            {c.name || c.email || "未命名"}
            <span className="text-text-faint">· {ROLE_LABEL[c.role]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
