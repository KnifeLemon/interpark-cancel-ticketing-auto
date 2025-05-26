var iframeSeat = document.getElementById('ifrmSeat');
var iframeDetail = iframeSeat.contentWindow.document.getElementById('ifrmSeatDetail');
var refreshTimer;

// alert 제어
function attachAlertController() {
    window.alert = alertController;
    iframeSeat.contentWindow.window.alert = alertController;
    iframeDetail.contentWindow.window.alert = alertController;

    function alertController(text) {
        console.log('Alert Say : ' + text);
        return true;
    }
}

async function sortSeatList() {
    const isImgSeats = iframeDetail.contentWindow.document.querySelectorAll('#MainMap').length > 0;
    const seatSelector = isImgSeats ? 'table tbody tr td img:not(#MainMap)' : '#divSeatBox > [class*="Seat"]:not([align])';

    // span 좌석일 경우 중간값 계산
    // 다음 열은 <br> 태그로 구분되어 있음
    function getSpanSenterIndex() {
        return new Promise((resolve) => {
            const seatSpans = iframeDetail.contentWindow.document.querySelectorAll(seatSelector);
            let centerIndex = 0;
            let firstLineSeats = [];
            for (const span of seatSpans) {
                const nextSibling = span.nextElementSibling;
                firstLineSeats.push(span);
                // 다음 줄이 <br> 태그인 경우
                if (nextSibling && nextSibling.tagName.toLowerCase() === 'br') {
                    centerIndex = Math.floor(firstLineSeats.length / 2);
                    resolve(centerIndex);
                }
            };
        });
    }

    // 좌석 객체
    function getRectsAsync() {
        return new Promise((resolve) => {
            var rects = iframeDetail.contentWindow.document.querySelectorAll(seatSelector);
            var rectsArray = Array.prototype.slice.call(rects);
            if (isImgSeats) {
                // 이미지 좌석인 경우 rectsArray 그대로 반환
                resolve(rectsArray);
            }
            else {
                // span 좌석일 경우 라인별로 분리
                var seatLines = [];
                var currentLine = [];
                rectsArray.forEach((rect) => {
                    const nextSibling = rect.nextElementSibling;
                    if (nextSibling && nextSibling.tagName.toLowerCase() === 'br') {
                        // 줄바꿈 태그인 경우 현재 줄을 저장하고 새 줄 시작
                        if (currentLine.length > 0) {
                            seatLines.push(currentLine);
                            currentLine = [];
                        }
                    } else if (rect.getAttribute('id') && rect.getAttribute('id').startsWith('Seat')) {
                        // 좌석인 경우 현재 줄에 추가
                        currentLine.push(rect);
                    }
                    else {
                        // 아무것도 아닌 경우 정크데이터 추가
                        currentLine.push('');
                    }
                });
                // 마지막 줄이 비어있지 않으면 추가
                if (currentLine.length > 0) {
                    seatLines.push(currentLine);
                }

                resolve(seatLines);
            }
            
        });
    }

    // 좌석 정렬
    function sortRectsAsync(rectsArray, centerIndex = 0) {
        return new Promise((resolve) => {
            // 최상위 항목
            const parentBox = iframeDetail.contentWindow.document.querySelector(isImgSeats ? '#MainMap' : '#divSeatBox');
            
            // 이미지 좌석 정렬 ( Y축 맨위, X축 중앙 )
            if (isImgSeats) {
                // X 중심 좌표 계산
                const MainMapRect = parentBox.getBoundingClientRect();
                const MainMapXCenter = MainMapRect.left + (MainMapRect.width / 2);

                rectsArray.sort(function (a, b) {
                    const aStyle = a.getAttribute('style');
                    const bStyle = b.getAttribute('style');
                    
                    const [aX, aY] = aStyle.match(/left\s*:\s*(\d+)\s*;\s*top\s*:\s*(\d+)/).slice(1).map(Number);
                    const [bX, bY] = bStyle.match(/left\s*:\s*(\d+)\s*;\s*top\s*:\s*(\d+)/).slice(1).map(Number);

                    if (aY === bY) {
                        const aDist = Math.abs(aX - MainMapXCenter);
                        const bDist = Math.abs(bX - MainMapXCenter);
                        return aDist - bDist; // 중심에 가까운 순
                    }

                    return aY - bY; // 위쪽(Y 작을수록 먼저)
                });
            }
            // span 좌석 정렬 ( 객체의 Index가 centerIndex 에 가까운 기준 )
            // [Array(n), Array(n), Array(n), Array(n)] 형태로 전달됨 array 마다 새 줄임
            else {
                rectsArray.forEach((line) => {
                    line.sort((a, b) => {
                        // 현재 Array(n) 의 index 이 centerIndex 에 가까운 순으로 정렬
                        const aIndex = Array.from(line).indexOf(a);
                        const bIndex = Array.from(line).indexOf(b);
                        return Math.abs(aIndex - centerIndex) - Math.abs(bIndex - centerIndex);
                    });
                });

                // type이 object인 항목들만 남김
                rectsArray = rectsArray.map(line => line.filter(item => item && typeof item === 'object'));

                // 모든 줄을 하나의 배열로 평탄화
                rectsArray = rectsArray.flat();
            }

            resolve(rectsArray);
        });
    }

    // 좌석 정렬 실행
    var centerIndex = (isImgSeats) ? 0 : await getSpanSenterIndex();
    var rectsArray = await getRectsAsync();
    var sortedRects = await sortRectsAsync(rectsArray, centerIndex);
    return sortedRects;
}

function simulateClick(ele) {
    let event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window
    });

    ele.dispatchEvent(event);
}
function startRefresh() {
    refreshTimer = setInterval(refreshSeat, 1000);
}

function refreshSeat() {
    // 2초 대기 있기 때문에 사용안함
    //iframeSeat.contentWindow.fnRefresh();

    iframeDetail.contentWindow.location.reload();
    iframeSeat.contentWindow.fnInitSeat();
}

function findRect(rects) {
    if (rects.length > 0) {
        attachAlertController();
        simulateClick(rects[0]);
        stop();
    }

    if (iframeSeat.contentWindow.SeatBuffer.index > 0) iframeSeat.contentWindow.fnSelect();
}

function start() {
    startRefresh();
}

function stop() {
    clearInterval(refreshTimer);
}

// 프레임 로드
window.onload = function () {
    iframeSeat = document.getElementById('ifrmSeat');
    iframeDetail = iframeSeat.contentWindow.document.getElementById('ifrmSeatDetail');
    attachAlertController();
}
iframeSeat.on('load', function () {
    iframeDetail = iframeSeat.contentWindow.document.getElementById('ifrmSeatDetail');
    attachAlertController();
});
iframeDetail.on('load', function () {
    // 새로고침 되면 좌석 찾기
    sortSeatList().then((rects) => {
        findRect(rects);
    });
    attachAlertController();
});

start();
