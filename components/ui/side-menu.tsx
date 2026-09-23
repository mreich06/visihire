'use client';

import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export type MenuItem = {
  id: string;
  title: string;
  icon: LucideIcon;
};

interface SideMenuProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  menuItems: MenuItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const SideMenu = ({ menuItems, selectedId, onSelect, className, ...props }: SideMenuProps) => {
  return (
    <nav className={cn('flex flex-col gap-1 rounded-xl bg-zinc-50 p-2', className)} {...props}>
      {menuItems.map(({ id, title, icon: Icon }) => {
        const isSelected = id === selectedId;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn(
              'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
              isSelected ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700',
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="side-menu-highlight"
                className="absolute inset-0 rounded-lg bg-white"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4 shrink-0" />
            <span className="relative z-10 truncate">{title}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default SideMenu;
