import type { Beneficiary } from './entities/Beneficiary';

// Fixed, imaginary beneficiaries — not fetched, not faker-generated: stable
// ids so /beneficiary/:id links stay meaningful across reloads.
export const beneficiaries: Beneficiary[] = [
  {
    id: 'ben-1',
    firstName: 'Alex',
    lastName: 'Martin',
    program: 'Hearing follow-up',
    sessionCompleted: false,
  },
  {
    id: 'ben-2',
    firstName: 'Sam',
    lastName: 'Dubois',
    program: 'Post-surgery monitoring',
    sessionCompleted: false,
  },
  {
    id: 'ben-3',
    firstName: 'Jordan',
    lastName: 'Petit',
    program: 'Annual check-up',
    sessionCompleted: true,
  },
];

export function getBeneficiaryById(id: string): Beneficiary | null {
  return beneficiaries.find((beneficiary) => beneficiary.id === id) ?? null;
}
