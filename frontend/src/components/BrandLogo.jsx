export default function BrandLogo({ size = "md" }) {
  return (
    <div className={`brand-logo size-${size}`} aria-label="Tap2Eat">
      <span className="brand-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="presentation" focusable="false">
          <circle cx="32" cy="15" r="3" fill="currentColor" />
          <path
            d="M18 36C18 28.27 24.27 22 32 22C39.73 22 46 28.27 46 36"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M14 37.5H50"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M20 44H44"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M48 24C50.8 24 53 21.8 53 19"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M50 30C54.42 30 58 26.42 58 22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.65"
          />
        </svg>
      </span>

      <span className="brand-wordmark" aria-hidden="true">
        <span>Tap</span>
        <span className="brand-wordmark-accent">2</span>
        <span>Eat</span>
      </span>
    </div>
  );
}
