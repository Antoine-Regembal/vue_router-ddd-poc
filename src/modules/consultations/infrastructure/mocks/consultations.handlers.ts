import { http, HttpResponse } from 'msw';

import { ConsultationDtoFactory } from './ConsultationDto.factory';
import type { ConsultationDto, CreateConsultationDto } from '../dtos/ConsultationDto';

// Lazily generated per beneficiaryId: this module knows nothing about which
// beneficiaries exist, it just fabricates plausible data for whatever id is
// requested — keeps `consultations` fully decoupled from `beneficiary`.
const consultationsByBeneficiary = new Map<string, ConsultationDto[]>();

function getOrCreateConsultations(beneficiaryId: string): ConsultationDto[] {
  let consultations = consultationsByBeneficiary.get(beneficiaryId);
  if (!consultations) {
    // Fixed, deterministic ids (derived from beneficiaryId) so a consultation
    // detail URL keeps working across reloads — only the other fields
    // (reason, notes, status, date) stay randomized via faker.
    consultations = Array.from({ length: 3 }, (_, index) =>
      ConsultationDtoFactory.create({
        id: `${beneficiaryId}-consultation-${index + 1}`,
        beneficiary_id: beneficiaryId,
      })
    );
    consultationsByBeneficiary.set(beneficiaryId, consultations);
  }
  return consultations;
}

export const consultationsHandlers = [
  http.get('/api/beneficiaries/:beneficiaryId/consultations', ({ params }) => {
    const consultations = getOrCreateConsultations(params.beneficiaryId as string);
    return HttpResponse.json(consultations);
  }),

  http.get('/api/beneficiaries/:beneficiaryId/consultations/:id', ({ params }) => {
    // Scoped by beneficiaryId so the data exists whether this beneficiary's
    // consultations were already listed or not (deep-linking straight to a
    // detail page — a cold reload — must not depend on the list having run
    // first).
    const consultations = getOrCreateConsultations(params.beneficiaryId as string);
    const consultation = consultations.find((c) => c.id === params.id);
    if (!consultation) {
      return HttpResponse.json({ message: 'Consultation not found' }, { status: 404 });
    }
    return HttpResponse.json(consultation);
  }),

  http.post('/api/beneficiaries/:beneficiaryId/consultations', async ({ params, request }) => {
    const beneficiaryId = params.beneficiaryId as string;
    const body = (await request.json()) as CreateConsultationDto;
    const consultation = ConsultationDtoFactory.create({
      beneficiary_id: beneficiaryId,
      reason: body.reason,
      notes: body.notes,
      status: 'in_progress',
    });
    getOrCreateConsultations(beneficiaryId).push(consultation);
    return HttpResponse.json(consultation, { status: 201 });
  }),
];
