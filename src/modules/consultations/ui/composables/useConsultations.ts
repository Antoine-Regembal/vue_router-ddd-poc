import { useMutation } from '@pinia/colada';

import { createCreateConsultationUseCase } from '../../application/CreateConsultation.use-case';
import { createGetConsultationDetailUseCase } from '../../application/GetConsultationDetail.use-case';
import { createListConsultationsForBeneficiaryUseCase } from '../../application/ListConsultationsForBeneficiary.use-case';
import type { CreateConsultationInput } from '../../domain/ports/ConsultationRepository.port';
import { HttpConsultationRepository } from '../../infrastructure/HttpConsultationRepository';

const repository = new HttpConsultationRepository();

// Exported so the defineColadaLoader() calls in beneficiary's pages can reuse
// the same use-cases instead of instantiating their own repository.
export const listConsultationsForBeneficiary = createListConsultationsForBeneficiaryUseCase(repository);
export const getConsultationDetail = createGetConsultationDetailUseCase(repository);
const createConsultation = createCreateConsultationUseCase(repository);

// Mutation, always called from a component's event handler (never from a
// navigation guard) — unlike defineColadaLoader(), useMutation() doesn't hit
// the cold-start injection issue documented in the README.
export function useCreateConsultation() {
  return useMutation({
    mutation: (input: CreateConsultationInput) => createConsultation.execute(input),
    // Invalidates the matching defineColadaLoader() list query, so the
    // consultations list refetches automatically after a successful create.
    key: (input) => ['consultations', input.beneficiaryId],
  });
}
