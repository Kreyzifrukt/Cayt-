export type SimonInputResult =
  | { kind: "ignored" }
  | { kind: "mistake" }
  | { kind: "continue"; input: number[] }
  | { kind: "complete"; input: number[] };

/** Apply one player input without allowing extra presses after a round is complete. */
export function appendSimonInput(
  sequence: readonly number[],
  input: readonly number[],
  value: number,
): SimonInputResult {
  if (sequence.length === 0 || input.length >= sequence.length) {
    return { kind: "ignored" };
  }

  if (sequence[input.length] !== value) {
    return { kind: "mistake" };
  }

  const nextInput = [...input, value];
  return nextInput.length === sequence.length
    ? { kind: "complete", input: nextInput }
    : { kind: "continue", input: nextInput };
}
