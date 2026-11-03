import React from 'react';

const SkeletonLoader = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/40 p-4 animate-pulse flex flex-col justify-between h-[380px]"
        >
          <div>
            {/* Image Placeholder */}
            <div className="w-full h-48 bg-slate-800/80 rounded-xl mb-4"></div>
            {/* Category Pill Placeholder */}
            <div className="w-20 h-4 bg-slate-800/60 rounded-full mb-2.5"></div>
            {/* Title Placeholder */}
            <div className="w-full h-5 bg-slate-800/90 rounded mb-2"></div>
            <div className="w-3/4 h-4 bg-slate-800/60 rounded mb-4"></div>
          </div>

          {/* Bottom Price & Button */}
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <div className="w-16 h-6 bg-slate-800/90 rounded"></div>
            <div className="w-24 h-8 bg-slate-800/90 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;

