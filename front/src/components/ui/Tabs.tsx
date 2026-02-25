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
    <div className={`border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => onTabClick(tab.value)}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === tab.value
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
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
