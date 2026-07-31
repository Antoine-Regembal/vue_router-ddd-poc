import type { Consultation } from '../domain/entities/Consultation';
import type { ConsultationRepository } from '../domain/ports/ConsultationRepository.port';

export function createGetConsultationDetailUseCase(repository: ConsultationRepository) {
  return {
    execute(beneficiaryId: string, id: string): Promise<Consultation | null> {
      return repository.getById(beneficiaryId, id);
    },
  };
}
