import { Component, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

/** Multi-select rendered as toggle chips. Binds to a `string[]` field via `[formField]`. */
@Component({
  selector: 'app-chip-select',
  templateUrl: './chip-select.html',
})
export class ChipSelect implements FormValueControl<string[]> {
  readonly value = model<string[]>([]);
  readonly options = input.required<readonly string[]>();
  /** Optional formatter for the visible text; the raw option is kept as tooltip. */
  readonly display = input<(option: string) => string>((option) => option);

  protected toggle(option: string): void {
    this.value.update((selected) =>
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    );
  }
}
