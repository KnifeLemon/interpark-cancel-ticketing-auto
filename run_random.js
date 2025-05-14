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
    // 좌석 객체
    function getRectsAsync() {
        return new Promise((resolve) => {
            var rects = iframeDetail.contentWindow.document.querySelectorAll('table tbody tr td img:not(#MainMap)');
            var rectsArray = Array.prototype.slice.call(rects);
            resolve(rectsArray);
        });
    }

    // 좌석 정렬 ( Y축 맨위, X축 중앙 )
    function sortRectsAsync(rectsArray) {
        return new Promise((resolve) => {
            // X 중심 좌표 계산
            const MainMap = iframeDetail.contentWindow.document.querySelector('#MainMap');
            const MainMapRect = MainMap.getBoundingClientRect();
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

            resolve(rectsArray);
        });
    }

    // 좌석 정렬 실행
    var rectsArray = await getRectsAsync();
    var sortedRects = await sortRectsAsync(rectsArray);
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
    refreshTimer = setInterval(refreshSeat, 800);
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
