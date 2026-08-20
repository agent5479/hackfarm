import { horizonSummary, type SunriseDaySchedule } from '../../booking/schedule';

interface HorizonSummaryProps {
  days: SunriseDaySchedule[];
}

export default function HorizonSummary({ days }: HorizonSummaryProps) {
  return <p className="sunrise-cal__summary">{horizonSummary(days)}</p>;
}
