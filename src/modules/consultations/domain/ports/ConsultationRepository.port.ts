import type { Consultation } from '../entities/Consultation';

export interface CreateConsultationInput {
  beneficiaryId: string;
  reason: string;
  notes: string;
}

export interface ConsultationRepository {
  listForBeneficiary(beneficiaryId: string): Promise<Consultation[]>;
  getById(beneficiaryId: string, id: string): Promise<Consultation | null>;
  create(input: CreateConsultationInput): Promise<Consultation>;
}
