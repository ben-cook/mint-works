/**
 * Shuffles array in place.
 * @param array - An array containing the items.
 */
export const shuffleArray = <T>(array: Array<T>): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
