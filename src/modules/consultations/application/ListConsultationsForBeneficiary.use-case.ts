import type { Consultation } from '../domain/entities/Consultation';
import type { ConsultationRepository } from '../domain/ports/ConsultationRepository.port';

export function createListConsultationsForBeneficiaryUseCase(repository: ConsultationRepository) {
  return {
    execute(beneficiaryId: string): Promise<Consultation[]> {
      return repository.listForBeneficiary(beneficiaryId);
    },
  };
}
