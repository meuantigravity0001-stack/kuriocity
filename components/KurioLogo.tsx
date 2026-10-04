import React from 'react'

interface KurioLogoProps {
  className?: string
}

export const KurioLogo: React.FC<KurioLogoProps> = ({ className = 'h-9' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Ícone: Fusão de Pino de Mapa + Curió em Voo */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <defs>
          <linearGradient id="kurio-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Círculo de fundo suave */}
        <rect width="48" height="48" rx="12" fill="#F1F5F9" />

        {/* Pássaro Kurió / Pino GPS estilizado */}
        <path
          d="M24 10C17.3726 10 12 15.3726 12 22C12 28.5 20 37 24 38C28 37 36 28.5 36 22C36 15.3726 30.6274 10 24 10Z"
          fill="url(#kurio-grad)"
          opacity="0.15"
        />
        <path
          d="M16 25C16 25 20 17 27 17C32 17 35 20.5 35 20.5C35 20.5 30.5 22.5 27.5 22.5C23 22.5 20.5 26.5 16 25Z"
          fill="url(#kurio-grad)"
        />
        <path
          d="M24 37C25.5 35 32 27 32 22C32 17.5817 28.4183 14 24 14C19.5817 14 16 17.5817 16 22C16 23.5 16.8 25.5 18 27.5L24 37Z"
          stroke="url(#kurio-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="21" r="3" fill="#2563EB" />
      </svg>

      {/* Tipografia da Marca */}
      <div className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tight text-slate-900">
          Kurió<span className="text-blue-600">.</span>
        </span>
        <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-0.5">
          City Tour
        </span>
      </div>
    </div>
  )
}

export default KurioLogo
