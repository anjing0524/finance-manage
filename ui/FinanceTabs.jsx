'use client';

import * as Tabs from '@radix-ui/react-tabs';
import Table from './Table';
import FinanceCalendar from './FinanceCalendar';

const FinanceTabs = ({ debts = [], events = [] }) => {
  return (
    <Tabs.Root
      className="flex w-full flex-col shadow-[0_2px_10px] shadow-blackA4"
      defaultValue="tab1"
    >
      <Tabs.List
        className="flex shrink-0 border-b border-mauve6"
        aria-label="Manage Finance"
      >
        <Tabs.Trigger
          className="flex h-[45px] flex-1 cursor-default select-none items-center justify-center bg-white px-5 text-[15px] leading-none text-mauve11 outline-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative "
          value="tab1"
        >
          债务管理
        </Tabs.Trigger>
        <Tabs.Trigger
          className="flex h-[45px] flex-1 cursor-default select-none items-center justify-center bg-white px-5 text-[15px] leading-none text-mauve11 outline-none first:rounded-tl-md last:rounded-tr-md hover:text-violet11 data-[state=active]:text-violet11 data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-current data-[state=active]:focus:relative "
          value="tab2"
        >
          还款管理
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content
        className="grow rounded-b-md bg-white p-5 outline-none "
        value="tab1"
      >
        <Table initialRows={debts} />
      </Tabs.Content>
      <Tabs.Content
        className="grow rounded-b-md bg-white p-5 outline-none "
        value="tab2"
      >
        <FinanceCalendar events={events} />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default FinanceTabs;
