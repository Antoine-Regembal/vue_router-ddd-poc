import type { Consultation } from '../domain/entities/Consultation';
import type {
  ConsultationRepository,
  CreateConsultationInput,
} from '../domain/ports/ConsultationRepository.port';
import type { ConsultationDto, CreateConsultationDto } from './dtos/ConsultationDto';

function mapDtoToConsultation(dto: ConsultationDto): Consultation {
  return {
    id: dto.id,
    beneficiaryId: dto.beneficiary_id,
    status: dto.status,
    reason: dto.reason,
    notes: dto.notes,
    doneAt: dto.done_at,
  };
}

export class HttpConsultationRepository implements ConsultationRepository {
  async listForBeneficiary(beneficiaryId: string): Promise<Consultation[]> {
    const response = await fetch(`/api/beneficiaries/${beneficiaryId}/consultations`);
    const dtos = (await response.json()) as ConsultationDto[];
    return dtos.map(mapDtoToConsultation);
  }

  async getById(beneficiaryId: string, id: string): Promise<Consultation | null> {
    const response = await fetch(`/api/beneficiaries/${beneficiaryId}/consultations/${id}`);
    if (response.status === 404) {
      return null;
    }
    const dto = (await response.json()) as ConsultationDto;
    return mapDtoToConsultation(dto);
  }

  async create(input: CreateConsultationInput): Promise<Consultation> {
    const body: CreateConsultationDto = {
      beneficiary_id: input.beneficiaryId,
      reason: input.reason,
      notes: input.notes,
    };
    const response = await fetch(`/api/beneficiaries/${input.beneficiaryId}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const dto = (await response.json()) as ConsultationDto;
    return mapDtoToConsultation(dto);
  }
}
