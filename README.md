### 🔍 다른 예매처
- [멜론 취켓팅 자동화 스크립트](https://github.com/KnifeLemon/melon-cancel-ticketing-auto)

---
# 인터파크 취켓팅 자동화 스크립트

인터파크 티켓의 취켓팅을 자동화 하는 스크립트입니다.

속도 조절이 가능하나 적절하게 조절해두었으니 수정이 필요없습니다.

속도 조절이 필요한 경우 [run_random.js#L149](https://github.com/KnifeLemon/interpark-cancel-ticketing-auto/blob/master/run_random.js#L149) 의 1000 부분을 수정하세요. ( ms 단위 )

실행 중 우측 상단 구역 선택란에서 구역 변경해도 스크립트를 다시 삽입할 필요 없이 이어서 작업됩니다.

## 사용방법
### 랜덤 모드 ( run_random.js )
``` 열린 좌석 모두를 선택하는 모드입니다. ```
1. 취켓팅 원하는 공연 예매 접속
2. 보안문자[캡차] 입력
4. 팝업창에서 키보드의 Ctrl + Shift + C 누름
5. Console -> 스크립트 붙여넣기
   
__[ Console의 상단 선택상자가 top 으로 선택되어있는지 확인 ]__

![Guide Image](https://github.com/KnifeLemon/interpark-cancel-ticketing-auto/blob/master/guide_1.png?raw=true "Guide Image")

7. 정지 원할경우 Console창에 stop() 입력

## 안내 사항
- 실행 후 창을 내려 다른 작업을 하셔도 됩니다.
- 상업적 이용시 문제에 대해 책임은 본인에게 있습니다.
