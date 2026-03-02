export default function GoalPromptModal({ show, th, t, goalModalMode, goalInput, goalErrorKey, onGoalInputChange, onCancel, onSubmit }) {
  if (!show) return null;

  return (
    <div className={`absolute inset-0 z-20 grid place-items-center rounded-[30px] p-4 backdrop-blur-sm ${th.modalBackdrop}`}>
      <div className={`w-full rounded-2xl border p-4 ${th.modalCard}`}>
        <h2 className="text-lg font-semibold">{goalModalMode === "edit" ? t.goalEditTitle : t.goalTitle}</h2>
        <p className={`mt-1 text-sm ${th.subtle}`}>{goalModalMode === "edit" ? t.goalEditDesc : t.goalDesc}</p>

        <label className="mt-4 block">
          <span className={`mb-2 block text-sm ${th.muted}`}>{t.goalLabel}</span>
          <input
            autoFocus
            type="text"
            value={goalInput}
            onChange={(e) => onGoalInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
            placeholder={t.goalPlaceholder}
            className={`w-full rounded-xl border px-3 py-3 outline-none ${th.input}`}
          />
        </label>

        {goalErrorKey ? <p className="mt-2 text-sm text-red-400">{t[goalErrorKey]}</p> : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onCancel} className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${th.secondaryBtn}`}>
            {t.goalCancel}
          </button>
          <button onClick={onSubmit} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${th.primaryBtn}`}>
            {goalModalMode === "edit" ? t.goalSave : t.goalStart}
          </button>
        </div>
      </div>
    </div>
  );
}
