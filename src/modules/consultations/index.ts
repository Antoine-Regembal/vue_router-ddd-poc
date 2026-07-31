export type { Consultation } from './domain/entities/Consultation';
export {
  listConsultationsForBeneficiary,
  getConsultationDetail,
  useCreateConsultation,
} from './ui/composables/useConsultations';
export { default as ConsultationCard } from './ui/components/ConsultationCard.vue';
export { default as ConsultationForm } from './ui/components/ConsultationForm.vue';
