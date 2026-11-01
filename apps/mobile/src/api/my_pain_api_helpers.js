import { apiMyPain } from './django-API';

// returns the assessment's saved MyPain, or null if the section hasn't been done yet
export async function apiLoadMyPain(assessmentId) {
    const [existing] = await apiMyPain('select', { assessment: assessmentId });
    return existing ?? null;
}

/* Create/update a finished My Pain section to its assessment
- completed_at is set to now */
export async function apiSaveMyPain(assessmentId, details) {
    const values = { ...details, completed_at: new Date().toISOString() };
    const [existing] = await apiMyPain('select', { assessment: assessmentId });
    if (existing) {
        return apiMyPain('update', { id: existing.id, ...values });
    }
    return apiMyPain('create', { assessment: assessmentId, ...values });
}
