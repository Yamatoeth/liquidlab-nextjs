"use client";
import React, { useEffect, useState } from "react";

const STORAGE_KEY = "liquidlab_onboarding_dismissed_v1";

const Onboarding: React.FC = () => {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setHidden(false);
    } catch (e) {
      setHidden(false);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {
      /* ignore */
    }
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div className="onboarding-toast fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-2xl border border-[rgba(216,178,110,0.28)] bg-[rgba(12,18,26,0.9)] px-4 py-3 shadow-2xl backdrop-blur-md">
      <div className="flex w-full max-w-3xl items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="text-sm font-semibold">Welcome to Liquid Lab</div>
          <div className="text-xs text-muted-foreground">New: bigger previews, warm theme, and improved accessibility.</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              dismiss();
            }}
            className="btn-primary px-4 py-2 text-sm"
          >
            Start tour
          </button>
          <button aria-label="Dismiss onboarding" onClick={dismiss} className="text-sm text-muted-foreground hover:text-foreground">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
