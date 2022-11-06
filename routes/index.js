var express = require("express");
var router = express.Router();
const clinicModel = require("../model/clinic");

/* GET home page. */
router.get("/", (req, res, next) => {
  res.render("home");
});

router.get("/map/clinics", (req, res, next) => {
  res.render("clinic-m", { title: "Express" });
});

router.get("/map/clinics-km", (req, res, next) => {
  res.render("clinic-km", { title: "Express" });
});

// mongodb에 저장되어있는 데이터를 main.js에서 사용할 수 있도록 하는 함수 ▼
router.get("/clinic", (req, res, next) => {
  // id와 v값은 제외
  clinicModel
    .find({}, { _id: 0 })
    .then((result) => {
      res.json({
        message: "success",
        data: result,
      });
    })
    .catch((error) => {
      res.json({
        message: "error",
      });
    });
});

// router.get("/clinic-km", (req, res, next) => {
//   // id와 v값은 제외
//   clinicModel
//     .find({ sort: "한의" }, { _id: 0 })
//     .then((result) => {
//       res.json({
//         message: "success",
//         data: result,
//       });
//     })
//     .catch((error) => {
//       res.json({
//         message: "error",
//       });
//     });
// });

router.get("/near", (req, res, next) => {
  clinicModel
    .find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [127.0812, 37.49064],
          },
          $minDistance: 1000,
          $maxDistance: 2500,
        },
      },
    })
    .then((result) => {
      res.json({
        message: "success",
        data: result,
      });
    })
    .catch((error) => {
      res.json({
        message: "error",
        result: "반경 2.5km 안에 왕진 병원이 없습니다.",
      });
    });
});

module.exports = router;
