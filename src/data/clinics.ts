export type ClinicStatus = 'Simulated: Accepting Patients' | 'Simulated: Limited Availability' | 'Simulated: Not Currently Accepting';

export interface Clinic {
  id: string;
  name: string;
  location: string;
  distance: number;
  languages: string[];
  status: ClinicStatus;
  description: string;
  matchingInfo: string;
  intakeRequirements: string[];
  nextSteps: string[];
  fictionNote: string;
}

export const clinics: Clinic[] = [
  {
    id: 'maple-community',
    name: 'Maple Community Health Centre',
    location: 'East Toronto, Ontario',
    distance: 5.4,
    languages: ['English', 'French'],
    status: 'Simulated: Accepting Patients',
    description:
      'A welcoming community-based clinic with same-day intake support and a strong focus on family-based primary care.',
    matchingInfo:
      'Good fit for patients seeking a family doctor and a clinic with broader community supports.',
    intakeRequirements: ['New patient registration form', 'Preferred contact method', 'Availability check for new openings'],
    nextSteps: ['Confirm whether intake is open for new patients', 'Review registration information', 'Receive a follow-up communication from clinic staff'],
    fictionNote: 'Fictional clinic profile for demonstration purposes only.',
  },
  {
    id: 'harbourview-primary',
    name: 'Harbourview Primary Care',
    location: 'Downtown Toronto, Ontario',
    distance: 7.8,
    languages: ['English', 'Mandarin'],
    status: 'Simulated: Limited Availability',
    description:
      'A downtown practice offering primary care and preventive services with limited new patient capacity.',
    matchingInfo:
      'Best suited to patients who need a clinic with language support and a smaller caseload.',
    intakeRequirements: ['Brief intake questionnaire', 'Availability confirmation', 'Language preference noted during registration'],
    nextSteps: ['Check current waitlist status', 'Complete temporary registration form', 'Confirm whether a clinician is available for intake'],
    fictionNote: 'Fictional clinic profile for demonstration purposes only.',
  },
  {
    id: 'northstar-family',
    name: 'Northstar Family Health Clinic',
    location: 'North York, Ontario',
    distance: 12.1,
    languages: ['English', 'Punjabi', 'Cantonese'],
    status: 'Simulated: Accepting Patients',
    description:
      'A family health clinic with multilingual support and broad primary care services for unattached patients.',
    matchingInfo:
      'Strong option for families or patients seeking care in a culturally inclusive environment.',
    intakeRequirements: ['Initial form and contact preference', 'Translation support if needed', 'Current patient capacity check'],
    nextSteps: ['Review clinic intake timing', 'Confirm preferred language support', 'Receive a simulated clinic response'],
    fictionNote: 'Fictional clinic profile for demonstration purposes only.',
  },
  {
    id: 'riverside-community',
    name: 'Riverside Community Medical Centre',
    location: 'Etobicoke, Ontario',
    distance: 18.4,
    languages: ['English', 'Arabic', 'French'],
    status: 'Simulated: Not Currently Accepting',
    description:
      'A community medical centre pairing primary care with integrated health and social supports, though currently at limited capacity.',
    matchingInfo:
      'Useful for patients who want a broader family health environment but may need to try again later.',
    intakeRequirements: ['Waitlist enrollment', 'Follow-up contact preference', 'Availability review'],
    nextSteps: ['Check whether a future intake window opens', 'Keep the application on file for later review', 'Consider other nearby clinics in the meantime'],
    fictionNote: 'Fictional clinic profile for demonstration purposes only.',
  },
];

export function matchClinics(preferences: {
  city: string;
  postalCode: string;
  radius: number;
  languages: string[];
  accessibility: string[];
  communication: string[];
  careNeed: string;
}): Clinic[] {
  const city = preferences.city.toLowerCase();
  const preferredLanguages = preferences.languages.map((language) => language.toLowerCase());
  const radius = preferences.radius;

  return clinics
    .map((clinic) => {
      let score = 0;
      if (clinic.distance <= radius) score += 50;
      if (clinic.distance <= radius + 10) score += 20;
      if (city.includes('toronto') || city.includes('mississauga') || city.includes('etobicoke') || city.includes('north york')) {
        score += 10;
      }

      const sharedLanguageCount = preferredLanguages.filter((language) =>
        clinic.languages.some((clinicLanguage) => clinicLanguage.toLowerCase() === language),
      ).length;
      score += sharedLanguageCount * 20;

      if (preferences.careNeed === 'Find a family doctor') {
        score += 15;
      }
      if (preferences.careNeed === 'Find a primary care clinic') {
        score += 10;
      }
      if (preferences.accessibility.length > 0) {
        score += 5;
      }
      if (preferences.communication.length > 0) {
        score += 5;
      }

      return { clinic, score };
    })
    .filter(({ clinic, score }) => clinic.distance <= radius + 12 || score > 25)
    .sort((a, b) => b.score - a.score)
    .map(({ clinic }) => clinic);
}
