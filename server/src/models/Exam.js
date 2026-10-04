import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  { text: { type: String, required: true } },
  { _id: true },
);

const questionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["mcq", "msq", "numerical"], default: "mcq" },
    text: { type: String, required: true },
    imageData: { type: String, default: null },
    options: [optionSchema],
    correctOptionIds: [{ type: mongoose.Schema.Types.ObjectId }],
    correctNumericalAnswer: { type: String, default: null },
    positiveMarks: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0 },
  },
  { _id: true },
);

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    durationSeconds: { type: Number, default: null },
    questions: [questionSchema],
  },
  { _id: true },
);

const examSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },

    category: { type: String, default: "", trim: true },
    navigationMode: {
      type: String,
      enum: ["free", "one-way"],
      default: "free",
    },

    restrictSectionNavigation: { type: Boolean, default: false },
    totalDurationSeconds: { type: Number, required: true },
    sections: [sectionSchema],
  },
  { timestamps: true },
);

export default mongoose.model("Exam", examSchema);
