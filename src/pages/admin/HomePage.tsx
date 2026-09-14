import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import ArrowNext from "@/assets/admin/arrow-next.svg?react";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <main className="flex flex-col h-dvh  bg-gray-10 gap-8 pt-[calc(var(--safe-top)+12px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Header showBack title="환승여행 관리자 페이지" />

      <section className="flex justify-center">
        <div className="flex flex-col gap-2.5 w-[360px]">
          <button
            className="flex justify-between text-black select-none bg-white px-3 py-4 rounded-lg"
            onClick={() => navigate("/admin/place")}
          >
            <span className="text-title-01 font-semibold leading-1.4 tracking-[-0.45px]">
              장소
            </span>
            <ArrowNext />
          </button>
          <button
            className="flex justify-between text-black select-none bg-white px-3 py-4 rounded-lg"
            onClick={() => navigate("/admin/trash")}
          >
            <span className="text-title-01 font-semibold leading-1.4 tracking-[-0.45px]">
              휴지통
            </span>
            <ArrowNext />
          </button>
        </div>
      </section>
    </main>
  );
}
