export default function SessionHistoryPanel({ th, t, sessionHistory, formatSeconds }) {
  return (
    <div className={`mt-4 rounded-2xl border p-3 ${th.panel}`}>
      <p className={`text-sm font-semibold ${th.muted}`}>{t.sessionHistory}</p>
      {sessionHistory.length === 0 ? (
        <p className={`mt-2 text-xs ${th.subtle}`}>{t.emptyHistory}</p>
      ) : (
        <ul className="mt-2 max-h-28 space-y-2 overflow-y-auto pr-1">
          {sessionHistory.map((item) => (
            <li key={item.id} className={`rounded-lg border px-2 py-2 text-xs ${th.panelSoft}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className={`mr-2 font-medium ${th.muted}`}>
                    {t.cycle} {item.cycle}
                  </span>
                  <span className={`${th.subtle}`}>{item.goal || t.focus}</span>
                </div>
                <span className={`timer-font shrink-0 font-medium ${th.muted}`}>{formatSeconds(item.focusElapsedSeconds ?? 0)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
