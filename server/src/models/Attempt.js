import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    selectedOptionIds: [{ type: mongoose.Schema.Types.ObjectId }],
    numericalAnswer: { type: String, default: null },
    status: {
      type: String,
      enum: ["attempted", "marked-for-review", "not-attempted"],
      default: "not-attempted",
    },
  },
  { _id: false },
);

const sectionOrderSchema = new mongoose.Schema(
  {
    sectionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { _id: false },
);

const integrityEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["tab-switch", "window-blur", "fullscreen-exit"],
      required: true,
    },
    occurredAt: { type: Date, required: true },
  },
  { _id: false },
);

const attemptSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startedAt: { type: Date, required: true },
    answers: { type: Map, of: answerSchema, default: {} },
    questionOrder: [sectionOrderSchema],
    optionOrders: {
      type: Map,
      of: [mongoose.Schema.Types.ObjectId],
      default: {},
    },

    sectionStartedAt: { type: Map, of: Date, default: {} },
    submittedAt: { type: Date, default: null },
    autoSubmitted: { type: Boolean, default: false },
    integrityEvents: { type: [integrityEventSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("Attempt", attemptSchema);
