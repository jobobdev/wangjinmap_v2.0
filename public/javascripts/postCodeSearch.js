const { response } = require("../../app");

var express = require("express");
var router = express.Router();
const clinicModel = require("../model/clinic");

function postCodeSearch(clinicData, initialLat, initialLng) {
  let searchedAreaPlaceList = [];
  let ps = new kakao.maps.services.Places();
  let search_arr = [];
  var searchedInfowindows = [];
  var geocoder = new daum.maps.services.Geocoder();
  var circle = new naver.maps.Circle({
    map: map,
    center: new naver.maps.LatLng(initialLat, initialLng),
    radius: 2500,
    strokeWeight: 0,
    strokeColor: "#00FF0000",
    strokeOpacity: 0,
    strokeStyle: "solid",
    fillColor: "##00FF0000",
    fillOpacity: 0,
  });

  const searchedArea = circle.getBounds();
  getSearchedAreaPlaces(searchedArea, searchedAreaPlaceList, clinicData);

  displaySearchedAreaPlaces(searchedAreaPlaceList, initialLat, initialLng);
  // 우편번호 찾기 화면을 넣을 element
  var element_layer = document.getElementById("layer");
  $("#search_popup_close").on("click", function () {
    // iframe을 넣은 element를 안보이게 한다.
    element_layer.style.display = "none";
  });
  $("#address_search").on("click", function (e) {
    var currentScroll = Math.max(
      document.body.scrollTop,
      document.documentElement.scrollTop
    );
    new daum.Postcode({
      oncomplete: function (data) {
        var addr = data.address; // 최종 주소 변수
        document.getElementById("search_input").value = addr;
        // 주소로 상세 정보를 검색
        geocoder.addressSearch(data.address, function (results, status) {
          // 정상적으로 검색이 완료됐으면
          if (status === daum.maps.services.Status.OK) {
            var result = results[0]; //첫번째 결과의 값을 활용

            // console.log(data.address);
            // 해당 주소에 대한 좌표를 받아서
            var searchedLocation = new naver.maps.LatLng(result.y, result.x);
            marker = new naver.maps.Marker({
              position: searchedLocation,
              map: map,
              title: result.address_name,
              icon: {
                content: `<div><img id="search_marker" src="/images/search_marker.png" /></div>`,
                anchor: new naver.maps.Point(14, 36),
              },
            });
            if (search_arr.length == 0) {
              search_arr.push(marker);
            } else {
              search_arr.push(marker);
              //pre_marker는 이전에 검색한 위치의 marker, splice(0, 1)은 arr안의 0번째 아이템부터 1개를 빼낸다. 그리고 그걸 pre_marker로 할당한 것.
              let pre_marker = search_arr.splice(0, 1);
              // setMap(null) == 제거하기
              pre_marker[0].setMap(null);
            }
            console.log(marker.title);
            var content = `<div class='searchedInfowindow_wrap'>
            <div class='searchedInfowindow_title'>${marker.title}</div>
            </div>`;
            searchedInfowindows.push(
              new naver.maps.InfoWindow({
                content: content,
                backgroundColor: "#00ff0000",
                borderColor: "#00ff0000",
                anchorSize: new naver.maps.Size(0, 0),
              })
            );
            // console.log(searchedMarkers[0]);
            map.setZoom(15, false);
            map.panTo(searchedLocation);
            element_layer.style.display = "none";

            // 검색된 위치로 반경 설정하여 주변 마커 받아오기
            var circle = new naver.maps.Circle({
              map: map,
              center: new naver.maps.LatLng(result.y, result.x),
              radius: 2500,
              strokeWeight: 0,
              strokeColor: "#00FF0000",
              strokeOpacity: 0,
              strokeStyle: "solid",
              fillColor: "##00FF0000",
              fillOpacity: 0,
            });

            const searchedArea = circle.getBounds();
            getSearchedAreaPlaces(
              searchedArea,
              searchedAreaPlaceList,
              clinicData
            );

            displaySearchedAreaPlaces(
              searchedAreaPlaceList,
              result.y,
              result.x
            );
          }
          // 검색 위치 반경에 든 병원 리스트 html에 찍어주기
        });
        document.body.scrollTop = currentScroll;
      },
      // onresize: function (size) {
      //   element_layer.style.height = size.height + "px";
      // },
      width: "100%",
      height: "100%",
      maxSuggestItems: 5,
    }).embed(element_layer);
    // iframe을 넣은 element를 보이게 한다.
    element_layer.style.display = "block";
    // iframe을 넣은 element의 위치를 화면의 가운데로 이동시킨다.

    initLayerPosition();
  });
  function initLayerPosition() {
    const mediaQuery480 = window.matchMedia("(max-width: 480px)");
    if (mediaQuery480.matches) {
      popupWidth = window.innerWidth || document.documentElement.clientWidth;
      popupHeight = window.innerHeight || document.documentElement.clientHeight;
      element_layer.style.width = popupWidth + "px";
      element_layer.style.height = popupHeight + "px";
      element_layer.style.left =
        (window.innerWidth || document.documentElement.clientWidth) -
        (window.innerWidth || document.documentElement.clientWidth) +
        0 +
        "px";
      element_layer.style.top =
        (window.innerHeight || document.documentElement.clientHeight) -
        (window.innerHeight || document.documentElement.clientHeight) +
        0 +
        "px";
    } else {
      var popupWidth = $("#search_bar_wrap").outerWidth(); //우편번호서비스가 들어갈 element의 width
      var popupHeight =
        window.innerHeight || document.documentElement.clientHeight; //우편번호서비스가 들어갈 element의 height
      element_layer.style.width = popupWidth + "px";
      element_layer.style.height = popupHeight - 36 + "px";
      element_layer.style.border = "none";
      element_layer.style.borderRadius = 4 + "px";
      element_layer.style.left =
        (window.innerWidth || document.documentElement.clientWidth) -
        (window.innerWidth || document.documentElement.clientWidth) +
        10 +
        "px";
      element_layer.style.top =
        (window.innerHeight || document.documentElement.clientHeight) -
        (window.innerHeight || document.documentElement.clientHeight) +
        18 +
        "px";
    }
    // 위에서 선언한 값들을 실제 element에 넣는다.
  }
}

function getSearchedAreaPlaces(
  searchedArea,
  searchedAreaPlaceList,
  clinicData
) {
  searchedAreaPlaceList.splice(0, searchedAreaPlaceList.length);
  for (let i = 0, ii = clinicData.length; i < ii; i++) {
    const lat = clinicData[i].location.coordinates[1];
    const lng = clinicData[i].location.coordinates[0];
    const dataLatLng = new naver.maps.LatLng(lat, lng);
    if (searchedArea.hasLatLng(dataLatLng)) {
      searchedAreaPlaceList.push(clinicData[i]);
    }
  }
}

function displaySearchedAreaPlaces(data, lat, lng) {
  const searchedAreaPlaceList_addr = document.getElementById(
    "searchedAreaPlaceList_addr"
  );

  getAddr(lat, lng);
  function getAddr(lat, lng) {
    let geocoder = new kakao.maps.services.Geocoder();

    let coord = new kakao.maps.LatLng(lat, lng);
    let callback = function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        let searchedLoc1 = result[0].address.region_1depth_name;
        let searchedLoc2 = result[0].address.region_2depth_name;
        let searchedLoc3 = result[0].address.region_3depth_name;
        const searchedArea_addr = `
        <div class="searched-addr-left">검색위치<i class="fa-solid fa-location-arrow"></i></div>
        <div class="searched-addr-right">${searchedLoc1} ${searchedLoc2} ${searchedLoc3}</div>
      `;
        searchedAreaPlaceList_addr.innerHTML = searchedArea_addr;
      }
    };
    geocoder.coord2Address(coord.getLng(), coord.getLat(), callback);
  }
  // data == searchedAreaPlaceList Array
  if (data.length > 0) {
    document.getElementById("menu_wrap").style.display = "flex";
    const searchedAreaPlaceListTitle = document.getElementById(
      "searchedAreaPlaceList_title"
    );
    const showListBtn = document.getElementById("show-list-btn");
    const searchedDataLegnth = `<i class="fa-solid fa-xmark searched_list_close hidden_x" ></i>
                                  <div class="searched-data-length">왕진병원 ${data.length}개(반경 2.5km)</div>
                                  <i class="fa-solid fa-xmark searched_list_close" onclick="closeSearchedAreaList()"></i>
                                `;
    const showListBtnText = `<i class="fa-solid fa-list-ul"></i>병원목록<span class="list-num">${data.length}</span>`;
    searchedAreaPlaceListTitle.innerHTML = searchedDataLegnth;
    showListBtn.innerHTML = showListBtnText;

    let listEl = document.getElementById("searchedAreaPlaceList");
    removeAllChildNodes(listEl); // 검색결과 리스트 초기화
    // removeMarker(); // 검색 후 표기된 마커를 다시 초기화

    for (let i = 0; i < data.length; i++) {
      let lat = data[i].location.coordinates[1];
      let lng = data[i].location.coordinates[0];
      let address_road = data[i].address_road;
      let address = data[i].address;
      let place_title = data[i].title;
      let contact = data[i].contact;
      let department = data[i].department;

      const el = document.createElement("div"); // div 태그 만들어주기
      const itemStr = `
        <div class="searched-item-info">
          <div class = "searchedAreaPlace_info"">
          <div class = "searchedAreaPlace_info_title">
              ${place_title}
          </div>
          <div class="searchedAreaPlace_info_department">${department}</div>
          <div class="searchedAreaPlace_info_address_road">${address_road}</div>
          <div class="searchedAreaPlace_info_address">${address}</div>
          <div class="searchedAreaPlace_info_contact contact" onclick="phoneCall()">${contact}</div>
        </div>
      </div>
        <div class="searched-item-btn" onclick="highlightMarker(${lat}, ${lng})">
          <div class="searched-item-btn-circle">
            <i class="fa-solid fa-map"></i>
          </div>
        <div>
      `;

      el.innerHTML = itemStr;
      el.className = "searchedAreaPlaceItem";

      listEl.appendChild(el);
      document.getElementById("menu_wrap").style.display = "none";
      // el.onclick = function () {
      //   console.log(place_title);
      // };
    }
  } else {
    document.getElementById("modal").style.display = "flex";
    document.getElementById("menu_wrap").style.display = "none";
  }
}
function removeAllChildNodes(el) {
  while (el.hasChildNodes()) {
    // el에 childnode가 있는지 계속 루프 돌면서 확인하고 있으면 true 반환
    el.removeChild(el.lastChild);
  }
}
