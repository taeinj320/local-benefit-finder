export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10 text-slate-900 md:px-8">
      <h1 className="text-2xl font-bold md:text-3xl">개인정보처리방침</h1>
      <p className="mt-4 text-sm text-slate-600">
        우리동네 혜택 알리미는 서비스 제공 및 광고 운영을 위해 필요한 범위 내에서 정보와 쿠키를 처리할 수
        있습니다.
      </p>

      <section className="mt-8 space-y-3 text-sm leading-6 text-slate-700">
        <h2 className="text-lg font-semibold text-slate-900">1. 수집하는 정보</h2>
        <p>
          본 서비스는 사용자가 입력한 지역, 연령대, 가구 정보 등을 맞춤 혜택 필터링 목적으로 사용합니다.
          입력 정보는 브라우저 세션에서 처리되며, 별도 회원 DB에 저장하지 않습니다.
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">2. 광고 및 쿠키</h2>
        <p>
          본 서비스는 Google AdSense 등 제3자 광고 서비스를 사용할 수 있으며, 광고 제공사는 쿠키를 이용해
          관심 기반 광고를 제공할 수 있습니다.
        </p>
        <p>
          Google 광고 설정은{" "}
          <a
            href="https://myadcenter.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline"
          >
            Google 광고 설정
          </a>
          에서 관리할 수 있습니다.
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">3. 외부 링크</h2>
        <p>
          혜택 신청을 위해 연결되는 외부 사이트는 각 기관의 정책을 따르며, 본 서비스는 외부 사이트의 처리
          방식에 대해 책임지지 않습니다.
        </p>

        <h2 className="pt-4 text-lg font-semibold text-slate-900">4. 문의</h2>
        <p>정책 관련 문의가 있으면 서비스 운영자에게 연락해 주세요.</p>
      </section>
    </main>
  );
}
