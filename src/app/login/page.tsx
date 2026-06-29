import Image from "next/image";
import { redirect } from "next/navigation";
import { signIn, auth } from "@/lib/auth";
import { getMembership } from "@/lib/wedding";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    const current = await getMembership();
    redirect(current ? "/" : "/welcome");
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-24 animate-fade-in min-h-screen">
      <Image
        src="/logo.png"
        alt="呱呱婚禮"
        width={96}
        height={96}
        className="w-24 h-24 rounded-2xl object-cover"
      />
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
