const { calculateFine } = require('../utils/fineCalculator');

describe('Fine Calculator', () => {
  it('should return 0 if returned within 7 days', () => {
    const fine = calculateFine(new Date('2024-01-01'), new Date('2024-01-05'));
    expect(fine).toBe(0);
  });

  it('should calculate fine for overdue returns', () => {
    const fine = calculateFine(new Date('2024-01-01'), new Date('2024-01-10'));
    expect(fine).toBe(20);
  });

  it('should match fine calculation snapshot', () => {
    const fine = calculateFine(new Date('2024-01-01'), new Date('2024-01-10'));
    expect(fine).toMatchSnapshot();
  });
});
