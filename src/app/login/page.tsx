import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-24 animate-fade-in">
      <h1 className="text-2xl font-semibold">登入呱呱婚禮</h1>
      <p className="text-muted text-center max-w-sm">
        使用 Google 帳號登入，開始與另一半、家人共同規劃婚禮。
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button type="submit" className="btn btn-primary">
          使用 Google 登入
        </button>
      </form>
    </main>
  );
}
