const mongoose = require("mongoose");

const clinicSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: true },
  department: { type: String, trim: true, required: true },
  sort: { type: String, trim: true, required: true },
  contact: { type: String, trim: true, required: true },
  address_road: { type: String, trim: true },
  address: { type: String, trim: true },
  visit_hours: [{ days: String, hours: String }],
  verified: { type: Boolean, default: false },
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  }, // 왕진 시간, 인증 정보 추가 할 수 있는지 시도하기
});

clinicSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("clinic", clinicSchema, "clinic");
