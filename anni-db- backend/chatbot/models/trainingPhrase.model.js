const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema(
  {
    intentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Intent",
      required: true,
      index: true
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },

    text: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Training phrase too short"]
    }
  },
  { timestamps: true }
);

/* =========================================
   CLEAN TEXT (🔥 AUTO NORMALIZE)
========================================= */
trainingSchema.pre("save", function (next) {
  if (this.text) {
    this.text = this.text.trim();
  }
  next();
});

/* =========================================
   UNIQUE COMBINATION (OPTIONAL BUT POWERFUL)
========================================= */
trainingSchema.index(
  { intentId: 1, text: 1, companyId: 1 },
  { unique: true }
);

/* =========================================
   CLEAN OUTPUT
========================================= */
trainingSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("TrainingPhrase", trainingSchema);