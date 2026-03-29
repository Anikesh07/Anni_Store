const mongoose = require("mongoose");

const intentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9_]+$/, "Intent name must be lowercase, no spaces, only letters, numbers, underscore"]
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

/* =========================================
   UNIQUE INDEX (🔥 IMPORTANT)
========================================= */
intentSchema.index({ name: 1, companyId: 1 }, { unique: true });

/* =========================================
   CLEAN OUTPUT
========================================= */
intentSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Intent", intentSchema);