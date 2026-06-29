import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMembership, createOwnWedding } from "@/lib/wedding";
import { JoinByLinkForm } from "@/app/welcome/JoinByLinkForm";

export default async function WelcomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const existing = await getMembership();
  if (existing) redirect("/");

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-16 min-h-screen">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="呱呱婚禮"
            width={72}
            height={72}
            className="w-18 h-18 rounded-2xl object-cover mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold">歡迎使用呱呱婚禮</h1>
          <p className="text-text-soft mt-2">
            你目前還沒有任何婚禮，先告訴我們你的情況。
          </p>
        </div>

        <div className="panel mb-4">
          <div className="font-bold text-[15px] mb-1">我要規劃自己的婚禮</div>
          <p className="text-[12.5px] text-text-soft mb-3">
            建立一場新的婚禮，你會是主辦人，之後可以邀請另一半、家人一起協作。
          </p>
          <form
            action={async () => {
              "use server";
              await createOwnWedding();
            }}
          >
            <button type="submit" className="btn btn-primary w-full">
              ＋ 建立新婚禮
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="font-bold text-[15px] mb-1">我是被邀請來協作的</div>
          <p className="text-[12.5px] text-text-soft mb-3">
            如果新人已經給你邀請連結，貼在下面即可加入他們的婚禮。
          </p>
          <JoinByLinkForm />
        </div>
      </div>
    </main>
  );
}
