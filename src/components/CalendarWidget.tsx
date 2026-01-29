"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CalendarWidgetProps {
  minDate?: string; 
  maxDate?: string; 
}

export default function CalendarWidget({ minDate, maxDate }: CalendarWidgetProps) {
  const router = useRouter();

  const minD = minDate ? new Date(minDate) : new Date('2016-01-01');
  const maxD = maxDate ? new Date(maxDate) : new Date();

  const [currentDate, setCurrentDate] = useState(() => {
    return maxDate ? new Date(maxDate) : new Date();
  });

  useEffect(() => {
    if (maxDate) {
      setCurrentDate(new Date(maxDate));
    }
  }, [maxDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const isAtMinLimit = year === minD.getFullYear() && month <= minD.getMonth();
  const isAtMaxLimit = year === maxD.getFullYear() && month >= maxD.getMonth();

  const handlePrevMonth = () => {
    if (isAtMinLimit) return;
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    if (isAtMaxLimit) return;
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    let newMonth = month;

    const minYear = minD.getFullYear();
    const maxYear = maxD.getFullYear();
    const minMonth = minD.getMonth();
    const maxMonth = maxD.getMonth();

    if (newYear === minYear && newMonth < minMonth) {
      newMonth = minMonth;
    } else if (newYear === maxYear && newMonth > maxMonth) {
      newMonth = maxMonth;
    }

    setCurrentDate(new Date(newYear, newMonth, 1));
  };

  // 月份选择处理
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
    router.push(url.pathname + url.search, { scroll: false });
  };

  const yearsRange = [];
  const startY = minD.getFullYear();
  const endY = maxD.getFullYear();
  for (let y = startY; y <= endY; y++) {
    yearsRange.push(y);
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const availableMonths = monthNames.map((name, index) => ({ name, index })).filter(({ index }) => {
    if (year === minD.getFullYear() && index < minD.getMonth()) return false;
    if (year === maxD.getFullYear() && index > maxD.getMonth()) return false;
    return true;
  });

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="bg-white dark:bg-[#16181c] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm mb-4">
      
      {/* 头部控制区 */}
      <div className="flex items-center justify-between mb-4">
        
        {/* 年月选择器 */}
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-[#008CD2]" />
          
          <div className="flex gap-1">
            {/* 月份 Select */}
            <div className="relative group">
              <select 
                value={month} 
                onChange={handleMonthChange}
                className="appearance-none bg-transparent font-bold text-gray-900 dark:text-white text-sm pr-4 cursor-pointer focus:outline-none hover:text-[#008CD2] transition-colors"
              >
                {availableMonths.map(({ name, index }) => (
                  <option key={name} value={index} className="bg-white dark:bg-[#16181c] text-black dark:text-white">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* 年份 Select */}
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
          <button 
            onClick={handlePrevMonth} 
            disabled={isAtMinLimit}
            className={`p-1 rounded-full transition-colors ${
              isAtMinLimit 
                ? 'opacity-30 cursor-not-allowed text-gray-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          
          <button 
            onClick={handleNextMonth} 
            disabled={isAtMaxLimit}
            className={`p-1 rounded-full transition-colors ${
              isAtMaxLimit 
                ? 'opacity-30 cursor-not-allowed text-gray-400' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 星期和日期网格 (保持不变) */}
      <div className="grid grid-cols-7 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

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