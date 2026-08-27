"use client";

import { useId, useRef, type PointerEvent } from "react";
import type { LandingCopy } from "@/features/landing/copy";

type HeroSceneProps = {
  scene: LandingCopy["scene"];
};

export function HeroScene({ scene }: HeroSceneProps) {
  const uid = useId().replace(/:/g, "");
  const stageRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const rect = stage.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.setProperty("--tilt-x", `${(py * -12).toFixed(2)}deg`);
    stage.style.setProperty("--tilt-y", `${(px * 16).toFixed(2)}deg`);
  };

  const onPointerLeave = () => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    stage.style.setProperty("--tilt-x", "0deg");
    stage.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div
      ref={stageRef}
      className="landing-stage relative isolate mx-auto h-[34rem] w-full max-w-[38rem] lg:h-[40rem]"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-hidden="true"
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 640 640">
        <defs>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="42%" r="48%">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#0f766e" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <circle cx="320" cy="300" r="280" fill={`url(#${uid}-glow)`} />
        <g className="landing-orbit landing-orbit-a" fill="none" stroke={`url(#${uid}-ring)`} strokeWidth="1.2">
          <ellipse cx="320" cy="300" rx="250" ry="92" opacity="0.55" />
        </g>
        <g className="landing-orbit landing-orbit-b" fill="none" stroke={`url(#${uid}-ring)`} strokeWidth="1.2">
          <ellipse cx="320" cy="300" rx="210" ry="210" opacity="0.28" />
        </g>
        <g className="landing-orbit landing-orbit-c" fill="none" stroke="#14b8a6" strokeWidth="1" opacity="0.35">
          <ellipse cx="320" cy="300" rx="168" ry="62" />
        </g>
        {[
          [320, 88],
          [520, 248],
          [470, 468],
          [170, 468],
          [120, 248],
        ].map(([x, y], index) => (
          <g key={`${x}-${y}`} className="landing-node" style={{ animationDelay: `${index * 0.4}s` }}>
            <circle cx={x} cy={y} r="5" fill="#fbbf24" />
            <circle cx={x} cy={y} r="12" fill="none" stroke="#fbbf24" strokeOpacity="0.4" />
          </g>
        ))}
      </svg>

      <div className="landing-world">
        <div className="landing-gyro">
          <span className="landing-gyro-ring landing-gyro-ring-x" />
          <span className="landing-gyro-ring landing-gyro-ring-y" />
          <span className="landing-gyro-ring landing-gyro-ring-z" />
        </div>

        <article className="landing-device">
          <div className="landing-device-shine" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-300">Nidhi</p>
          <p className="mt-3 text-xs text-zinc-400">{scene.balance}</p>
          <p className="mt-1 font-semibold tracking-tight text-white">₹ 4,82,610</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-teal-400 to-amber-300" />
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">{scene.health} · 82</p>
          <div className="mt-6 space-y-2">
            {[72, 54, 81, 40].map((width, index) => (
              <div key={width} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                <span
                  className="h-2 rounded-full bg-zinc-700"
                  style={{ width: `${width}%`, opacity: 0.7 - index * 0.1 }}
                />
              </div>
            ))}
          </div>
        </article>

        <aside className="landing-float landing-float-passbook">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            {scene.month}
          </p>
          <svg viewBox="0 0 160 56" className="mt-2 h-14 w-full">
            <path
              d="M4 40 C 28 38, 36 18, 52 22 S 84 48, 104 28 S 140 8, 156 16"
              fill="none"
              stroke="#0f766e"
              strokeWidth="3"
              strokeLinecap="round"
              className="landing-draw"
            />
            <circle cx="156" cy="16" r="4" fill="#f59e0b" />
          </svg>
        </aside>

        <aside className="landing-float landing-float-claim">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            {scene.claim}
          </p>
          <ol className="mt-2 space-y-1.5">
            {["1", "2", "3"].map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span
                  className={[
                    "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
                    index < 2
                      ? "bg-teal-600 text-white"
                      : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200",
                  ].join(" ")}
                >
                  {step}
                </span>
                <span className="h-1.5 flex-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              </li>
            ))}
          </ol>
        </aside>

        <aside className="landing-float landing-float-chat">
          <div className="flex items-center gap-2">
            <span className="relative grid h-8 w-8 place-items-center rounded-full bg-teal-600 text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 3a9 9 0 0 0-9 9 8.9 8.9 0 0 0 1.7 5.2L3 21l4.1-1.6A9 9 0 1 0 12 3Zm-3.2 8.2h6.4v1.6H8.8V11.2Zm0 3.2h4.4v1.6H8.8V14.4Z"
                />
              </svg>
              <span className="landing-pulse absolute inset-0 rounded-full" />
            </span>
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">{scene.ask}</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{scene.listening}</p>
            </div>
          </div>
        </aside>

        <span className="landing-coin landing-coin-a">₹</span>
        <span className="landing-coin landing-coin-b">₹</span>
        <span className="landing-coin landing-coin-c">₹</span>
      </div>
    </div>
  );
}
