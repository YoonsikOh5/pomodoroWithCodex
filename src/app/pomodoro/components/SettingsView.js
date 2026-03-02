import { LockIcon } from "../icons";

export default function SettingsView({
  tSettings,
  thSettings,
  canEditTimeSettings,
  focusInput,
  breakInput,
  languageInput,
  themeInput,
  progressBarInput,
  settingsErrorKey,
  onFocusInputChange,
  onBreakInputChange,
  onLanguageChange,
  onThemeChange,
  onProgressBarChange,
  onClose,
  onSave,
}) {
  return (
    <main className={`min-h-[100dvh] ${thSettings.page} px-3 py-4 ${thSettings.text}`}>
      <section className={`mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[420px] flex-col rounded-[30px] border p-5 backdrop-blur-2xl ${thSettings.shell}`}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{tSettings.settings}</h1>
          <button onClick={onClose} className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${thSettings.secondaryBtn}`}>
            {tSettings.backToTimer}
          </button>
        </div>

        <p className={`text-sm ${thSettings.subtle}`}>{tSettings.settingsDesc}</p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <div className={`mb-2 flex items-center gap-1 text-sm ${thSettings.muted}`}>
              <span>{tSettings.focusMinutes}</span>
              {!canEditTimeSettings ? (
                <span className={thSettings.subtle} aria-hidden="true">
                  <LockIcon />
                </span>
              ) : null}
            </div>
            <input
              type="number"
              min="1"
              max="180"
              value={focusInput}
              onChange={(e) => onFocusInputChange(e.target.value)}
              disabled={!canEditTimeSettings}
              className={`w-full rounded-xl border px-3 py-3 outline-none disabled:cursor-not-allowed ${thSettings.input} ${thSettings.disabledInput}`}
            />
          </label>

          <label className="block">
            <div className={`mb-2 flex items-center gap-1 text-sm ${thSettings.muted}`}>
              <span>{tSettings.breakMinutes}</span>
              {!canEditTimeSettings ? (
                <span className={thSettings.subtle} aria-hidden="true">
                  <LockIcon />
                </span>
              ) : null}
            </div>
            <input
              type="number"
              min="1"
              max="60"
              value={breakInput}
              onChange={(e) => onBreakInputChange(e.target.value)}
              disabled={!canEditTimeSettings}
              className={`w-full rounded-xl border px-3 py-3 outline-none disabled:cursor-not-allowed ${thSettings.input} ${thSettings.disabledInput}`}
            />
            {!canEditTimeSettings ? <p className={`mt-1 text-xs ${thSettings.subtle}`}>{tSettings.timeEditHint}</p> : null}
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={`mb-2 block text-sm ${thSettings.muted}`}>{tSettings.language}</span>
              <select value={languageInput} onChange={(e) => onLanguageChange(e.target.value)} className={`w-full rounded-xl border px-3 py-3 outline-none ${thSettings.input}`}>
                <option value="ko" className="text-black">
                  {tSettings.langKo}
                </option>
                <option value="en" className="text-black">
                  {tSettings.langEn}
                </option>
              </select>
            </label>

            <label className="block">
              <span className={`mb-2 block text-sm ${thSettings.muted}`}>{tSettings.theme}</span>
              <select value={themeInput} onChange={(e) => onThemeChange(e.target.value)} className={`w-full rounded-xl border px-3 py-3 outline-none ${thSettings.input}`}>
                <option value="light" className="text-black">
                  {tSettings.light}
                </option>
                <option value="dark" className="text-black">
                  {tSettings.dark}
                </option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className={`mb-2 block text-sm ${thSettings.muted}`}>{tSettings.progressBar}</span>
            <select value={progressBarInput} onChange={(e) => onProgressBarChange(e.target.value)} className={`w-full rounded-xl border px-3 py-3 outline-none ${thSettings.input}`}>
              <option value="runner" className="text-black">
                {tSettings.progressBarRunner}
              </option>
              <option value="none" className="text-black">
                {tSettings.progressBarNone}
              </option>
            </select>
          </label>
        </div>

        {settingsErrorKey ? <p className="mt-3 text-sm text-red-400">{tSettings[settingsErrorKey]}</p> : null}

        <button onClick={onSave} className={`mt-auto rounded-xl border px-4 py-3 text-sm font-semibold transition ${thSettings.primaryBtn}`}>
          {tSettings.save}
        </button>
      </section>
    </main>
  );
}
