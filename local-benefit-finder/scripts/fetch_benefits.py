#!/usr/bin/env python3
"""
공공데이터 API 또는 크롤링 결과를 manual-benefits.json 형태로 저장하는 예시 스크립트.
실사용 시 DATA_API_KEY 환경변수와 대상 API URL을 실제 값으로 교체하세요.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import requests


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data" / "manual-benefits.json"


def fetch_from_public_api() -> list[dict[str, Any]]:
    api_key = os.getenv("DATA_API_KEY", "")
    if not api_key:
        print("DATA_API_KEY가 없어 샘플 데이터로 종료합니다.")
        return []

    # TODO: 실제 공공데이터 API URL과 파라미터로 교체
    endpoint = "https://api.example.com/benefits"
    response = requests.get(endpoint, headers={"Authorization": f"Bearer {api_key}"}, timeout=20)
    response.raise_for_status()
    payload = response.json()

    # TODO: payload를 프론트 구조(BenefitItem)로 매핑
    return payload.get("items", [])


def main() -> None:
    items = fetch_from_public_api()
    if not items:
        return

    OUTPUT_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"저장 완료: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
