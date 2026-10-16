# 차곡 — 한국어 할 일 웹앱

HTML, CSS, JavaScript만 사용하는 모바일용 웹앱입니다. 라이브러리, 회원가입, 빌드가 필요 없습니다.

## 파일

- `index.html`: 화면 구성
- `styles.css`: 모바일 반응형 디자인
- `app.js`: 추가·완료·삭제, 필터, 삭제 취소, 브라우저 저장
- `.nojekyll`: GitHub Pages에서 정적 파일을 그대로 제공하도록 설정

## 컴퓨터에서 먼저 실행

압축을 풀고 `index.html`을 Chrome, Edge 또는 Safari로 열어보세요. 같은 폴더에 CSS와 JavaScript 파일이 있어야 합니다. 안정적인 데이터 저장과 스마트폰 사용에는 아래의 GitHub Pages 주소를 사용하세요.

## GitHub에 올리기 — 코딩이나 Git 설치 없이

1. https://github.com 에 가입하고 로그인합니다.
2. 오른쪽 위 **+ → New repository**를 누릅니다.
3. Repository name에 `todo-app`을 입력하고 **Public**을 선택합니다. **Add a README file**을 선택해 저장소를 만든 뒤 **Create repository**를 누릅니다.
4. 저장소 화면의 **Add file → Upload files**를 누릅니다.
5. 압축을 푼 `todo-app` 폴더 **안의 파일들**을 올립니다. 폴더 자체를 올려서 `todo-app/index.html`처럼 중첩시키지 마세요. 저장소 첫 화면에 `index.html`, `styles.css`, `app.js`, `README.md`가 보이면 됩니다. 숨김 파일 `.nojekyll`은 파일 탐색기에서 보이지 않으면 생략해도 됩니다.
6. 아래 **Commit changes**를 눌러 저장합니다.
7. 저장소의 **Settings → Pages**로 갑니다.
8. **Build and deployment → Source**에서 **Deploy from a branch**를 선택합니다.
9. **Branch**는 `main`, 폴더는 **/(root)**로 선택하고 **Save**를 누릅니다.
10. 몇 분 후 Pages 화면에 표시되는 사이트 주소를 엽니다. 보통 `https://본인아이디.github.io/todo-app/`입니다. Actions 탭에서 배포 진행 상황도 확인할 수 있습니다.

404가 나오면 잠시 기다린 뒤 다시 접속하세요. 계속 나오면 Pages 설정이 `main`과 `/(root)`인지, 저장소 최상위에 소문자 `index.html`이 있는지 확인하세요.

## 스마트폰에서 사용

1. GitHub Pages의 **사이트 주소**를 스마트폰 Chrome(Android) 또는 Safari(iPhone)에서 엽니다. github.com의 코드 화면 주소와 다릅니다.
2. 입력창에 할 일을 적고 **추가**를 누릅니다.
3. 체크 상자를 누르면 완료되며, 다시 누르면 진행 중으로 돌아갑니다.
4. 오른쪽 × 버튼을 누르면 삭제됩니다. 하단 **삭제 취소**는 7초 동안 제공됩니다.
5. **전체 / 진행 중 / 완료**로 목록을 골라 봅니다.
6. 새로고침해도 목록과 완료 상태가 유지됩니다.

홈 화면에 바로가기를 만들 수도 있습니다.
- Android Chrome: **⋮ → 홈 화면에 추가 → 바로가기 만들기** (기기마다 문구가 다를 수 있습니다.)
- iPhone Safari: **공유 → 홈 화면에 추가 → 추가**

홈 화면 바로가기는 웹사이트를 여는 기능입니다. 인터넷 없이 실행되는 별도 설치 앱은 아닙니다.

## 저장 방식

목록은 해당 사이트 주소의 브라우저 `localStorage`에만 저장됩니다. 다른 기기나 다른 브라우저와 동기화되지 않습니다. 같은 스마트폰에서도 비공개 모드나 앱 내 브라우저 대신 평소 사용하는 브라우저로 여세요. 브라우저 사이트 데이터를 삭제하면 목록도 삭제됩니다. 서버나 GitHub 저장소에 개인 할 일 목록이 올라가지는 않습니다.

## 나중에 코드 수정하기

저장소에서 수정할 파일을 누르고 연필 아이콘으로 편집한 뒤 **Commit changes**를 누르세요. 또는 **Add file → Upload files**에서 수정된 파일을 같은 이름으로 다시 올리세요. GitHub Pages가 자동으로 다시 배포합니다. 몇 분 후 사이트를 새로고침하면 반영됩니다.

## 테스트

기능 자동 테스트 결과와 확인 범위는 `TEST-RESULTS.md`를 참고하세요.
