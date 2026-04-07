'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientLogin() {
  const [step, setStep] = useState<'welcome' | 'form'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Consider it valid if there's an email and a password of at least 8 chars (like the mockup says)
  const isFormValid = email.length > 5 && password.length >= 8;

  return (
    <div className="min-h-screen bg-[#F6F7FB] font-sans flex flex-col justify-start sm:justify-center items-center">
      <div className="w-full max-w-md h-screen sm:h-auto sm:min-h-[812px] relative shadow-[0_20px_50px_rgba(0,0,0,0.06)] sm:rounded-[40px] bg-white flex flex-col overflow-hidden">
        
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col h-full w-full absolute inset-0 bg-white"
            >
              {/* Dark top section with deep curve */}
              <div className="relative h-[45%] w-full flex-shrink-0">
                {/* Extending width and curving bottom to create a smooth, deep arc */}
                <div className="absolute top-0 left-[-25%] w-[150%] h-full bg-[#0B1528] rounded-b-[45%] shadow-lg overflow-hidden">
                   {/* Subtle texture/bg details in the dark section (like the mockup has tiny stars/dots) */}
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]" />
                </div>
                
                {/* Logo overlap (Floating precisely on the edge) */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[88px] h-[88px] bg-white rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.05)] flex items-center justify-center z-20">
                  <div className="w-10 h-10 bg-gradient-to-tr from-[#0F3520] via-[50%] via-[#1D5E34] to-[#A3F085] rounded-tl-[24px] rounded-br-[24px] rounded-tr-[4px] rounded-bl-[4px] transform -rotate-45" />
                </div>
              </div>

              {/* Bottom text section */}
              <div className="flex-1 flex flex-col items-center justify-start px-8 pt-20 pb-12 z-0 relative bg-white">
                <div className="text-center flex-1 w-full max-w-[280px]">
                  <h1 className="text-[32px] font-medium text-slate-900 tracking-tight mb-3">Le Baobab</h1>
                  <p className="text-[#5D6B7A] text-[15px] leading-relaxed">A platform built for a new way of working</p>
                </div>

                <div className="w-full mt-auto">
                  <button 
                    onClick={() => setStep('form')}
                    className="mx-auto w-[240px] flex items-center justify-center gap-2 bg-[#A3F085] hover:bg-[#8DE46E] text-[#0A1110] font-semibold text-[15px] py-4 rounded-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Get Started for Free 
                    <span className="text-[17px] leading-none ml-1">›</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col h-full w-full px-8 py-10 bg-white"
            >
              <div className="flex justify-center items-center gap-3 mb-4 mt-2">
                <div className="w-6 h-6 bg-gradient-to-tr from-[#0F3520] via-[50%] via-[#1D5E34] to-[#A3F085] rounded-tl-[12px] rounded-br-[12px] rounded-tr-[2px] rounded-bl-[2px] transform -rotate-45" />
                <h2 className="text-[22px] font-medium tracking-tight text-slate-900">Le Baobab</h2>
              </div>
              <p className="text-center text-[#5D6B7A] text-[15px] mb-10">Work without limits</p>

              <div className="space-y-6 flex-1 w-full max-w-sm mx-auto">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="block text-[14px] font-medium text-slate-900 ml-1">Your email address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dilerragip@gmail.com" 
                    className="w-full px-5 py-4 border border-[#EAEEF3] rounded-[24px] focus:outline-none focus:ring-1 focus:ring-[#A3F085] focus:border-[#A3F085] text-[15px] text-slate-900 placeholder:text-[#9AA5B1]"
                  />
                </div>
                
                {/* Password Field */}
                <div className="space-y-2 relative">
                  <label className="block text-[14px] font-medium text-slate-900 ml-1">Choose a password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="min. 8 characters" 
                      className="w-full pl-5 pr-12 py-4 border border-[#EAEEF3] rounded-[24px] focus:outline-none focus:ring-1 focus:ring-[#A3F085] focus:border-[#A3F085] text-[15px] text-slate-900 placeholder:text-[#9AA5B1]"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#9AA5B1] hover:text-slate-600 focus:outline-none transition-colors"
                    >
                      {/* Using a simple eye-slash/eye icon */}
                      {showPassword ? (
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      ) : (
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button 
                    disabled={!isFormValid}
                    className={`w-full py-4 rounded-[24px] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 ${
                      isFormValid 
                      ? 'bg-[#A3F085] hover:bg-[#8DE46E] text-slate-900 transform active:scale-[0.98]' 
                      : 'bg-[#F2F4F7] text-[#9AA5B1] cursor-not-allowed'
                    }`}
                  >
                    Continue
                    <span className="text-[17px] leading-none ml-1">›</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative py-2 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#EAEEF3]"></div></div>
                  <div className="relative bg-white px-4 text-[12px] font-medium text-[#9AA5B1]">or</div>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3 pb-8">
                  <button className="w-full py-[14px] border border-[#EAEEF3] rounded-[24px] flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors bg-white font-medium text-[15px] text-slate-700">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign up with Google
                  </button>
                  <button className="w-full py-[14px] border border-[#EAEEF3] rounded-[24px] flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors bg-white font-medium text-[15px] text-slate-700">
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.34-.85 3.73-.78 1.5.03 2.7.53 3.5 1.54-3.05 1.76-2.53 5.92.54 7.15-.65 1.75-1.62 3.39-2.85 4.26zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Sign up with Apple
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
