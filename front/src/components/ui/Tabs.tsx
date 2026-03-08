'use client';

import React from 'react';

interface Tab<T = string | number> {
  label: string;
  value: T;
}

interface TabsProps<T = string | number> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabClick: (value: T) => void;
  className?: string;
}

function Tabs<T>({ tabs, activeTab, onTabClick, className = '' }: TabsProps<T>) {
  return (
    <div className={`p-1 bg-gray-950/40 backdrop-blur-md rounded-2xl border border-white/5 w-fit min-w-max mx-auto sm:mx-0 ${className} overflow-x-auto scrollbar-hide`}>
      <nav className="flex items-center gap-1.5" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={String(tab.value)}
            onClick={() => onTabClick(tab.value)}
            className={`whitespace-nowrap py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-95
              ${activeTab === tab.value
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 ring-2 ring-blue-500/10'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
              }
            `}
            aria-current={activeTab === tab.value ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}


export default Tabs;
