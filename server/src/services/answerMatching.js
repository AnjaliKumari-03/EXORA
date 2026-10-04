export function numericalAnswersMatch(given, correct) {
  if (given === null || given === undefined || given === "") return false;
  if (correct === null || correct === undefined || correct === "") return false;
  return (
    String(given).trim().toLowerCase() === String(correct).trim().toLowerCase()
  );
}
