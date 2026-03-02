export default function ConfettiOverlay({ showConfetti, confettiBurstId, confettiPieces }) {
  if (!showConfetti) return null;

  return (
    <div className="confetti-overlay absolute inset-0 z-10 overflow-hidden rounded-[30px] pointer-events-none">
      {confettiPieces.map((piece, index) => (
        <span
          key={`${confettiBurstId}-${index}`}
          className="confetti-piece confetti-burst"
          style={{
            left: `${piece.left}%`,
            top: `${piece.top}%`,
            width: `${piece.width}px`,
            height: `${piece.height}px`,
            backgroundColor: piece.color,
            "--tx": `${piece.tx}px`,
            "--ty": `${piece.ty}px`,
            "--rot": `${piece.rotate}deg`,
            "--dur": `${piece.duration}s`,
            "--delay": `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
