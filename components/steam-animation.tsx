'use client'

export function SteamAnimation() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
        <style>{`
          @keyframes steam1 {
            0% {
              opacity: 0;
              transform: translateY(0) translateX(0);
            }
            10% {
              opacity: 0.8;
            }
            50% {
              opacity: 0.4;
            }
            100% {
              opacity: 0;
              transform: translateY(-120px) translateX(15px);
            }
          }
          @keyframes steam2 {
            0% {
              opacity: 0;
              transform: translateY(0) translateX(0);
            }
            15% {
              opacity: 0.7;
            }
            55% {
              opacity: 0.3;
            }
            100% {
              opacity: 0;
              transform: translateY(-140px) translateX(-20px);
            }
          }
          @keyframes steam3 {
            0% {
              opacity: 0;
              transform: translateY(0) translateX(0);
            }
            12% {
              opacity: 0.75;
            }
            52% {
              opacity: 0.35;
            }
            100% {
              opacity: 0;
              transform: translateY(-130px) translateX(8px);
            }
          }
          .steam-wisp-1 {
            animation: steam1 3s ease-out infinite;
            animation-delay: 0s;
          }
          .steam-wisp-2 {
            animation: steam2 3.5s ease-out infinite;
            animation-delay: 0.8s;
          }
          .steam-wisp-3 {
            animation: steam3 3.2s ease-out infinite;
            animation-delay: 1.6s;
          }
        `}</style>
      </defs>

      {/* Steam wisps rising from center-right of card */}
      <g filter="url(#blur)">
        {/* Wisp 1 */}
        <path
          className="steam-wisp-1"
          d="M 600 100 Q 610 80, 615 60 Q 618 40, 615 20"
          stroke="#d4a574"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        {/* Wisp 2 */}
        <path
          className="steam-wisp-2"
          d="M 600 100 Q 590 75, 580 50 Q 575 30, 580 0"
          stroke="#d45a3a"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Wisp 3 */}
        <path
          className="steam-wisp-3"
          d="M 600 100 Q 605 78, 610 55 Q 612 35, 608 15"
          stroke="#d4a574"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>
    </svg>
  )
}
