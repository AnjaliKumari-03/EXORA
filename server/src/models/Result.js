import mongoose from "mongoose";

const sectionScoreSchema = new mongoose.Schema(
  {
    sectionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    score: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    wrongCount: { type: Number, required: true },
    skippedCount: { type: Number, required: true },
  },
  { _id: false },
);

const resultSchema = new mongoose.Schema(
  {
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attempt",
      required: true,
      unique: true,
    },
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
    totalScore: { type: Number, required: true },
    maxPossibleScore: { type: Number, required: true },
    correctCount: { type: Number, required: true },
    wrongCount: { type: Number, required: true },
    skippedCount: { type: Number, required: true },
    sectionScores: [sectionScoreSchema],
  },
  { timestamps: true },
);

export default mongoose.model("Result", resultSchema);
