import { weekSummary, type SunriseDaySchedule } from '../../booking/schedule';

interface WeekSummaryProps {
  days: SunriseDaySchedule[];
}

export default function WeekSummary({ days }: WeekSummaryProps) {
  return <p className="sunrise-cal__summary">{weekSummary(days)}</p>;
}
