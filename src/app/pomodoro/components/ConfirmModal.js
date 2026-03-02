export default function ConfirmModal({
  show,
  th,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmClassName,
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  return (
    <div className={`absolute inset-0 z-30 grid place-items-center rounded-[30px] p-4 backdrop-blur-sm ${th.modalBackdrop}`}>
      <div className={`w-full rounded-2xl border p-4 ${th.modalCard}`}>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className={`mt-1 text-sm ${th.subtle}`}>{description}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onConfirm} className={confirmClassName}>
            {confirmLabel}
          </button>
          <button onClick={onCancel} className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${th.secondaryBtn}`}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
