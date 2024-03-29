// loading on
$.LoadingOverlay("show", {
  background: "rgba(0, 0, 0, 0.5)",
  image: "",
  maxSize: 60,
  fontawesome: "fa fa-spinner fa-pulse fa-fw",
  fontawesomeColor: "#FFFFFF",
});

// 마커와 인포윈도우를 담을 빈 배열 만들기
let markerList = [];
let infowindowList = [];

// 사용자 위치를 받아오고 나면 document load하기
$(async function () {
  let result;
  let initialLat;
  let initialLng;
  try {
    result = await geoLocation();
    initialLat = result.coords.latitude;
    initialLng = result.coords.longitude;
    currentMarker = true;
  } catch (err) {
    alert(err);
    initialLat = 37.5665;
    initialLng = 126.9779;
    currentMarker = false;
  }
  // 로딩 숨기기
  $.LoadingOverlay("hide");

  // data load from mongodb ▼
  $.ajax({
    url: "/clinic",
    type: "GET",
  }).done((response) => {
    if (response.message !== "success") return;

    const clinicData = response.data;
    // const clinicData = response.data.filter((el) => el.sort == "의원");

    // 사용자 위치를 중심으로 맵을 로드하고 마커 찍기
    mapOptions = {
      center: new naver.maps.LatLng(initialLat, initialLng),
      zoom: 15,
      minZoon: 7,
      zoomControl: false,
      mapTypeControl: false,
      logoControl: false,
      mapDataControl: false,
      pinchZoon: true,
      tileTransition: true,
      zoomControlOptions: {
        position: naver.maps.Position.RIGHT_CENTER,
        style: naver.maps.ZoomControlStyle.SMALL,
      },
      mapTypeControlOptions: {
        position: naver.maps.Position.LEFT_BOTTOM,
      },
    };
    map = new naver.maps.Map("map", mapOptions);
    // zoomControl 생성
    const zoomControlWrap = document.getElementById("zoomControlWrap");
    const zoomInButton = document.createElement("div");
    zoomInButton.setAttribute("id", "zoomInIconDiv");
    const zoomOutButton = document.createElement("div");
    zoomOutButton.setAttribute("id", "zoomOutIconDiv");
    const zoomInIcon = `<i class="fa-solid fa-plus"></i>`;
    const zoomOutIcon = `<i class="fa-solid fa-minus"></i>`;

    zoomInButton.addEventListener("click", (e) => {
      map.setZoom(map.getZoom() + 1, true);
    });
    zoomOutButton.addEventListener("click", (e) => {
      map.setZoom(map.getZoom() - 1, true);
    });

    zoomInButton.innerHTML = zoomInIcon;
    zoomOutButton.innerHTML = zoomOutIcon;
    zoomControlWrap.appendChild(zoomInButton);
    zoomControlWrap.appendChild(zoomOutButton);

    // 현위치 표기를 위한 함수 ▼
    let client_position = [];
    // variable used to prevent overlapping marker for current position
    let currentUse = true;
    const userInitialLocation = new naver.maps.LatLng(initialLat, initialLng);
    // put a marker of the user's current location only when the location is taken successfully
    if (currentUse && currentMarker) {
      marker = new naver.maps.Marker({
        map: map,
        position: userInitialLocation,
        title: "내 위치",
        icon: {
          content:
            '<div class="current_marker_out"><div class="current_marker_in"></div></div>',
          anchor: new naver.maps.Point(15, 15),
        },
      });
      // preventing overlapping markers
      if (client_position.length == 0) {
        client_position.push(marker);
      } else {
        let pre_marker = client_position.splice(0, 1);
        pre_marker[0].setMap(null);
      }
      currentUse = false;
    }
    map.setZoom(15, false);
    map.panTo(userInitialLocation);
    console.log(currentUse);

    // 현위치 crosshair 아이콘 클릭시 이동
    $("#current").on("click", function () {
      postCodeSearch(clinicData, initialLat, initialLng);
      try {
        const currentLat = initialLat;
        const currentLng = initialLng;
        let currentLatLng = new naver.maps.LatLng(currentLat, currentLng);
        if (currentUse) {
          marker = new naver.maps.Marker({
            map: map,
            position: currentLatLng,
            title: "내 위치",
            icon: {
              content:
                '<div class="current_marker_out"><div class="current_marker_in"></div></div>',
              anchor: new naver.maps.Point(15, 15),
            },
          });
          if (client_position.length == 0) {
            client_position.push(marker);
          } else {
            let pre_marker = client_position.splice(0, 1);
            pre_marker[0].setMap(null);
          }
          currentUse = false;
        }
        map.setZoom(15, false);
        map.panTo(currentLatLng);
      } catch (err) {
        alert(err);
      }
    });

    postCodeSearch(clinicData, initialLat, initialLng);

    // 마커 클릭시 인포윈도우 띄우는 핸들러
    const getClickHandler = (i) => () => {
      const marker = markerList[i];
      const infowindow = infowindowList[i];
      if (infowindow.getMap()) {
        infowindow.close();
      } else {
        infowindow.open(map, marker); // infowindow를 map위에, marker 위치에 표시한다
      }
    }; // for문을 돌면서 바로 핸들러 함수가 실행되는 것을 방지하고자 핸들러 안에 함수를 하나 다시 작성함
    /* 위의 이중으로 작성된 화살표함수를 원래방식으로 적으면 아래와 같음. 화살표함수는 항상 먼저 작성되어야 사용가능함. 기존방식은 코드 젤 아래에 작성해도 됨.
  function getClickHandler(i) {
      return function(){

      }
  }
  */

    // 지도 아무곳에 클릭시 인포윈도우 닫는 핸들러
    const getClickMap = (i) => () => {
      const infowindow = infowindowList[i];
      infowindow.close();
    };

    for (let i in clinicData) {
      const target = clinicData[i];
      const latlng = new naver.maps.LatLng(
        target.location.coordinates[1],
        target.location.coordinates[0]
      );
      if (target.sort == "의원") {
        let markerM = new naver.maps.Marker({
          map: map,
          position: latlng,
          icon: {
            content: `<div class="marker"><img id="marker_m_img" src="/images/m_marker.png" /></div>`,
            anchor: new naver.maps.Point(11, 11), // marker의 너비와 높이의 절반으로 설정하기
          },
        });
        markerList.push(markerM);
      } else {
        let markerKM = new naver.maps.Marker({
          map: map,
          position: latlng,
          icon: {
            content: `<div class="marker"><img id="marker_m_img" src="/images/km_marker.png" /></div>`,
            anchor: new naver.maps.Point(11, 11), // marker의 너비와 높이의 절반으로 설정하기
          },
        });
        markerList.push(markerKM);
      }

      // clinic marker infowindow content setup
      const content = `<div class="infowindow_wrap">
      <div class="infowindow_title">${target.title}</div>
      <div class="infowindow_department">${target.department}</div>
      <div class="infowindow_address_road">${target.address_road}</div>
      <div class="infowindow_contact contact"><a class="phone-num" onclick="phoneCall()">${target.contact}<div class="contact_copy"><i class="fa-solid fa-phone"></i></div></a></div>
      </div>`;

      const infowindow = new naver.maps.InfoWindow({
        content: content,
        backgroundColor: "#00ff0000",
        borderColor: "#00ff0000",
        anchorSize: new naver.maps.Size(20, 10),
      });

      infowindowList.push(infowindow);
    }

    for (let i = 0, ii = markerList.length; i < ii; i++) {
      naver.maps.Event.addListener(markerList[i], "click", getClickHandler(i));
      naver.maps.Event.addListener(map, "click", getClickMap(i));
      naver.maps.Event.addListener(map, "zoom_changed", function (zoom) {
        console.log(zoom);
        if (zoom <= 14) {
          const infowindow = infowindowList[i];
          infowindow.close();
        }
      });
    }

    // 마커 클러스터링 설정
    const clusterMarker1 = {
        content: '<div id="cluster_marker_1"></div>',
      },
      clusterMarker2 = {
        content: '<div id="cluster_marker_2"></div>',
      },
      clusterMarker3 = {
        content: '<div id="cluster_marker_3"></div>',
      },
      clusterMarker4 = {
        content: '<div id="cluster_marker_4"></div>',
      },
      clusterMarker5 = {
        content: '<div id="cluster_marker_5"></div>',
      },
      clusterMarker6 = {
        content: '<div id="cluster_marker_6"></div>',
      };

    const markerClustring = new MarkerClustering({
      minClusterSize: 1,
      maxZoom: 15,
      map: map,
      markers: markerList,
      disableClickZoom: false,
      gridSize: 200,
      icons: [
        clusterMarker1,
        clusterMarker2,
        clusterMarker3,
        clusterMarker4,
        clusterMarker5,
        clusterMarker6,
      ],
      indexGenerator: [9, 49, 149, 249, 499, 999],
      stylingFunction: function (clusterMarker, count) {
        $(clusterMarker.getElement()).find("div:first-child").text(count);
      },
    });

    // marker update to show only markers inside the map boundary
    naver.maps.Event.addListener(map, "zoom_changed", function () {
      updateMarkers(map, markerList);
    });
    naver.maps.Event.addListener(map, "dragend", function () {
      updateMarkers(map, markerList);
    });
    function updateMarkers(map, markerList) {
      var mapBounds = map.getBounds();
      var marker, position;
      for (var i = 0; i < markerList.length; i++) {
        marker = markerList[i];
        position = marker.getPosition();
        if (mapBounds.hasLatLng(position)) {
          showMarker(map, marker);
        } else {
          hideMarker(map, marker);
        }
      }
    }
    function showMarker(map, marker) {
      if (marker.setMap()) return;
      marker.setMap(map);
    }
    function hideMarker(map, marker) {
      if (!marker.setMap()) return;
      marker.setMap(null);
    }
  });
});
// getting user location ▼
async function geoLocation() {
  let promise = new Promise((resolve, reject) => {
    function onGeoSuccess(position) {
      resolve(position);
    }
    // function onGeoFail() {
    //   reject("위치정보를 받아오지 못했습니다.");
    // }
    function onGeoFail(error) {
      // 실패했을때 실행
      switch (error.code) {
        case error.PERMISSION_DENIED:
          reject("위치정보 허용을 차단하셨습니다.");
          break;

        case error.POSITION_UNAVAILABLE:
          reject("위치 정보를 받아오지 못했습니다.");
          break;

        case error.TIMEOUT:
          reject("위치 정보를 받아오지 못했습니다.");
          break;

        case error.UNKNOWN_ERROR:
          reject("일시적인 오류로 위치 정보를 확인할 수 없습니다.");
          break;
      }
    }
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(onGeoSuccess, onGeoFail);
    } else {
    }
  });
  let result = await promise;
  return result;
}

const listBtn = document.querySelector("#show-list-btn");
const searchedClinicList = document.getElementById("menu_wrap");

function highlightMarker(lat, lng) {
  const mediaQuery480 = window.matchMedia("(max-width: 480px)");
  if (mediaQuery480.matches) {
    searchedClinicList.style.display = "none";
    listBtn.style.display = "flex";
  } else {
    listBtn.style.display = "flex";
  }

  for (let i = 0, ii = markerList.length; i < ii; i++) {
    if (lat == markerList[i].position.y && lng == markerList[i].position.x) {
      const marker = markerList[i];
      const infowindow = infowindowList[i];
      if (infowindow.getMap()) {
        infowindow.close();
      } else {
        infowindow.open(map, marker); // infowindow를 map위에, marker 위치에 표시한다
      }
      map.setZoom(15, false);
      map.panTo(
        new naver.maps.LatLng(
          markerList[i].position.y,
          markerList[i].position.x
        )
      );
    }
  }
}

const closeBtn = modal.querySelector(".close-area");
closeBtn.addEventListener("click", (e) => {
  modal.style.display = "none";
});

modal.addEventListener("click", (e) => {
  const evTarget = e.target;
  if (evTarget.classList.contains("modal-overlay")) {
    modal.style.display = "none";
  }
});

function closeSearchedAreaList() {
  searchedClinicList.style.display = "none";
  listBtn.style.display = "flex";
}

function showClinicList() {
  searchedClinicList.style.display = "flex";
  listBtn.style.display = "none";
}

function phoneCall() {
  const clinicContact = document.querySelector(".contact").innerText;
  location.href = "tel:" + clinicContact;
  console.log(clinicContact);
}

/*
function copyToClipBoard() {
  const contactToCopy = document.getElementById("contact");
  window.navigator.clipboard
    .writeText(contactToCopy.innerText.replace(/-/g, ""))
    .then(() => {
      const notification = document.getElementById("notification-container");
      notification.classList.add("show");
      setTimeout(() => {
        notification.classList.remove("show");
      }, 2000);
    });
}
*/
