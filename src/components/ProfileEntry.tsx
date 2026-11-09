// Entrance for member pages. CSS (.page-enter-up) for the same reason as HomeEntry.
export default function ProfileEntry({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter-up flex flex-row w-full min-h-screen">
      {children}
    </div>
  );
}
