'use client';
import { Calendar } from 'antd';
import dateFnsGenerateConfig from 'rc-picker/es/generate/dateFns';
import locale from 'antd/es/calendar/locale/zh_CN';
import { isSameDay, isSameMonth, isSameYear } from 'date-fns';

const DateFnsCalendar = Calendar.generateCalendar(dateFnsGenerateConfig);

export default function FinanceCalendar({ events = [] }) {
  const monthCellRender = (value) => {
    const sum = events
      .filter(
        ({ repayDate }) =>
          isSameYear(repayDate, value) && isSameMonth(repayDate, value),
      )
      .reduce((acc, cur) => (acc += cur.amount), 0);
    if (sum > 0) {
      return (
        <div>
          <span>
            <p className=" text-indigo-400 hover:bg-indigo-300 ">
              本月贷款应还总额:{sum}
            </p>
          </span>
        </div>
      );
    }
    return null;
  };
  const dateCellRender = (value) => {
    const isSameDayList = events.filter(({ repayDate }) =>
      isSameDay(value, repayDate),
    );
    return (
      <div className="overflow-y-auto">
        <ul>
          {isSameDayList.map((e) => (
            <li key={e.id}>
              <p className=" text-indigo-400 hover:bg-indigo-300 ">
                {e.debt.name}应还{e.amount}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    if (info.type === 'month') return monthCellRender(current);
    return info.originNode;
  };

  return <DateFnsCalendar cellRender={cellRender} locale={locale} />;
}
