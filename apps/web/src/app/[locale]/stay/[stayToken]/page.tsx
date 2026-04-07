import React from 'react';

export default function StayClientView({ params }: { params: { locale: string, stayToken: string } }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white px-6 py-8 rounded-b-[40px] shadow-sm mb-6 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Le Baobab</h1>
        <p className="text-slate-500 mt-1">Séjour #{params.stayToken.substring(0, 8)}</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-md mx-auto px-6">
        <h2 className="text-lg font-medium text-slate-700 mb-4">Comment pouvons-nous vous aider ?</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white p-6 rounded-3xl flex flex-col items-center gap-3 hover:shadow-md transition-shadow border border-slate-100">
             <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl">🍽️</div>
             <span className="font-medium text-slate-700 text-sm">Room Service</span>
          </button>
          <button className="bg-white p-6 rounded-3xl flex flex-col items-center gap-3 hover:shadow-md transition-shadow border border-slate-100">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">🧹</div>
             <span className="font-medium text-slate-700 text-sm">Ménage</span>
          </button>
          <button className="bg-white p-6 rounded-3xl flex flex-col items-center gap-3 hover:shadow-md transition-shadow border border-slate-100">
             <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl">💆‍♀️</div>
             <span className="font-medium text-slate-700 text-sm">Spa</span>
          </button>
          <button className="bg-white p-6 rounded-3xl flex flex-col items-center gap-3 hover:shadow-md transition-shadow border border-slate-100">
             <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl">🛎️</div>
             <span className="font-medium text-slate-700 text-sm">Concierge</span>
          </button>
        </div>
        
        {/* Floating Cart Placeholder */}
        <div className="mt-8 bg-[#A3F085] p-5 rounded-3xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-[#92df76] transition-colors">
            <span className="font-semibold text-slate-900">Voir le Panier</span>
            <span className="bg-white/50 text-slate-900 px-3 py-1 rounded-full font-medium text-sm border border-black/5">0 items</span>
        </div>
      </div>
    </div>
  );
}
