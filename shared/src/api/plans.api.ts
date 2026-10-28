import { apiRequest } from './http';
import type {
  CreateDairyPlanInput,
  DairyPlan,
  UpdateDairyPlanInput,
} from '../types/commerce';

export interface PlanActionResult {
  planId: string;
  actionId?: string;
  actionType: string;
  targetDate: string;
  extraQuantity?: number;
  message: string;
}

/** GET /api/v1/dairy-plans — customer's subscriptions (active + past). */
export function listPlans(signal?: AbortSignal): Promise<DairyPlan[]> {
  return apiRequest<DairyPlan[]>('/dairy-plans', { signal });
}

/** GET /api/v1/dairy-plans/:planId */
export function getPlan(planId: string, signal?: AbortSignal): Promise<DairyPlan> {
  return apiRequest<DairyPlan>(`/dairy-plans/${encodeURIComponent(planId)}`, { signal });
}

/** POST /api/v1/dairy-plans */
export function createPlan(input: CreateDairyPlanInput): Promise<DairyPlan> {
  return apiRequest<DairyPlan>('/dairy-plans', { method: 'POST', body: input });
}

/** PATCH /api/v1/dairy-plans/:planId — frequency, days, address, quantities. */
export function updatePlan(planId: string, input: UpdateDairyPlanInput): Promise<DairyPlan> {
  return apiRequest<DairyPlan>(`/dairy-plans/${encodeURIComponent(planId)}`, {
    method: 'PATCH',
    body: input,
  });
}

/** POST /api/v1/dairy-plans/:planId/skip — skip tomorrow (or a target date). */
export function skipDelivery(
  planId: string,
  input: { targetDate?: string; reason?: string } = {},
): Promise<PlanActionResult> {
  return apiRequest<PlanActionResult>(`/dairy-plans/${encodeURIComponent(planId)}/skip`, {
    method: 'POST',
    body: input,
  });
}

/** POST /api/v1/dairy-plans/:planId/extra-delivery */
export function addExtraDelivery(
  planId: string,
  input: { targetDate?: string; extraQuantity: number; reason?: string },
): Promise<PlanActionResult> {
  return apiRequest<PlanActionResult>(`/dairy-plans/${encodeURIComponent(planId)}/extra-delivery`, {
    method: 'POST',
    body: input,
  });
}

/** POST /api/v1/dairy-plans/:planId/pause */
export function pausePlan(planId: string): Promise<DairyPlan> {
  return apiRequest<DairyPlan>(`/dairy-plans/${encodeURIComponent(planId)}/pause`, {
    method: 'POST',
  });
}

/** POST /api/v1/dairy-plans/:planId/resume */
export function resumePlan(planId: string): Promise<DairyPlan> {
  return apiRequest<DairyPlan>(`/dairy-plans/${encodeURIComponent(planId)}/resume`, {
    method: 'POST',
  });
}

/** POST /api/v1/dairy-plans/:planId/cancel */
export function cancelPlan(planId: string): Promise<DairyPlan> {
  return apiRequest<DairyPlan>(`/dairy-plans/${encodeURIComponent(planId)}/cancel`, {
    method: 'POST',
  });
}
