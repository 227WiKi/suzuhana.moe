"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CalendarWidgetProps {
  initialDate?: string; 
}

export default function CalendarWidget({ initialDate }: CalendarWidgetProps) {
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(() => {
    return initialDate ? new Date(initialDate) : new Date();
  });

  useEffect(() => {
    if (initialDate) {
      setCurrentDate(new Date(initialDate));
    }
  }, [initialDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(parseInt(e.target.value), month, 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(year, parseInt(e.target.value), 1));
  };

  // 点击日期跳转
  const handleDateClick = (day: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;

    const url = new URL(window.location.href);
    url.searchParams.set('date', dateStr);
    router.push(url.pathname + url.search);
  };

  const currentYear = new Date().getFullYear();
  const yearsRange = Array.from({ length: currentYear - 2016 + 2 }, (_, i) => 2016 + i);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="bg-white dark:bg-[#16181c] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm mb-4">
      
      {/* 头部控制区 */}
      <div className="flex items-center justify-between mb-4">
        
        {/* 年月选择器组 */}
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-[#008CD2]" />
          
          <div className="flex gap-1">
            {/* 月份选择 */}
            <div className="relative group">
              <select 
                value={month} 
                onChange={handleMonthChange}
                className="appearance-none bg-transparent font-bold text-gray-900 dark:text-white text-sm pr-4 cursor-pointer focus:outline-none hover:text-[#008CD2] transition-colors"
              >
                {monthNames.map((name, index) => (
                  <option key={name} value={index} className="bg-white dark:bg-[#16181c] text-black dark:text-white">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* 年份选择 */}
            <div className="relative group">
              <select 
                value={year} 
                onChange={handleYearChange}
                className="appearance-none bg-transparent font-bold text-gray-900 dark:text-white text-sm pr-3 cursor-pointer focus:outline-none hover:text-[#008CD2] transition-colors"
              >
                {yearsRange.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-[#16181c] text-black dark:text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 左右翻页按钮 */}
        <div className="flex gap-1">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
          <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* 星期表头 */}
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} />;
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day as number)}
              className="
                h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                text-gray-700 dark:text-gray-300
                hover:bg-[#008CD2] hover:text-white hover:font-bold
                transition-all duration-200
              "
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}