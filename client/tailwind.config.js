export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base:      '#0F172A',
        card:      '#1E293B',
        emergency: '#EF4444',
        warning:   '#F59E0B',
        safe:      '#22C55E',
        muted:     '#94A3B8',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      minHeight:  { touch: '48px' },
    },
  },
  plugins: [],
};
