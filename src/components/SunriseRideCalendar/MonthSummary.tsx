import { monthSummary, type SunriseDaySchedule } from '../../booking/schedule';

interface MonthSummaryProps {
  days: SunriseDaySchedule[];
  monthKey: string;
}

export default function MonthSummary({ days, monthKey }: MonthSummaryProps) {
  return <p className="sunrise-cal__summary">{monthSummary(days, monthKey)}</p>;
}
