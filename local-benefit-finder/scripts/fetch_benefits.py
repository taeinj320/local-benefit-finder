#!/usr/bin/env python3
"""
data.go.kr 등 공공 API에서 혜택 데이터를 받아 앱 포맷으로 정규화합니다.

사용 환경변수:
- DATA_GO_KR_API_URL: API 엔드포인트 URL
- DATA_GO_KR_API_KEY: 서비스키(serviceKey)
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import requests


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data" / "manual-benefits.json"


def as_text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def pick_text(item: dict[str, Any], keys: list[str]) -> str:
    for key in keys:
        text = as_text(item.get(key))
        if text:
            return text
    return ""


def split_lines(text: str) -> list[str]:
    if not text:
        return []
    parts = [part.strip() for part in text.replace("•", "\n").replace(";", "\n").splitlines()]
    return [part for part in parts if part][:5]


def infer_categories(text: str) -> list[str]:
    values: list[str] = []
    if any(word in text for word in ["주거", "월세", "전세", "임대"]):
        values.append("주거")
    if any(word in text for word in ["지원금", "수당", "바우처", "대출", "금융"]):
        values.append("금융")
    if any(word in text for word in ["건강", "의료", "접종"]):
        values.append("건강")
    if any(word in text for word in ["교육", "학습", "장학", "보육", "돌봄"]):
        values.append("교육")
    if any(word in text for word in ["문화", "여가", "공연", "체험", "여행"]):
        values.append("문화")
    return values or ["금융"]


def infer_child_age_targets(text: str) -> list[str]:
    values: list[str] = []
    if any(word in text for word in ["영유아", "0세", "1세", "2세", "3세", "4세"]):
        values.append("0~4세")
    if any(word in text for word in ["초등", "5세", "6세", "7세", "8세", "9세", "10세"]):
        values.append("5~10세")
    if any(
        word in text
        for word in [
            "중학생",
            "고등학생",
            "청소년",
            "11세",
            "12세",
            "13세",
            "14세",
            "15세",
            "16세",
            "17세",
            "18세",
        ]
    ):
        values.append("11~18세")
    return values or ["전체"]


def normalize_item(item: dict[str, Any], index: int) -> dict[str, Any]:
    title = pick_text(item, ["servNm", "serviceName", "svcNm", "title", "name"]) or f"공공 혜택 {index + 1}"
    organization = pick_text(item, ["jurMnofNm", "organization", "deptNm", "insttNm"]) or "공공기관"
    summary = (
        pick_text(item, ["servDgst", "summary", "description", "svcInfo"]) or "공공데이터에서 수집된 혜택입니다."
    )
    qualification = pick_text(item, ["sprtTrgtCn", "qualification", "target"])
    documents = pick_text(item, ["aplyMtdCn", "documents", "requiredDocs"])
    support = pick_text(item, ["servDtlLink", "support", "benefitDetail"])
    province = pick_text(item, ["ctpvNm", "sido", "province"]) or "전국"
    city = pick_text(item, ["sggNm", "sigungu", "city"]) or "전체"
    official_url = pick_text(item, ["aplyUrlAddr", "url", "link", "homepage"]) or "https://www.data.go.kr"
    deadline = pick_text(item, ["rceptPrdCn", "deadline", "period"]) or "상시"

    merged = f"{title} {summary} {qualification}"

    return {
        "id": f"public-api-{index}-{title.lower().replace(' ', '-')}",
        "title": title,
        "organization": organization,
        "summary": summary,
        "applicationDeadline": deadline,
        "regions": [{"province": province, "city": city}],
        "categories": infer_categories(merged),
        "ageRange": {"min": 19, "max": 99},
        "eligibleMarriage": ["미혼", "신혼", "기혼"],
        "eligibleChildStatus": ["있음"] if any(word in merged for word in ["자녀", "아동", "청소년", "영유아"]) else ["없음", "있음", "계획 중"],
        "eligibleChildAgeTargets": infer_child_age_targets(merged),
        "eligibleGender": "전체",
        "detail": {
            "qualification": split_lines(qualification) or ["공고문 참고"],
            "documents": split_lines(documents) or ["공고문 참고"],
            "support": support or "지원 상세는 공고문을 확인하세요.",
        },
        "officialUrl": official_url,
        "sourceType": "api",
    }


def extract_items(payload: dict[str, Any]) -> list[dict[str, Any]]:
    direct_items = payload.get("items")
    if isinstance(direct_items, list):
        return [item for item in direct_items if isinstance(item, dict)]

    response = payload.get("response")
    if isinstance(response, dict):
        body = response.get("body")
        if isinstance(body, dict):
            items = body.get("items")
            if isinstance(items, dict):
                nested = items.get("item")
                if isinstance(nested, list):
                    return [item for item in nested if isinstance(item, dict)]
                if isinstance(nested, dict):
                    return [nested]
    return []


def fetch_from_public_api() -> list[dict[str, Any]]:
    api_url = os.getenv("DATA_GO_KR_API_URL", "")
    api_key = os.getenv("DATA_GO_KR_API_KEY", "")
    if not api_url or not api_key:
        print("DATA_GO_KR_API_URL 또는 DATA_GO_KR_API_KEY가 없어 종료합니다.")
        return []

    response = requests.get(
        api_url,
        params={"serviceKey": api_key, "pageNo": 1, "numOfRows": 100, "_type": "json"},
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    raw_items = extract_items(payload)

    return [normalize_item(item, index) for index, item in enumerate(raw_items)]


def main() -> None:
    items = fetch_from_public_api()
    if not items:
        return

    OUTPUT_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"저장 완료: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
