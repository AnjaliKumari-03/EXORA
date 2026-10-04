export const STATUS_COLORS = {
  "not-visited": "bg-yellow-100 text-stone-600",
  "not-attempted": "bg-rose-300 text-rose-700 border border-rose-400",
  attempted: "bg-emerald-100 text-emerald-700 border border-emerald-500",
  "marked-for-review": "bg-violet-100 text-violet-700 border border-violet-500",
};

export function getQuestionStatus(answer) {
  return answer ? answer.status : "not-visited";
}
