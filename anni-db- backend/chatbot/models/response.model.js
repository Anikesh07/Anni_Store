const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
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

    messages: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "At least one response message is required"
      }
    }
  },
  { timestamps: true }
);

/* =========================================
   CLEAN MESSAGES (🔥 AUTO TRIM)
========================================= */
responseSchema.pre("save", function (next) {
  if (this.messages && this.messages.length) {
    this.messages = this.messages
      .map(msg => msg.trim())
      .filter(msg => msg.length > 0);
  }
  next();
});

/* =========================================
   CLEAN OUTPUT
========================================= */
responseSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Response", responseSchema);