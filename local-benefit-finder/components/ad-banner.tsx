"use client";

import { useEffect } from "react";

type AdBannerProps = {
  slot?: string;
  label: string;
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export function AdBanner({ slot, label, className = "" }: AdBannerProps) {
  const isConfigured = Boolean(clientId && slot);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // 광고 스크립트 로딩 타이밍 이슈 시 안전하게 무시
    }
  }, [isConfigured, slot]);

  if (!isConfigured) {
    return (
      <div
        className={`rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500 ${className}`}
      >
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-xs">광고 슬롯 설정 전 미리보기 영역</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 ${className}`}>
      <p className="mb-2 text-center text-xs text-slate-500">{label}</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
