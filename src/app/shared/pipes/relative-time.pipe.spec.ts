import { RelativeTimePipe } from './relative-time.pipe';

describe('RelativeTimePipe', () => {
  const pipe = new RelativeTimePipe();
  const now = new Date('2026-10-25T12:00:00Z');
  const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000);

  it.each([
    [10, 'este minuto'],
    [5 * 60, 'hace 5 minutos'],
    [3 * 60 * 60, 'hace 3 horas'],
    [24 * 60 * 60, 'ayer'],
    [10 * 24 * 60 * 60, 'hace 10 días'],
  ])('formats %i seconds ago as "%s"', (seconds, expected) => {
    expect(pipe.transform(ago(seconds), now)).toBe(expected);
  });
});
