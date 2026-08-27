interface TideCalendarLoadingProps {
  message: string;
}

export function LoadingSpinner() {
  return <span className="sunrise-cal__spinner" aria-hidden="true" />;
}

export default function TideCalendarLoading({ message }: TideCalendarLoadingProps) {
  return (
    <div className="sunrise-cal__loading" role="status" aria-live="polite">
      <LoadingSpinner />
      <p className="sunrise-cal__loading-text">{message}</p>
    </div>
  );
}
