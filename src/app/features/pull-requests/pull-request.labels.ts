import { CheckState, ReviewState } from './pull-request.model';

export const REVIEW_LABELS: Record<ReviewState, string> = {
  APPROVED: 'Aprobado',
  CHANGES_REQUESTED: 'Cambios pedidos',
  REVIEW_REQUIRED: 'Review pendiente',
  NONE: 'Sin review requerida',
};

export const CHECK_LABELS: Record<CheckState, string> = {
  SUCCESS: 'Checks OK',
  FAILURE: 'Checks fallando',
  PENDING: 'Checks en curso',
  NONE: 'Sin checks',
};
