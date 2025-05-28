/*
	--== HOW TO USE ==--

	1. 인터파크 티켓 접속
	2. 로그인
	3. 크롬 개발자도구 열기 ( 단축키 F12 )
	4. Console에 스크립트 붙여넣기
	5. 엔터
	
*/


/* ====================== CONFIG ====================== */
/*
	== 티켓 고유번호 ==
	공연 링크의 goods/ 옆의 코드가 고유번호입니다.
	https://tickets.interpark.com/goods/{티켓고유번호}
*/
var ticketNo = "1234567";


/*
	== 공연 날짜 ==
	YYYYMMDD 형식으로 작성하여야 합니다.
	2025-01-01 = 20250101
*/
var playDate = "20250101";


/*
	== 회차 ==
	공연 날짜 앞 회차들을 모두 카운팅해야 합니다.
	- 예시
		20250101 : 총 1회
		20250102 : 총 2회
		20250103 : 총 1회
		
		20250104의 2회차 = 5회차
*/
var playSeq = 5;


/*
	== 여러 창 띄우기 ==
	시스템상 팝업이 여러개 표시되지 않지만, 이 방법을 이용시 여러개 표시가 가능합니다.
	
	값은 1 이상으로 작성해주세요.
	올바르지 않을 경우 작업하지 않습니다.
*/
var openWindowCount = 1;


/*
	== 순위 체크 시간 ==
	현재 순위를 체크하는 시간을 설정합니다.
	
	Milliseconds 단위입니다.
	( 1ms = 0.001s , 1000ms = 1s )
*/
var rankCheckDelay = 2000;
/* ====================== CONFIG ====================== */

/* ====================== SYSTEM ====================== */
var rankTimer = null;
var waitingId = ''; // 대기 아이디 작성하면 이어서 대기합니다.
var sessionId = ''; // 세션 아이디 작성하면 여러 창을 열어줍니다. ( 오류로 창이 갑작스럽게 닫혔을 경우에도 이용 가능 )
/* ====================== SYSTEM ====================== */


async function getWaitingUrl() {
	const response = await fetch("https://api-ticketfront.interpark.com/v1/goods/" + ticketNo + "/waiting?channelCode=pc&preSales=N&playDate=" + playDate + "&playSeq=" + playSeq, {
	  method: "GET",
	  credentials: "include"
	});
	
	if (!response.ok) {
      throw new Error("네트워크 응답 오류");
    }

    const json = await response.json();
    return decodeURI(json.data);
}

async function sendLineUpRequest(key) {
	const response = await fetch("https://ent-waiting-api.interpark.com/waiting/api/line-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
      },
      body: JSON.stringify({ key: key })
    });

    if (!response.ok) throw new Error("POST 요청 실패");

    const data = await response.json();
    return data;
}


async function getWaitingRank(waitingId) {
	const response = await fetch("https://ent-waiting-api.interpark.com/waiting/api/rank?waitingId=" + encodeURIComponent(waitingId), {
      method: "GET",
	  credentials: "include"
    });

    if (!response.ok) throw new Error("네트워크 응답 오류");

    const data = await response.json();
    return data;
}

function openBook() {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://poticket.interpark.com/Book/BookMain.asp';
  form.target = '_blank';

  const params = {
    GroupCode: ticketNo,
    Tiki: 'Y',
    BizCode: 'WEBBR',
    BizMemberCode: '',
    PlayDate: playDate,
    PlaySeq: playSeq,
    SessionId: sessionId,
    SIDBizCode: 'WEBBR',
    FCSNo: '',
    HPBizCode: 'WEBBR'
  };

  for (const key in params) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = params[key];
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

function waitingRank(waitingId) {
	rankTimer = setInterval(async () => {
		var rankResult = await getWaitingRank(waitingId);
		
		var goodsName = rankResult.goodsName;
		var totalRank = rankResult.totalRank;
		var currentRank = rankResult.myRank;
		var bookingRate = rankResult.bookingRate;
		
		console.clear();
		console.log("%c" + goodsName, "color: #7289DA; -webkit-text-stroke: 2px black; font-size: 32px; font-weight: bold;");
		console.log('총 대기자\t: ' + totalRank.toLocaleString());
		console.log('내 순위\t\t: ' + currentRank.toLocaleString());
		console.log('공연 예매율\t: ' + bookingRate + "%");
		console.group('기타 정보');
		console.log('현재 시간\t\t: ' + new Date());
		console.log('대기 고유번호\t: ' + waitingId);
		if (rankResult.sessionId) {
		console.log('세션 고유번호\t: ' + rankResult.sessionId);
		}
		console.groupEnd();
		
		if (rankResult.sessionId) {
			sessionId = rankResult.sessionId;
			
			for (var i = 0; i < openWindowCount; i++) {
				openBook();
			}
			
			clearInterval(rankTimer);
		}
		
	}, rankCheckDelay);
}

async function run() {
	if (waitingId.length == 0) {
		var waitingURL = await getWaitingUrl();
		var parseWatingURL = new URL(waitingURL);
		var waitingKey = parseWatingURL.searchParams.get("key");
		
		var lineUp = await sendLineUpRequest(waitingKey);
		
		waitingId = lineUp.waitingId;
	}
	
	waitingRank(waitingId);
}

if (typeof openWindowCount == 'number' && openWindowCount > 0) {
	if (sessionId.length > 0) {
		for (var i = 0; i < openWindowCount; i++) {
			openBook();
		}
	}
	else {
		run();
	}
}
