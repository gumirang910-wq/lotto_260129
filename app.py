"""
키워드로 관련 뉴스 10개를 검색하는 챗봇.
"""
import streamlit as st
from news_search import search_news, NewsItem

st.set_page_config(
    page_title="뉴스 검색 챗봇",
    page_icon="📰",
    layout="centered",
)

st.title("📰 뉴스 검색 챗봇")
st.caption("키워드를 입력하면 관련 뉴스 10개를 검색해 드립니다.")

# 채팅 기록 유지
if "messages" not in st.session_state:
    st.session_state.messages = []

# 이전 대화 표시
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        for i, n in enumerate(msg.get("news") or [], 1):
            st.markdown(f"**{i}. [{n.title}]({n.link})**")
            if n.snippet:
                st.caption(n.snippet)

# 사용자 입력
if prompt := st.chat_input("검색할 키워드를 입력하세요..."):
    st.session_state.messages.append({"role": "user", "content": prompt})

    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner("뉴스 검색 중..."):
            news_list: list[NewsItem] = search_news(prompt, max_results=10)

        if not news_list:
            st.markdown("검색 결과가 없습니다. 다른 키워드로 시도해 보세요.")
            st.session_state.messages.append({
                "role": "assistant",
                "content": "검색 결과가 없습니다.",
                "news": [],
            })
        else:
            st.markdown(f"**'{prompt}'** 관련 뉴스 **{len(news_list)}건**을 찾았습니다.\n")
            for i, n in enumerate(news_list, 1):
                st.markdown(f"**{i}. [{n.title}]({n.link})**")
                if n.snippet:
                    st.caption(n.snippet)
            st.session_state.messages.append({
                "role": "assistant",
                "content": f"'{prompt}' 관련 뉴스 {len(news_list)}건",
                "news": news_list,
            })
