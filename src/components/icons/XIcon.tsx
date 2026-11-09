import type { SVGProps } from "react";

interface XIconProps extends Omit<SVGProps<SVGSVGElement>, "strokeWidth"> {
  size?: number | string;
  // Accepted so XIcon can stand in for a lucide icon; the logo is a filled shape.
  strokeWidth?: number | string;
}

// Official X logo mark; lucide-react only ships the old Twitter bird.
export default function XIcon({ size, className = size === undefined ? "size-4" : undefined, strokeWidth: _strokeWidth, ...props }: XIconProps) {
  void _strokeWidth;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width={size} height={size} className={className} {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
