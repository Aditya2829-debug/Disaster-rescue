export default function SOSButton({ onClick }) {
  return (
    <button
      id="sos-main-btn"
      aria-label="Send emergency SOS request"
      onClick={onClick}
      className="
        relative w-44 h-44 rounded-full
        bg-emergency text-white font-bold text-3xl
        border-4 border-emergency/40
        shadow-[0_0_0_12px_rgba(239,68,68,0.15),0_0_60px_rgba(239,68,68,0.4)]
        flex items-center justify-center
        active:scale-95 transition-transform duration-150
        focus:outline-none focus:ring-4 focus:ring-emergency/50
      "
    >
      <span className="select-none tracking-wider">SOS</span>
    </button>
  );
}
