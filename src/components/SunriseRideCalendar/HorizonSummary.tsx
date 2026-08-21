import { dualHorizonSummary, type DualDaySchedule } from '../../booking/schedule';

interface HorizonSummaryProps {
  days: DualDaySchedule[];
}

export default function HorizonSummary({ days }: HorizonSummaryProps) {
  return <p className="sunrise-cal__summary">{dualHorizonSummary(days)}</p>;
}
