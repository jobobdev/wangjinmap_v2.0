var express = require("express");
var router = express.Router();
const clinicModel = require("../model/clinic");

router.get("/", (req, res, next) => {
  res.render("update");
});

/* upload 등록 기능 ▼
router.post("/location, (req, res, next) => {
  const { title, address, lat, lng } = req.body;
  let = location = new locationModel();
  location.title = title;
  location.address = address;
  location.lat = lat;
  location.lng = lng;
  // mongodb에 저장하기
  location.save().then((result) => {
    console.log(result);
    res.json({
      message: "success",
    });
  }).catch(error=>{
    console.log(error)
    res.json({
      message: "error",
    })
  })
});
*/

module.exports = router;
