import { Search } from "lucide-react";

export default function RightSection() {
  return (
    <div className="hidden lg:block w-[350px] pl-8 py-2">
      <div className="fixed w-[350px] h-screen overflow-y-auto pb-10">
        

        <div className="bg-gray-50 dark:bg-[#16181c] border border-gray-200 dark:border-none rounded-xl p-4 mb-4 transition-colors">
          <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Archive Info</h2>
          <div className="text-gray-600 dark:text-gray-500 text-sm">
            This is a read-only archive for 22/7 members. Data stored locally.
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 px-4">
          <span>
            <a
              href="https://suzuhana.moe"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Suzuhana Moe Project
            </a>
            , part of{' '}
            <img
              src="https://nananiji.zzzhxxx.top/assets/home/logo.svg"
              alt="22/7 Wiki"
              className="w-5 h-5 inline"
            />
            {' '}Project. © 2026 All rights reserved.
          </span>
        </div>
      </div>
    </div>
  );
}