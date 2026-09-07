import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import bookAnimationData from '../data/bookLoadingAnimation.json';
import { Sparkles } from 'lucide-react';

interface BookLoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export const BookLoadingScreen: React.FC<BookLoadingScreenProps> = ({
  message = 'Đang tải thời khóa biểu mới nhất...',
  subMessage = 'Đang đồng bộ dữ liệu học tập dịu dàng từ máy chủ...',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: bookAnimationData,
    });

    return () => {
      anim.destroy();
    };
  }, []);

  return (
    <div
      id="app-loading-screen"
      className="fixed inset-0 z-[9999] bg-[#faf7f5]/98 backdrop-blur-md flex flex-col items-center justify-center p-4 selection:bg-rose-200 transition-opacity duration-300"
    >
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* Lottie Animation Container - Reduced size, 100% transparent, no white square */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
          {/* Subtle soft pastel ambient glow */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-rose-200/35 via-purple-200/25 to-amber-100/30 blur-xl animate-pulse pointer-events-none" />
          <div
            id="book-lottie-container"
            ref={containerRef}
            className="w-full h-full relative z-10 scale-110 sm:scale-120 drop-shadow-xs"
          />
        </div>

        {/* Loading text with pastel styling */}
        <div className="mt-2 space-y-1.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" />
            <span>Đang chuẩn bị trang sách</span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-gray-800 tracking-tight font-display">
            {message}
          </h2>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            {subMessage}
          </p>
        </div>

        {/* Mini progress pulse dots */}
        <div className="flex items-center gap-1.5 mt-4">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
};
