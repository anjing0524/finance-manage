'use client';

import { cn } from '@/lib/utils';
import { cx } from '@emotion/css';
import { SquaresPlusIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useState } from 'react';

// 菜单定义
const demos = [
  {
    name: '面板',
    key: 'dashboard',
    items: [
      {
        name: '画布',
        slug: 'dashboard/canvas',
        description: 'canvas with wasm',
      },
    ],
  },
];

/**
 *   通用导航组件
 */
export function GlobalNav() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <div className="fixed top-0 z-10 flex w-full flex-col border-b border-gray-200 bg-white lg:bottom-0 lg:z-auto lg:w-72 lg:border-b-0 lg:border-r lg:border-gray-200">
      <div className="flex h-14 items-center px-4 py-4 lg:h-auto">
        <Link
          href="/"
          className="group flex w-full items-center gap-x-2.5"
          onClick={close}
        >
          <div className="h-7 w-7 border-gray-300 group-hover:border-white/50">
            <SquaresPlusIcon />
          </div>

          <h3 className="font-semibold tracking-wide text-gray-800">画布</h3>
        </Link>
      </div>

      <div
        className={cx('overflow-y-auto lg:static lg:block', {
          'fixed inset-x-0 bottom-0 top-14 mt-px bg-white': isOpen,
          hidden: !isOpen,
        })}
      >
        <nav className="space-y-6 px-2 py-5">
          {demos.map((section) => {
            return (
              <div key={section.key}>
                <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-800/80">
                  <div>{section.name}</div>
                </div>

                <div className="space-y-1">
                  {section.items.map((item) => (
                    <GlobalNavItem key={item.slug} item={item} close={close} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// 导航元素
function GlobalNavItem({ item, close = () => false }) {
  const segment = useSelectedLayoutSegment();
  const isActive = item.slug === segment;
  return (
    <Link
      onClick={close}
      href={{ pathname: `/${item.slug}` }}
      className={cn(
        'block rounded-md px-3 py-2 text-sm font-medium hover:text-blue-500',
        {
          'text-gray-800 hover:bg-gray-200': !isActive,
          'bg-white text-blue-500': isActive,
        },
      )}
    >
      {item.name}
    </Link>
  );
}
