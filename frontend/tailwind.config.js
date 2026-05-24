/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',
        'border-focus': 'var(--border-focus)',
        text: 'var(--text)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'primary-light': 'var(--primary-light)',
        'primary-pale': 'var(--primary-pale)',
        
        teal: 'var(--teal)',
        'teal-light': 'var(--teal-light)',
        'teal-mid': 'var(--teal-mid)',
        'teal-pale': 'var(--teal-pale)',
        
        coral: 'var(--coral)',
        'coral-light': 'var(--coral-light)',
        'coral-mid': 'var(--coral-mid)',
        
        purple: 'var(--purple)',
        'purple-light': 'var(--purple-light)',
        'purple-pale': 'var(--purple-pale)',
        
        blue: 'var(--blue)',
        'blue-light': 'var(--blue-light)',
        'blue-pale': 'var(--blue-pale)',
        
        green: 'var(--green)',
        'green-light': 'var(--green-light)',
        'green-pale': 'var(--green-pale)',
        
        danger: 'var(--danger)',
        'danger-light': 'var(--danger-light)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--card-shadow)',
        hover: 'var(--hover-shadow)',
        toast: 'var(--toast-shadow)',
      }
    },
  },
  plugins: [],
}
