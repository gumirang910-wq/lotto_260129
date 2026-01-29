"""
키워드로 뉴스를 검색하는 모듈.
DuckDuckGo 뉴스 검색 사용 (API 키 불필요).
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class NewsItem:
    """뉴스 항목."""
    title: str
    link: str
    snippet: str


def search_news(keyword: str, max_results: int = 10) -> list[NewsItem]:
    """
    키워드로 뉴스를 검색해 최대 max_results개 반환.
    """
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        return [
            NewsItem(
                title="패키지 설치 필요",
                link="",
                snippet="터미널에서 다음을 실행하세요: pip install duckduckgo-search",
            )
        ]

    if not keyword or not keyword.strip():
        return []

    keyword = keyword.strip()
    results: list[NewsItem] = []

    try:
        with DDGS() as ddgs:
            for r in ddgs.news(keyword, max_results=max_results):
                results.append(
                    NewsItem(
                        title=r.get("title", ""),
                        link=r.get("url", r.get("link", "")),
                        snippet=r.get("body", r.get("snippet", ""))[:200],
                    )
                )
                if len(results) >= max_results:
                    break
    except Exception as e:
        results = [
            NewsItem(
                title="검색 오류",
                link="",
                snippet=f"검색 중 오류가 발생했습니다: {e!s}",
            )
        ]

    return results
