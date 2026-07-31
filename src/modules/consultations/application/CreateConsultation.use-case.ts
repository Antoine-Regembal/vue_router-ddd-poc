import type { Consultation } from '../domain/entities/Consultation';
import type {
  ConsultationRepository,
  CreateConsultationInput,
} from '../domain/ports/ConsultationRepository.port';

export function createCreateConsultationUseCase(repository: ConsultationRepository) {
  return {
    execute(input: CreateConsultationInput): Promise<Consultation> {
      return repository.create(input);
    },
  };
}
