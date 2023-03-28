export const getLatestPrice = (
  first?: { date: Date; price: number },
  second?: { date: Date; price: number }
) => {
  if (!first && second) {
    return second.price;
  }
  if (!second && first) {
    return first.price;
  }
  if (first && second) {
    if (first.date > second.date) {
      return first.price;
    } else {
      return second.price;
    }
  }

  return 0;
};
