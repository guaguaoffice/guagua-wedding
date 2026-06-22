export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-24 animate-fade-in">
      <h1 className="text-3xl font-semibold">呱呱婚禮</h1>
      <p className="text-muted text-center max-w-md">
        讓新人與家人可以共同完成婚禮規劃的工作台。
      </p>
      <div className="flex gap-3">
        <a href="/dashboard" className="btn btn-primary animate-cta-pulse">
          進入婚禮總覽
        </a>
        <button className="btn btn-secondary">了解更多</button>
      </div>
    </main>
  );
}
