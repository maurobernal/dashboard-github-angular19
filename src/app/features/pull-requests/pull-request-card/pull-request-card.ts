import { Component, input } from '@angular/core';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { CHECK_LABELS, REVIEW_LABELS } from '../pull-request.labels';
import { CheckState, PullRequest, ReviewState } from '../pull-request.model';

const REVIEW_STYLES: Record<ReviewState, { icon: string; classes: string }> = {
  APPROVED: { icon: 'bi-check2-circle', classes: 'border-emerald-500/40 text-emerald-300' },
  CHANGES_REQUESTED: { icon: 'bi-x-circle', classes: 'border-rose-500/40 text-rose-300' },
  REVIEW_REQUIRED: { icon: 'bi-hourglass-split', classes: 'border-amber-500/40 text-amber-300' },
  NONE: { icon: 'bi-dash-circle', classes: 'border-slate-700 text-slate-400' },
};

const CHECK_STYLES: Record<CheckState, { icon: string; classes: string }> = {
  SUCCESS: { icon: 'bi-check-circle-fill', classes: 'text-emerald-400' },
  FAILURE: { icon: 'bi-x-circle-fill', classes: 'text-rose-400' },
  PENDING: { icon: 'bi-arrow-repeat', classes: 'text-amber-400' },
  NONE: { icon: 'bi-circle', classes: 'text-slate-600' },
};

@Component({
  selector: 'app-pull-request-card',
  imports: [RelativeTimePipe],
  templateUrl: './pull-request-card.html',
})
export class PullRequestCard {
  readonly pullRequest = input.required<PullRequest>();

  protected readonly reviewLabels = REVIEW_LABELS;
  protected readonly reviewStyles = REVIEW_STYLES;
  protected readonly checkLabels = CHECK_LABELS;
  protected readonly checkStyles = CHECK_STYLES;
}
