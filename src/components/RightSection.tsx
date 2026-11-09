interface RightSectionProps {
  children?: React.ReactNode;
  afterAbout?: React.ReactNode;
  profile?: boolean;
}

export default function RightSection({ children, afterAbout, profile = false }: RightSectionProps) {
  return (
    <div
      className={`
        flex-col gap-4 h-fit
        ${profile ? "flex w-full lg:col-start-2 2xl:col-auto 2xl:w-[350px]" : "hidden 2xl:flex w-[350px]"}
        ${profile
          ? 'mt-4'
          : 'sticky top-4'
        }
      `}
    >

      {children}

      {afterAbout}

      <div className="text-center text-sm text-muted-foreground px-4 leading-relaxed">
        <span>
          <a
            href="https://suzuhana.moe"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium"
          >
            Project Suzuhana Moe
          </a>
          <br />
          © 2026 22/7 WiKi All rights reserved.
        </span>
      </div>
    </div>
  );
}
