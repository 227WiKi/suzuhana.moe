// Entrance for the homepage. A CSS animation (.page-enter-down) rather than
// framer-motion: framer's opacity animation could end one frame before it wrote
// the final value, so the page blinked back to its initial opacity 0.
export default function HomeEntry({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter-down w-full min-h-screen flex flex-col">
      {children}
    </div>
  );
}
