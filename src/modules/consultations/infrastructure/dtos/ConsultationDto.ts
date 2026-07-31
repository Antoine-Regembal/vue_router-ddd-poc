export interface ConsultationDto {
  id: string;
  beneficiary_id: string;
  status: 'in_progress' | 'done';
  reason: string;
  notes: string;
  done_at: string;
}

export interface CreateConsultationDto {
  beneficiary_id: string;
  reason: string;
  notes: string;
}
