const mapContainer = document.getElementById("map");
const mapOptions = {
  center: new kakao.maps.LatLng(37.554477, 126.970419),
  level: 5,
};

let map = new kakao.maps.Map(mapContainer, mapOptions);

// kakao keyword search 활용
let infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

let markerList = [];
let ps = new kakao.maps.services.Places();

searchPlaces();

function searchPlaces() {
  let keyword = $("#keyword").val();
  ps.keywordSearch(keyword, placeSearchCB);
}

function placeSearchCB(data, status) {
  if (status === kakao.maps.services.Status.OK) {
    displayPlaces(data);
  } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
    alert("검색 결과가 존재하지 않습니다.");
  } else if (status === kakao.maps.services.Status.ERROR) {
    alert("검색 결과중 오류가 발생했습니다.");
    return;
  }
}

function displayPlaces(data) {
  let listEl = document.getElementById("placesList");
  let bounds = new kakao.maps.LatLngBounds();

  removeAllChildNodes(listEl); // 검색결과 리스트 초기화
  removeMarker(); // 검색후 표기된 마커를 다시 초기화

  for (let i = 0; i < data.length; i++) {
    let lat = data[i].y;
    let lng = data[i].x;
    let address_name = data[i]["address_name"];
    let road_address_name = data[i]["road_address_name"];
    let place_name = data[i]["place_name"];
    let phone = data[i]["phone"];

    const placePosition = new kakao.maps.LatLng(lat, lng);
    bounds.extend(placePosition); // bounds 안에 placePosition을 넣기

    let marker = new kakao.maps.Marker({
      position: placePosition,
    });

    marker.setMap(map);
    markerList.push(marker);

    const el = document.createElement("div"); // div 태그 만들어주기
    const itemStr = `
    <div class = "info">
        <div class = "info_title">
            ${place_name}
        </div>
        <div class="info_address">${address_name}</div>
        <div class="info_phone">${phone}</div>
    </div>`;

    el.innerHTML = itemStr;
    el.className = "item";

    kakao.maps.event.addListener(marker, "click", function () {
      displayInfowindow(marker, place_name, address_name, lat, lng, phone);
    });

    kakao.maps.event.addListener(map, "click", function () {
      infowindow.close();
    });

    el.onclick = function () {
      displayInfowindow(marker, place_name, address_name, lat, lng, phone);
    };

    listEl.appendChild(el);
  }

  map.setBounds(bounds); // setBounds를 통해 우리가 찾아준 bounds 영역으로 이동
}

function displayInfowindow(marker, place_name, address_name, lat, lng, phone) {
  let content = `
    <div style="padding:25px">
        ${place_name}<br>
        ${address_name}<br>
        ${phone}<br>
        <button onclick="onSubmit('${place_name}', '${address_name}', ${lat}, ${lng})">등록</button>
    </div>`; // title과 address는 string이므로 ''로 씌우고, lat & lng는 숫자이므로 ''가 없다.

  map.panTo(marker.getPosition());
  infowindow.setContent(content);
  infowindow.open(map, marker);
}

function removeAllChildNodes(el) {
  while (el.hasChildNodes()) {
    // el에 childnode가 있는지 계속 루프 돌면서 확인하고 있으면 true 반환
    el.removeChild(el.lastChild);
  }
}

function removeMarker() {
  for (let i = 0; i < markerList.length; i++) {
    markerList[i].setMap(null);
  }
  markerList = [];
}

function onSubmit(title, address, lat, lng) {
  $.ajax({
    url: "/location",
    data: { title, address, lat, lng },
    type: "POST",
  })
    .done((response) => {
      console.log("데이터 요청 성공");
      alert("성공");
    })
    .fail((error) => {
      console.log("데이터 요청 실패");
      alert("실패");
    });
}
