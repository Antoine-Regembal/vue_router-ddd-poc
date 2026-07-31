export type ConsultationStatus = 'in_progress' | 'done';

export interface Consultation {
  id: string;
  beneficiaryId: string;
  status: ConsultationStatus;
  reason: string;
  notes: string;
  doneAt: string;
}
