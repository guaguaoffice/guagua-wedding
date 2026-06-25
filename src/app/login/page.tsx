import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { getCurrentWedding } from "@/lib/wedding";

export default async function LoginPage() {
  const current = await getCurrentWedding();
  if (current) redirect("/");

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-24 animate-fade-in min-h-screen">
      <div className="w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-accent to-accent-hover grid place-items-center text-white font-display font-semibold text-2xl">
        呱
      </div>
      <h1 className="text-2xl font-bold">登入呱呱婚禮</h1>
      <p className="text-text-soft text-center max-w-sm">
        使用 Google 帳號登入，開始與另一半、家人共同規劃婚禮。
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button type="submit" className="btn btn-primary">
          使用 Google 登入
        </button>
      </form>
    </main>
  );
}
