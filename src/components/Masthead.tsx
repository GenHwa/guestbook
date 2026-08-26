import { TOTAL_ENTRIES, formatCount } from "@/lib/data";

export default function Masthead({ count }: { count: number }) {
  return (
    <section id="top" className="px-1 pb-7 pt-10 sm:pt-14">
      <p className="mb-3 text-[11px] tracking-[0.22em] text-muted">
        2026 · SEOUL
      </p>
      <h1 className="font-serif-ko text-[34px] font-bold leading-[1.25] text-ink sm:text-[42px]">
        오가는 이들이
        <br />한 마디씩 남기고 갑니다
      </h1>
      <p className="mt-5 max-w-[42ch] text-[14px] leading-[1.85] text-ink-soft">
        누구든 편하게 쓰고 가세요. 길어도 좋고, 한 줄이어도 좋습니다.
      </p>
      <p className="mt-4 text-[12.5px] text-muted">
        지금까지 {formatCount(TOTAL_ENTRIES)}개 · 오늘 {count}개
      </p>
      <div className="mt-8 h-px bg-line" />
    </section>
  );
}
