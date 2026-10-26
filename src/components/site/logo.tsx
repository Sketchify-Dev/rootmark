export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={className ?? "rm-logo-mark"}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 512 512" role="img" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="112" fill="#062b8a" />
        <g opacity="0.07" stroke="white" strokeWidth="1">
          <line x1="64" y1="384" x2="448" y2="384" />
          <line x1="64" y1="404" x2="448" y2="404" />
        </g>
        <g fill="white">
          <path d="M 140 120 L 140 136 L 156 136 L 156 368 L 140 368 L 140 384 L 232 384 L 232 368 L 216 368 L 216 276 L 232 276 L 314 384 L 380 384 L 272 268 C 318 248 340 212 340 172 C 340 130 310 120 264 120 H 140 Z M 156 136 L 264 136 C 300 136 322 150 322 172 C 322 198 304 232 272 232 L 216 232 L 216 248 L 234 248 L 216 232 L 216 136 Z" />
        </g>
        <path d="M 216 152 L 264 152 C 290 152 304 160 304 172 C 304 192 290 216 272 216 L 216 216 Z" fill="#062b8a" />
        <circle cx="400" cy="400" r="48" fill="white" />
        <circle cx="400" cy="400" r="40" fill="#e6dbc7" />
        <circle cx="400" cy="400" r="7" fill="#062b8a" opacity="0.16" />
        <path d="M 386 400 L 393 410 L 414 390" fill="none" stroke="#062b8a" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
