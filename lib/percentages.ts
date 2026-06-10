export function getPercentages(votesA: number, votesB: number) {
  const total = votesA + votesB;

  if (total === 0) {
    return { a: 50, b: 50 };
  }

  return {
    a: Math.round((votesA / total) * 100),
    b: Math.round((votesB / total) * 100),
  };
}
