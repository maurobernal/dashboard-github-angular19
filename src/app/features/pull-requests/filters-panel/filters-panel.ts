import { Component, input, model } from '@angular/core';
import { debounce, form, FormField } from '@angular/forms/signals';
import { ChipSelect } from '../../../shared/ui/chip-select/chip-select';
import { REVIEW_LABELS } from '../pull-request.labels';
import { DEFAULT_FILTERS, FilterOptions, PullRequestFilters } from '../pull-request-filters';

@Component({
  selector: 'app-filters-panel',
  imports: [FormField, ChipSelect],
  templateUrl: './filters-panel.html',
})
export class FiltersPanel {
  readonly filters = model.required<PullRequestFilters>();
  readonly options = input.required<FilterOptions>();
  readonly org = input.required<string>();
  readonly user = input.required<string>();

  protected readonly filterForm = form(this.filters, (path) => {
    debounce(path.search, 250);
  });

  protected readonly reviewOptions = Object.entries(REVIEW_LABELS);

  protected readonly repositoryName = (repository: string) =>
    repository.split('/')[1] ?? repository;

  protected reset(): void {
    this.filters.set(DEFAULT_FILTERS);
  }
}
