# Python 설치 안 되는 원인 진단

## 1. 현재 상황

- `python`, `py`, `python3` 명령을 실행하면 **실제 Python이 아니라** 아래 경로의 실행 파일이 실행됩니다.

  ```
  C:\Users\admin\AppData\Local\Microsoft\WindowsApps\python.exe
  C:\Users\admin\AppData\Local\Microsoft\WindowsApps\py.exe
  C:\Users\admin\AppData\Local\Microsoft\WindowsApps\python3.exe
  ```

- 이 파일들은 **Windows에 기본 포함된 "스텁(리다이렉트)"** 입니다.  
  → **실제 Python 인터프리터가 설치된 것이 아닙니다.**

---

## 2. 왜 설치가 안 되는 것처럼 보이나?

1. **실제 Python이 설치되어 있지 않음**  
   - PATH에 **python.org에서 설치한 Python**이 없음.  
   - 그래서 `python` / `py` 를 치면 위 WindowsApps 쪽 스텁만 실행됨.

2. **스텁이 "Python Manager(pymanager)"를 실행함**  
   - 이 PC에서는 스텁 실행 시 **pymanager**가 동작하며,  
     Python을 자동으로 받아서 설치하려고 시도합니다.

3. **pymanager 설치 단계에서 오류 발생**  
   - 메시지: `Unable to access runtimes index at https://www.python.org/ftp/python/...`  
     → **python.org 서버에 접속하지 못함** (네트워크/방화벽/프록시 등 가능)
   - 또는: `Extracting: [ERROR] ... Internal error 0x00000005`  
     → **다운로드한 파일 압축 해제 실패** (권한/디스크/손상 등 가능)

정리하면, **“Python이 아예 없는 상태”**에서, **스텁 → pymanager → 자동 설치 시도 → 네트워크/설치 오류** 때문에 설치가 안 되는 것처럼 보입니다.

---

## 3. 원인 요약

| 항목 | 내용 |
|------|------|
| **직접 원인** | `python` / `py` 가 **실제 Python이 아닌 Windows 스텁**을 가리킴 |
| **근본 원인** | **python.org 기준의 Python이 한 번도 설치되지 않음** (또는 PATH에 없음) |
| **부가 원인** | 스텁이 pymanager로 Python을 받으려다 **네트워크 접근 실패** 또는 **압축 해제 오류(0x00000005)** 로 실패 |

---

## 4. 해결 방법

### 방법 A: python.org에서 직접 설치 (권장)

1. **https://www.python.org/downloads/** 접속
2. **Python 3.10 이상** (예: 3.12) 설치 프로그램 다운로드
3. 설치 시 **반드시**  
   - **"Add python.exe to PATH"** 체크  
   - 필요하면 "Install for all users" 선택
4. 설치 후 **새 터미널(PowerShell/CMD)을 연 다음**  
   `python --version` / `pip --version` 으로 확인

이렇게 하면 **WindowsApps 스텁보다 PATH 앞쪽에** 실제 Python이 붙어서, `python` 이 제대로 된 인터프리터를 가리키게 됩니다.

### 방법 B: Microsoft Store에서 Python 설치

1. **Microsoft Store** 앱 실행
2. **"Python 3.12"** 등 검색 후 설치
3. 설치가 끝나면 Store 쪽 Python이 쓰이도록 설정될 수 있음  
   (이때는 위 WindowsApps 스텁이 Store 앱과 연결된 경우입니다.)

### 방법 C: App Execution Alias 끄기 (스텁 비활성화)

스텁 때문에 혼란스럽다면:

1. **설정** → **앱** → **고급 앱 설정** → **앱 실행 별칭**
2. **python.exe**, **python3.exe** 항목 **끄기**
3. 그 다음 **방법 A**처럼 python.org에서 Python 설치

이렇게 하면 `python` 입력 시 스텁이 아니라, 나중에 설치한 실제 Python만 실행됩니다.

---

## 5. 설치 후 챗봇 실행

Python이 정상 설치되면:

```bash
cd c:\Users\admin\Desktop\ABC
pip install -r requirements.txt
streamlit run app.py
```

브라우저에서 표시되는 주소(예: http://localhost:8501)로 접속하면 뉴스 검색 챗봇이 실행됩니다.
