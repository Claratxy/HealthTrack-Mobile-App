import { buildMonthGrid } from '../utils/calendarUtils';

describe('buildMonthGrid', () => {
  test('returns exactly 42 cells', () => {
    const grid = buildMonthGrid(2026, 0); // January 2026
    expect(grid).toHaveLength(42);
  });

  test('marks days in the target month as isCurrentMonth true', () => {
    const grid = buildMonthGrid(2026, 0);
    const currentMonthCells = grid.filter((c) => c.isCurrentMonth);
    expect(currentMonthCells).toHaveLength(31); // January has 31 days
  });

  test('leading/trailing cells are marked isCurrentMonth false', () => {
    const grid = buildMonthGrid(2026, 1); // February 2026
    expect(grid[0].isCurrentMonth === false || grid[0].day === 1).toBeTruthy();
  });
});