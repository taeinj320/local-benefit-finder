"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  BENEFIT_ITEMS,
  type BenefitItem,
  type BenefitCategory,
  type ChildAgeGroup,
  type ChildStatus,
  type Gender,
  type MarriageStatus,
} from "@/data/benefits";
import { REGION_OPTIONS } from "@/data/regions";
import { AdBanner } from "@/components/ad-banner";
import {
  filterBenefitsFromItems,
  getAgeFromBirthYear,
  type UserProfile,
} from "@/lib/filter-benefits";

const categoryOptions: BenefitCategory[] = ["주거", "금융", "건강", "교육", "문화"];
const marriageOptions: MarriageStatus[] = ["미혼", "신혼", "기혼"];
const childOptions: ChildStatus[] = ["없음", "있음", "계획 중"];
const childAgeOptions: Exclude<ChildAgeGroup, "해당 없음">[] = ["0~4세", "5~10세", "11~18세"];
const genderOptions: Exclude<Gender, "전체">[] = ["여성", "남성"];
const provinceOptions = Object.keys(REGION_OPTIONS);

const initialProfile: UserProfile = {
  province: "서울특별시",
  city: "전체",
  birthYear: 1992,
  gender: "여성",
  marriageStatus: "신혼",
  childStatus: "계획 중",
  childAgeGroup: "해당 없음",
  categories: ["주거", "금융"],
};

export default function Home() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [selectedBenefitId, setSelectedBenefitId] = useState<string | null>(null);
  const [allBenefits, setAllBenefits] = useState<BenefitItem[]>(BENEFIT_ITEMS);
  const [isLoadingBenefits, setIsLoadingBenefits] = useState<boolean>(true);
  const [benefitLoadError, setBenefitLoadError] = useState<string>("");

  const matchedBenefits = useMemo(
    () => filterBenefitsFromItems(profile, allBenefits),
    [profile, allBenefits],
  );
  const selectedBenefit = matchedBenefits.find((item) => item.id === selectedBenefitId) ?? null;
  const age = getAgeFromBirthYear(profile.birthYear);
  const cityOptions = REGION_OPTIONS[profile.province] ?? ["전체"];
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  const onCategoryChange = (category: BenefitCategory, isChecked: boolean) => {
    setProfile((prev) => {
      if (isChecked) {
        return { ...prev, categories: [...prev.categories, category] };
      }
      return { ...prev, categories: prev.categories.filter((item) => item !== category) };
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadBenefits() {
      try {
        setIsLoadingBenefits(true);
        setBenefitLoadError("");

        const response = await fetch("/api/benefits", { signal: controller.signal });
        if (!response.ok) {
          throw new Error("혜택 데이터를 불러오지 못했습니다.");
        }

        const payload = (await response.json()) as { items?: BenefitItem[]; externalError?: string };
        if (payload.items && payload.items.length > 0) {
          setAllBenefits(payload.items);
        }
        if (payload.externalError) {
          setBenefitLoadError(payload.externalError);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "알 수 없는 오류로 데이터를 불러오지 못했습니다.";
        setBenefitLoadError(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingBenefits(false);
        }
      }
    }

    void loadBenefits();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {adsenseClientId && (
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
        />
      )}
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
        <header className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-indigo-600">우리동네 혜택 알리미</p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">
            지역/연령/가구 정보로 맞춤형 복지 혜택 찾기
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            공공 데이터와 수동 큐레이션 데이터를 함께 보여주며, 신청 페이지로 바로 이동할 수 있어요.
          </p>
        </header>

        <AdBanner
          label="광고 영역 1 (상단 배너)"
          slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP}
        />

        <section className="grid gap-6 md:grid-cols-[360px_1fr]">
          <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-bold">내 정보 입력</h2>
            <p className="mt-1 text-sm text-slate-500">입력값이 바뀌면 자동으로 혜택 리스트가 갱신됩니다.</p>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <label className="mb-1 block font-medium">광역지자체</label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={profile.province}
                  onChange={(event) => {
                    const nextProvince = event.target.value;
                    const nextCity = REGION_OPTIONS[nextProvince]?.[0] ?? "전체";
                    setProfile((prev) => ({ ...prev, province: nextProvince, city: nextCity }));
                  }}
                >
                  {provinceOptions.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium">기초지자체</label>
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={profile.city}
                  onChange={(event) => {
                    setProfile((prev) => ({ ...prev, city: event.target.value }));
                  }}
                >
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-medium">출생연도</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  min={1940}
                  max={2010}
                  value={profile.birthYear}
                  onChange={(event) => {
                    setProfile((prev) => ({ ...prev, birthYear: Number(event.target.value) }));
                  }}
                />
                <p className="mt-1 text-xs text-slate-500">현재 계산 나이: 만 {Math.max(age - 1, 0)}세</p>
              </div>

              <div>
                <p className="mb-1 block font-medium">성별</p>
                <div className="grid grid-cols-2 gap-2">
                  {genderOptions.map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setProfile((prev) => ({ ...prev, gender }))}
                      className={`rounded-xl border px-3 py-2 text-left ${
                        profile.gender === gender
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-300"
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 block font-medium">결혼 여부</p>
                <div className="grid grid-cols-3 gap-2">
                  {marriageOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setProfile((prev) => ({ ...prev, marriageStatus: status }))}
                      className={`rounded-xl border px-3 py-2 text-center ${
                        profile.marriageStatus === status
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-300"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 block font-medium">자녀 상태</p>
                <div className="grid grid-cols-3 gap-2">
                  {childOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setProfile((prev) => ({
                          ...prev,
                          childStatus: status,
                          childAgeGroup: status === "있음" ? prev.childAgeGroup : "해당 없음",
                        }))
                      }
                      className={`rounded-xl border px-3 py-2 text-center ${
                        profile.childStatus === status
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-300"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 block font-medium">자녀 나이 구간</p>
                <div className="grid grid-cols-3 gap-2">
                  {childAgeOptions.map((ageBand) => (
                    <button
                      key={ageBand}
                      type="button"
                      disabled={profile.childStatus !== "있음"}
                      onClick={() => setProfile((prev) => ({ ...prev, childAgeGroup: ageBand }))}
                      className={`rounded-xl border px-3 py-2 text-center ${
                        profile.childAgeGroup === ageBand
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-300"
                      } ${profile.childStatus !== "있음" ? "cursor-not-allowed bg-slate-100 text-slate-400" : ""}`}
                    >
                      {ageBand}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  자녀 상태가 &apos;있음&apos;일 때만 자녀 나이 구간 필터가 적용됩니다.
                </p>
              </div>

              <div>
                <p className="mb-2 block font-medium">관심 카테고리</p>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        checked={profile.categories.includes(category)}
                        onChange={(event) => onCategoryChange(category, event.target.checked)}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">검색 결과</p>
              <p className="text-xl font-bold">{matchedBenefits.length}개의 맞춤 혜택</p>
              <p className="mt-1 text-xs text-slate-500">
                {isLoadingBenefits
                  ? "공공 API 데이터를 불러오는 중..."
                  : `전체 데이터 ${allBenefits.length}건 기준`}
              </p>
              {benefitLoadError && (
                <p className="mt-1 text-xs text-amber-600">
                  외부 API 연결 경고: {benefitLoadError} (기본 데이터로 동작 중)
                </p>
              )}
            </div>

            <AdBanner
              label="광고 영역 2 (결과 요약 하단)"
              slot={process.env.NEXT_PUBLIC_AD_SLOT_MIDDLE}
            />

            <div className="grid gap-4">
              {matchedBenefits.map((benefit) => (
                <article
                  key={benefit.id}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                      {benefit.organization}
                    </span>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      {benefit.categories.join(" / ")}
                    </span>
                    <span className="text-xs text-slate-500">
                      {benefit.sourceType === "api" ? "공공 API" : "수동 큐레이션"}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{benefit.summary}</p>
                  <p className="mt-2 text-sm font-medium text-rose-600">
                    신청 기한: {benefit.applicationDeadline}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    대상 지역:{" "}
                    {benefit.regions.map((region) => `${region.province} ${region.city}`).join(", ")}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedBenefitId((prev) => (prev === benefit.id ? null : benefit.id))
                      }
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium"
                    >
                      {selectedBenefitId === benefit.id ? "상세 닫기" : "상세 보기"}
                    </button>
                    <a
                      href={benefit.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                    >
                      신청/공고 바로가기
                    </a>
                  </div>

                  {selectedBenefit?.id === benefit.id && (
                    <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                      <div>
                        <p className="font-semibold">지원 자격</p>
                        <ul className="list-inside list-disc text-slate-700">
                          {benefit.detail.qualification.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold">준비 서류</p>
                        <ul className="list-inside list-disc text-slate-700">
                          {benefit.detail.documents.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold">혜택 내용</p>
                        <p className="text-slate-700">{benefit.detail.support}</p>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {matchedBenefits.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                조건에 맞는 혜택이 아직 없어요. 지역이나 카테고리를 조금 넓혀 보세요.
              </div>
            )}
          </section>
        </section>

        <AdBanner
          label="광고 영역 3 (페이지 하단 배너)"
          slot={process.env.NEXT_PUBLIC_AD_SLOT_BOTTOM}
        />

        <footer className="pb-2 pt-1 text-center text-xs text-slate-500">
          <p>© 우리동네 혜택 알리미</p>
          <p className="mt-1">
            <Link href="/privacy" className="text-indigo-600 underline">
              개인정보처리방침
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
