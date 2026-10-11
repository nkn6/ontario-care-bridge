import { cloneElement, isValidElement, useEffect, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Clock3,
  FileText,
  Globe2,
  HeartPulse,
  Home,
  MapPin,
  Menu,
  MessageSquare,
  Phone,
  ShieldCheck,
  Stethoscope,
  X,
} from 'lucide-react';
import { clinics, matchClinics, type Clinic } from './data/clinics';

type Language = 'en' | 'fr';
type SectionId = 'home' | 'how-it-works' | 'find-care' | 'track';
type WizardStep = 1 | 2 | 3 | 4;

interface Preferences {
  city: string;
  postalCode: string;
  radius: number;
  languages: string[];
  accessibility: string[];
  communication: string[];
  careNeed: string;
  acknowledged: boolean;
}

interface ApplicationRecord {
  ref: string;
  clinic: Clinic;
  submittedAt: string;
  currentStageIndex: number;
}

const timelineStages = [
  {
    title: 'Application Submitted',
    description: 'Your demo application has been created and is ready for review.',
  },
  {
    title: 'Clinic Matching',
    description: 'We are checking which fictional clinics may be a potential fit.',
  },
  {
    title: 'Potential Clinic Match Found',
    description: 'A clinic match has been identified and is ready for follow-up.',
  },
  {
    title: 'Awaiting Clinic Contact',
    description: 'The system is waiting for a clinic response in this demonstration.',
  },
  {
    title: 'Next Steps Available',
    description: 'Your next step would be to confirm intake details and documentation requirements.',
  },
] as const;

const translations = {
  en: {
    metaDescription:
      'Ontario Care Bridge is a demonstration concept for helping people find their next step toward primary care in Ontario.',
    home: 'Home',
    howItWorks: 'How It Works',
    trackApplication: 'Track Application',
    findCareButton: 'Find Care Near Me',
    howItWorksButton: 'How It Works',
    heroHeadline: 'No family doctor? Let’s help you find your next step.',
    heroText:
      'Finding primary care should not mean calling clinic after clinic without knowing who is accepting patients. Ontario Care Bridge demonstrates how existing healthcare services could work together to help connect you with primary care.',
    disclaimer: 'Clinic information, availability, and application statuses are simulated for this demonstration.',
    problemHeadline: 'Finding care should not be this complicated.',
    solutionHeadline: 'One simpler journey to primary care.',
    sectionTitle: 'How it works',
    trackTitle: 'Track your application',
    viewSample: 'View Sample Application',
    backToHome: 'Return to Home',
  },
  fr: {
    metaDescription:
      'Ontario Care Bridge est un concept de démonstration qui aide les gens à trouver la prochaine étape vers des soins primaires en Ontario.',
    home: 'Accueil',
    howItWorks: 'Comment ça fonctionne',
    trackApplication: 'Suivi de la demande',
    findCareButton: 'Trouver des soins près de chez moi',
    howItWorksButton: 'Comment ça fonctionne',
    heroHeadline: 'Pas de médecin de famille? Aidons-vous à trouver votre prochaine étape.',
    heroText:
      'Trouver des soins primaires ne devrait pas signifier appeler de clinique en clinique sans savoir qui accepte de nouveaux patients. Ontario Care Bridge montre comment certains services de santé existants pourraient travailler ensemble pour vous aider à trouver des soins primaires.',
    disclaimer: 'Les informations sur les cliniques, leur disponibilité et l’état des demandes sont simulées pour cette démonstration.',
    problemHeadline: 'Trouver des soins ne devrait pas être si compliqué.',
    solutionHeadline: 'Un parcours plus simple vers des soins primaires.',
    sectionTitle: 'Comment ça fonctionne',
    trackTitle: 'Suivez votre demande',
    viewSample: 'Voir un exemple de demande',
    backToHome: 'Retour à l’accueil',
  },
} as const;

const frenchText: Record<string, string> = {
  'Simulated service concept': 'Concept de service simulé',
  'Patient journey': 'Parcours du patient',
  Demo: 'Démo',
  'Your Needs': 'Vos besoins',
  'Find a Clinic': 'Trouver une clinique',
  'Submit an Application': 'Soumettre une demande',
  'Track Your Status': 'Suivre votre demande',
  'Current status': 'Statut actuel',
  'Searching for a possible next step': 'Recherche d’une prochaine étape possible',
  'Why this matters': 'Pourquoi est-ce important',
  'The proposed solution': 'La solution proposée',
  'Less uncertainty about where to go.': 'Moins d’incertitude quant à l’endroit où aller.',
  'Clearer application progress.': 'Un suivi plus clair de la demande.',
  'A more connected patient experience.': 'Une expérience de soins mieux coordonnée.',
  'Start the patient journey': 'Commencer le parcours de soins',
  'Design concept': 'Concept de conception',
  'How It Works': 'Comment ça fonctionne',
  Patient: 'Patient',
  'Existing Healthcare Services': 'Services de santé existants',
  'Patient Update': 'Mise à jour au patient',
  'Health811': 'Health811',
  'Starting point for navigation and health advice.': 'Point de départ pour s’orienter et obtenir des conseils en santé.',
  'Central Intake': 'Guichet central',
  'Potential source of clinic matching and intake information.': 'Source possible de jumelage avec des cliniques et de renseignements sur l’admission.',
  'eReferral Ontario': 'eReferral Ontario',
  'Potential component of an appropriately authorized referral workflow.': 'Composante possible d’un processus d’aiguillage dûment autorisé.',
  'This is a proposal, not an existing integrated service. Any real implementation would require technical, clinical, legal, privacy, and operational approval.':
    'Il s’agit d’une proposition et non d’un service intégré existant. Toute mise en œuvre réelle nécessiterait des approbations techniques, cliniques, juridiques, opérationnelles et en matière de protection de la vie privée.',
  'Demo tracking': 'Suivi de démonstration',
  'Reference number': 'Numéro de référence',
  Copy: 'Copier',
  'Selected clinic': 'Clinique sélectionnée',
  'Application Submitted': 'Demande soumise',
  'Your demo application has been created and is ready for review.': 'Votre demande de démonstration a été créée et est prête à être examinée.',
  'Clinic Matching': 'Recherche de cliniques correspondantes',
  'We are checking which fictional clinics may be a potential fit.': 'Nous vérifions quelles cliniques fictives pourraient vous convenir.',
  'Potential Clinic Match Found': 'Une clinique correspondante a été trouvée',
  'A clinic match has been identified and is ready for follow-up.': 'Une clinique correspondante a été repérée et un suivi peut être effectué.',
  'Awaiting Clinic Contact': 'En attente d’un contact de la clinique',
  'The system is waiting for a clinic response in this demonstration.': 'Dans cette démonstration, le système attend une réponse de la clinique.',
  'Next Steps Available': 'Prochaines étapes disponibles',
  'Your next step would be to confirm intake details and documentation requirements.': 'La prochaine étape consisterait à confirmer les détails de l’admission et les documents requis.',
  Completed: 'Terminé',
  'Completed:': 'Terminé :',
  Current: 'En cours',
  Upcoming: 'À venir',
  'Simulate Next Status': 'Simuler le prochain statut',
  'All statuses are simulated and do not represent real clinic activity or patient care.':
    'Tous les statuts sont simulés et ne reflètent pas l’activité réelle d’une clinique ni des soins aux patients.',
  'Application dashboard': 'Tableau de bord des demandes',
  'This is a demonstration concept for helping patients understand their next step toward primary care in Ontario.':
    'Ce concept de démonstration aide les patients à comprendre la prochaine étape vers des soins primaires en Ontario.',
  Explore: 'Explorer',
  'About Ontario Care Bridge': 'À propos d’Ontario Care Bridge',
  Accessibility: 'Accessibilité',
  Privacy: 'Confidentialité',
  Contact: 'Coordonnées',
  Disclaimer: 'Avis',
  'This site is a demonstration concept and is not connected to Ontario healthcare systems or real service delivery.':
    'Ce site est un concept de démonstration qui n’est lié ni aux systèmes de santé de l’Ontario ni à la prestation réelle de services.',
  'Find care': 'Trouver des soins',
  'Your care search': 'Recherche de soins',
  Close: 'Fermer',
  Step: 'Étape',
  'of 4': 'sur 4',
  'Reviewing your preferences...': 'Examen de vos préférences...',
  'Checking simulated clinic availability...': 'Vérification des disponibilités simulées des cliniques...',
  'Finding a potential match...': 'Recherche d’une correspondance possible...',
  Back: 'Retour',
  Continue: 'Continuer',
  'Find Matching Clinics': 'Trouver des cliniques correspondantes',
  'Clinic details': 'Détails de la clinique',
  'Close clinic details': 'Fermer les détails de la clinique',
  'General location': 'Emplacement général',
  'Approximate distance': 'Distance approximative',
  'Supported languages': 'Langues offertes',
  'Simulated intake requirements': 'Conditions d’admission simulées',
  'Illustrative next steps': 'Prochaines étapes proposées',
  'This is a fictional clinic profile used for the prototype. It does not represent a real appointment or confirmed acceptance.':
    'Ce profil de clinique est fictif et sert au prototype. Il ne représente ni un véritable rendez-vous ni une acceptation confirmée.',
  'Submit Demo Application': 'Soumettre une demande de démonstration',
  'Preferred search radius': 'Rayon de recherche souhaité',
  'What would help you feel comfortable accessing care?': 'Qu’est-ce qui vous aiderait à accéder aux soins en toute confiance?',
  'Accessibility preferences': 'Préférences en matière d’accessibilité',
  'Communication preferences': 'Préférences de communication',
  'What kind of care are you looking for?': 'Quel type de soins recherchez-vous?',
  'If you are experiencing a medical emergency, call 911.': 'En cas d’urgence médicale, composez le 911.',
  'For non-emergency health advice in Ontario, contact Health811.': 'Pour obtenir des conseils de santé non urgents en Ontario, communiquez avec Health811.',
  'Review your preferences': 'Vérifiez vos préférences',
  'I understand the clinic results are simulated and do not represent a real appointment or confirmed acceptance.':
    'Je comprends que les résultats des cliniques sont simulés et ne représentent ni un véritable rendez-vous ni une acceptation confirmée.',
  'Potential clinic matches': 'Cliniques potentiellement correspondantes',
  'Modify search': 'Modifier la recherche',
  'No matches found': 'Aucune correspondance trouvée',
  'Try widening the search radius or adjusting your language preferences.':
    'Essayez d’élargir le rayon de recherche ou de modifier vos préférences linguistiques.',
  'Expand search radius': 'Élargir le rayon de recherche',
  'Approx.': 'À environ',
  'km away': 'km de distance',
  'View Details': 'Voir les détails',
  'Continue With This Clinic': 'Continuer avec cette clinique',
  'Where are you looking for care?': 'Où recherchez-vous des soins?',
  'Optional postal code': 'Code postal (facultatif)',
  'I understand': 'Je comprends',
  'Find a family doctor': 'Trouver un médecin de famille',
  'Find a primary care clinic': 'Trouver une clinique de soins primaires',
  'Get help understanding my healthcare options': 'Obtenir de l’aide pour comprendre mes options de soins de santé',
  'Help finding the right type of care': 'Obtenir de l’aide pour trouver le type de soins approprié',
  'Wheelchair access': 'Accès en fauteuil roulant',
  'Interpreter support': 'Services d’interprétation',
  'Large print materials': 'Documents en gros caractères',
  'Quiet visit options': 'Options de consultation dans un environnement calme',
  Phone: 'Téléphone',
  Email: 'Courriel',
  'Text message': 'Message texte',
  'In-person support': 'Soutien en personne',
  English: 'Anglais',
  French: 'Français',
  Mandarin: 'Mandarin',
  Cantonese: 'Cantonais',
  Punjabi: 'Pendjabi',
  Arabic: 'Arabe',
  Other: 'Autre',
  'City / town': 'Ville / localité',
  'Not provided': 'Non indiqué',
  'Postal code': 'Code postal',
  Optional: 'Facultatif',
  Radius: 'Rayon',
  Language: 'Langue',
  'Not selected': 'Aucune sélection',
  'Care need': 'Besoin en matière de soins',
  'Please enter a city or town to continue.': 'Veuillez saisir une ville ou une localité pour continuer.',
  'Please choose the type of care you are looking for.': 'Veuillez choisir le type de soins recherché.',
  'Please confirm that the clinic results are simulated.': 'Veuillez confirmer que les résultats des cliniques sont simulés.',
  'A welcoming community-based clinic with same-day intake support and a strong focus on family-based primary care.':
    'Une clinique communautaire accueillante offrant un soutien à l’admission le jour même et axée sur les soins primaires familiaux.',
  'Good fit for patients seeking a family doctor and a clinic with broader community supports.':
    'Un bon choix pour les personnes qui cherchent un médecin de famille et des services communautaires plus étendus.',
  'Maple Community Health Centre': 'Centre de santé communautaire Maple',
  'East Toronto, Ontario': 'Est de Toronto, Ontario',
  'Harbourview Primary Care': 'Soins primaires Harbourview',
  'Downtown Toronto, Ontario': 'Centre-ville de Toronto, Ontario',
  'Northstar Family Health Clinic': 'Clinique de santé familiale Northstar',
  'Riverside Community Medical Centre': 'Centre médical communautaire Riverside',
  'Helps people understand where to seek care, but cannot guarantee that a clinic will accept them.':
    'Aide les gens à savoir où obtenir des soins, sans toutefois garantir qu’une clinique les acceptera.',
  'May help connect patients with primary care opportunities, but entry requirements can create barriers for people without a family doctor.':
    'Peut aider les patients à accéder à des soins primaires, mais les critères d’admission peuvent constituer un obstacle pour les personnes sans médecin de famille.',
  'Supports electronic referrals, but does not independently solve the initial access problem for unattached patients.':
    'Facilite les aiguillages électroniques, mais ne résout pas à lui seul le problème d’accès initial des personnes sans fournisseur de soins.',
  'Patients can become stuck between navigation, clinic intake, and referral systems. This concept is designed to make the next step clearer without implying a real-time integrated service.':
    'Les patients peuvent se retrouver bloqués entre les services d’orientation, l’admission des cliniques et les systèmes d’aiguillage. Ce concept vise à clarifier la prochaine étape sans laisser entendre qu’il s’agit d’un service intégré en temps réel.',
  'North York, Ontario': 'North York, Ontario',
  'Etobicoke, Ontario': 'Etobicoke, Ontario',
  'New patient registration form': 'Formulaire d’inscription pour les nouveaux patients',
  'Preferred contact method': 'Mode de communication privilégié',
  'Availability check for new openings': 'Vérification des nouvelles places disponibles',
  'Confirm whether intake is open for new patients': 'Confirmer si la clinique accepte de nouveaux patients',
  'Review registration information': 'Examiner les renseignements d’inscription',
  'Receive a follow-up communication from clinic staff': 'Recevoir un suivi du personnel de la clinique',
  'Fictional clinic profile for demonstration purposes only.': 'Profil de clinique fictif, à des fins de démonstration seulement.',
  'A downtown practice offering primary care and preventive services with limited new patient capacity.':
    'Un cabinet du centre-ville offrant des soins primaires et préventifs, avec une capacité limitée pour les nouveaux patients.',
  'Best suited to patients who need a clinic with language support and a smaller caseload.':
    'Convient particulièrement aux personnes qui ont besoin de services linguistiques et d’une clinique ayant une patientèle moins nombreuse.',
  'Brief intake questionnaire': 'Bref questionnaire d’admission',
  'Availability confirmation': 'Confirmation des disponibilités',
  'Language preference noted during registration': 'Préférence linguistique consignée lors de l’inscription',
  'Check current waitlist status': 'Vérifier l’état actuel de la liste d’attente',
  'Complete temporary registration form': 'Remplir le formulaire d’inscription provisoire',
  'Confirm whether a clinician is available for intake': 'Confirmer la disponibilité d’un professionnel de la santé pour l’admission',
  'A family health clinic with multilingual support and broad primary care services for unattached patients.':
    'Une clinique de médecine familiale offrant des services multilingues et une vaste gamme de soins primaires aux personnes sans médecin de famille.',
  'Strong option for families or patients seeking care in a culturally inclusive environment.':
    'Une excellente option pour les familles et les personnes qui cherchent des soins dans un milieu culturellement inclusif.',
  'Initial form and contact preference': 'Formulaire initial et préférence de communication',
  'Translation support if needed': 'Services de traduction au besoin',
  'Current patient capacity check': 'Vérification de la capacité actuelle de la clinique',
  'Review clinic intake timing': 'Vérifier les délais d’admission de la clinique',
  'Confirm preferred language support': 'Confirmer les services offerts dans la langue souhaitée',
  'Receive a simulated clinic response': 'Recevoir une réponse simulée de la clinique',
  'A community medical centre pairing primary care with integrated health and social supports, though currently at limited capacity.':
    'Un centre médical communautaire qui associe les soins primaires à des services intégrés de santé et de soutien social, mais dont la capacité est actuellement limitée.',
  'Useful for patients who want a broader family health environment but may need to try again later.':
    'Utile pour les personnes qui souhaitent bénéficier d’une gamme plus large de services de santé familiale, mais qui devront peut-être réessayer plus tard.',
  'Waitlist enrollment': 'Inscription sur la liste d’attente',
  'Follow-up contact preference': 'Préférence de communication pour le suivi',
  'Availability review': 'Vérification des disponibilités',
  'Check whether a future intake window opens': 'Vérifier si une nouvelle période d’admission sera ouverte',
  'Keep the application on file for later review': 'Conserver la demande au dossier pour un examen ultérieur',
  'Consider other nearby clinics in the meantime': 'Envisager d’autres cliniques à proximité entre-temps',
  'Simulated: Accepting Patients': 'Simulé : accepte des patients',
  'Simulated: Limited Availability': 'Simulé : disponibilités limitées',
  'Simulated: Not Currently Accepting': 'Simulé : n’accepte pas de patients actuellement',
  'Toggle navigation': 'Afficher ou masquer la navigation',
};

const translateText = (text: string, language: Language) => {
  if (language !== 'fr') return text;
  const trimmed = text.trim();
  const translation = frenchText[trimmed];
  return translation ? text.replace(trimmed, translation) : text;
};

function translateTree(node: ReactNode, language: Language): ReactNode {
  if (typeof node === 'string') return translateText(node, language);
  if (Array.isArray(node)) return node.map((child) => translateTree(child, language));
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return cloneElement(node, undefined, translateTree(node.props.children, language));
  }
  return node;
}

const defaultPreferences: Preferences = {
  city: 'Toronto, Ontario',
  postalCode: '',
  radius: 10,
  languages: ['English'],
  accessibility: [],
  communication: [],
  careNeed: 'Find a family doctor',
  acknowledged: false,
};

const languageOptions = ['English', 'French', 'Mandarin', 'Cantonese', 'Punjabi', 'Arabic', 'Other'];
const accessibilityOptions = ['Wheelchair access', 'Interpreter support', 'Large print materials', 'Quiet visit options'];
const communicationOptions = ['Phone', 'Email', 'Text message', 'In-person support'];
const careOptions = [
  'Find a family doctor',
  'Find a primary care clinic',
  'Get help understanding my healthcare options',
  'Help finding the right type of care',
];
const radiusOptions = [5, 10, 25, 50];

const sampleApplication: ApplicationRecord = {
  ref: 'OCB-2026-1042',
  clinic: clinics[0],
  submittedAt: '2026-10-10T09:15:00',
  currentStageIndex: 2,
};

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'track'>('home');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [wizardError, setWizardError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<Clinic[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [submittedApplication, setSubmittedApplication] = useState<ApplicationRecord | null>(null);
  const [viewSampleApplication, setViewSampleApplication] = useState(false);
  const [trackingStageIndex, setTrackingStageIndex] = useState(0);
  const [sampleStageIndex, setSampleStageIndex] = useState(2);

  const t = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.metaDescription);
  }, [language, t.metaDescription]);

  const openSection = (section: SectionId) => {
    setActiveView(section === 'track' ? 'track' : 'home');
    setMobileMenuOpen(false);

    if (section === 'find-care') {
      setWizardOpen(true);
      setWizardStep(1);
      setWizardError('');
      return;
    }

    const targetId = section === 'home' ? 'top' : section;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLanguageToggle = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
  };

  const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const toggleArrayPreference = (field: 'languages' | 'accessibility' | 'communication', option: string) => {
    setPreferences((current) => {
      const currentValues = current[field];
      const nextValues = currentValues.includes(option)
        ? currentValues.filter((entry) => entry !== option)
        : [...currentValues, option];
      return { ...current, [field]: nextValues };
    });
  };

  const validateStep = () => {
    if (wizardStep === 1 && !preferences.city.trim()) {
      setWizardError('Please enter a city or town to continue.');
      return false;
    }
    if (wizardStep === 3 && !preferences.careNeed) {
      setWizardError('Please choose the type of care you are looking for.');
      return false;
    }
    if (wizardStep === 4 && !preferences.acknowledged) {
      setWizardError('Please confirm that the clinic results are simulated.');
      return false;
    }
    setWizardError('');
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep()) return;
    setWizardStep((currentStep) => (Math.min(currentStep + 1, 4) as WizardStep));
  };

  const handlePrevStep = () => {
    setWizardStep((currentStep) => (Math.max(currentStep - 1, 1) as WizardStep));
    setWizardError('');
  };

  const handleFindClinics = () => {
    if (!validateStep()) return;
    setIsSearching(true);
    setWizardError('');

    window.setTimeout(() => {
      const nextMatches = matchClinics(preferences);
      setMatches(nextMatches);
      setSearchPerformed(true);
      setIsSearching(false);
      setWizardStep(4);
    }, 1400);
  };

  const activeApplication = viewSampleApplication ? sampleApplication : submittedApplication ?? sampleApplication;
  const activeTimelineIndex = viewSampleApplication ? sampleStageIndex : submittedApplication ? trackingStageIndex : sampleStageIndex;

  const handleSubmitApplication = (clinic: Clinic) => {
    const referenceNumber = `OCB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApplication: ApplicationRecord = {
      ref: referenceNumber,
      clinic,
      submittedAt: new Date().toISOString(),
      currentStageIndex: 0,
    };

    setSubmittedApplication(newApplication);
    setTrackingStageIndex(0);
    setViewSampleApplication(false);
    setSelectedClinic(null);
    setWizardOpen(false);
    setActiveView('track');
    setTimeout(() => {
      const trackElement = document.getElementById('track');
      trackElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 10);
  };

  const handleCopyReference = async () => {
    const reference = activeApplication.ref;
    try {
      await navigator.clipboard.writeText(reference);
    } catch {
      // Clipboard is optional in this demo.
    }
  };

  const handleAdvanceTimeline = () => {
    const nextStage = Math.min(activeTimelineIndex + 1, timelineStages.length - 1);
    if (viewSampleApplication) {
      setSampleStageIndex(nextStage);
      return;
    }
    setTrackingStageIndex(nextStage);
  };

  const summaryItems = [
    { label: 'City / town', value: preferences.city || 'Not provided' },
    { label: 'Postal code', value: preferences.postalCode || 'Optional' },
    { label: 'Radius', value: `${preferences.radius} km` },
    {
      label: 'Language',
      value: preferences.languages.length
        ? preferences.languages.map((preferenceLanguage) => translateText(preferenceLanguage, language)).join(', ')
        : 'Not selected',
    },
    { label: 'Care need', value: preferences.careNeed },
  ];

  const renderStepContent = () => {
    if (wizardStep === 1) {
      return (
        <div className="space-y-6">
          <div>
            <label htmlFor="city" className="mb-2 block text-sm font-semibold text-slate-800">
              Where are you looking for care?
            </label>
            <input
              id="city"
              value={preferences.city}
              onChange={(event) => updatePreference('city', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              placeholder="Toronto, Ontario"
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="mb-2 block text-sm font-semibold text-slate-800">
              Optional postal code
            </label>
            <input
              id="postalCode"
              value={preferences.postalCode}
              onChange={(event) => updatePreference('postalCode', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm"
              placeholder="M5V 2T6"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Preferred search radius</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {radiusOptions.map((radius) => (
                <button
                  key={radius}
                  type="button"
                  onClick={() => updatePreference('radius', radius)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    preferences.radius === radius
                      ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {radius} km
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (wizardStep === 2) {
      return (
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">What would help you feel comfortable accessing care?</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {languageOptions.map((languageLabel) => (
                <button
                  key={languageLabel}
                  type="button"
                  onClick={() => toggleArrayPreference('languages', languageLabel)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    preferences.languages.includes(languageLabel)
                      ? 'border-teal-600 bg-teal-50 text-teal-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {languageLabel}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Accessibility preferences</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {accessibilityOptions.map((option) => (
                <label key={option} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={preferences.accessibility.includes(option)}
                    onChange={() => toggleArrayPreference('accessibility', option)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Communication preferences</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {communicationOptions.map((option) => (
                <label key={option} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={preferences.communication.includes(option)}
                    onChange={() => toggleArrayPreference('communication', option)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (wizardStep === 3) {
      return (
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">What kind of care are you looking for?</p>
            <div className="space-y-3">
              {careOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updatePreference('careNeed', option)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left transition ${
                    preferences.careNeed === option
                      ? 'border-teal-600 bg-teal-50 text-teal-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{option}</span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">If you are experiencing a medical emergency, call 911.</p>
            <p className="mt-1">For non-emergency health advice in Ontario, contact Health811.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-800">Review your preferences</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {summaryItems.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={preferences.acknowledged}
            onChange={() => updatePreference('acknowledged', !preferences.acknowledged)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span>I understand the clinic results are simulated and do not represent a real appointment or confirmed acceptance.</span>
        </label>

        {searchPerformed && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Potential clinic matches</h3>
              <button
                type="button"
                onClick={() => {
                  setSearchPerformed(false);
                  setMatches([]);
                  setWizardStep(1);
                }}
                className="text-sm font-medium text-teal-700 hover:text-teal-900"
              >
                Modify search
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-lg font-semibold text-slate-800">No matches found</p>
                <p className="mt-2 text-sm text-slate-600">Try widening the search radius or adjusting your language preferences.</p>
                <button
                  type="button"
                  onClick={() => {
                    updatePreference('radius', Math.max(preferences.radius, 50));
                    setSearchPerformed(false);
                    setMatches([]);
                  }}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Expand search radius
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((clinic) => (
                  <div key={clinic.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{clinic.name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1"><MapPin size={14} /> {clinic.location}</span>
                          <span>Approx. {clinic.distance} km away</span>
                        </div>
                        <p className="mt-3 text-sm text-slate-700">{clinic.description}</p>
                      </div>
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        {clinic.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {clinic.languages.map((languageOption) => (
                        <span key={languageOption} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {languageOption}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedClinic(clinic)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmitApplication(clinic)}
                        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                      >
                        Continue With This Clinic
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return translateTree(
    <div id="top" lang={language} className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => openSection('home')}
              className="flex items-center gap-3 text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-soft">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight text-slate-900">Ontario Care Bridge</p>
              </div>
            </button>

            <nav className="hidden items-center gap-6 lg:flex">
              <button type="button" onClick={() => openSection('home')} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                {t.home}
              </button>
              <button type="button" onClick={() => openSection('how-it-works')} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                {t.howItWorks}
              </button>
              <button type="button" onClick={() => openSection('track')} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                {t.trackApplication}
              </button>
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => handleLanguageToggle('en')}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageToggle('fr')}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    language === 'fr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  FR
                </button>
              </div>
              <button
                type="button"
                onClick={() => openSection('find-care')}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-700"
              >
                {t.findCareButton}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="rounded-xl border border-slate-200 p-2 lg:hidden"
              aria-label={translateText('Toggle navigation', language)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="space-y-3 border-t border-slate-200 py-4 lg:hidden">
              <button type="button" onClick={() => openSection('home')} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
                {t.home}
              </button>
              <button type="button" onClick={() => openSection('how-it-works')} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
                {t.howItWorks}
              </button>
              <button type="button" onClick={() => openSection('track')} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
                {t.trackApplication}
              </button>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <span className="text-sm font-medium text-slate-700">Language</span>
                <div className="flex rounded-full border border-slate-200 bg-white p-1">
                  <button type="button" onClick={() => handleLanguageToggle('en')} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${language === 'en' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                    EN
                  </button>
                  <button type="button" onClick={() => handleLanguageToggle('fr')} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${language === 'fr' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>
                    FR
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        {activeView === 'home' ? (
          <>
            <section className="relative overflow-hidden bg-grid">
              <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                      <ShieldCheck className="mr-2 h-4 w-4" /> Simulated service concept
                    </span>
                    <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                      {t.heroHeadline}
                    </h1>
                    <p className="mt-5 max-w-xl text-lg text-slate-600">{t.heroText}</p>
                    <div className="mt-8 flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={() => openSection('find-care')}
                        className="inline-flex items-center rounded-xl bg-teal-600 px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:bg-teal-700"
                      >
                        {t.findCareButton}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openSection('how-it-works')}
                        className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 hover:border-slate-400"
                      >
                        {t.howItWorksButton}
                      </button>
                    </div>
                    <p className="mt-5 text-sm text-slate-500">{t.disclaimer}</p>
                  </div>

                  <div className="relative">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Patient journey</p>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">Demo</span>
                      </div>

                      <div className="mt-6 space-y-4">
                        {['Your Needs', 'Find a Clinic', 'Submit an Application', 'Track Your Status'].map((step, index) => (
                          <div key={step} className="flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? 'bg-teal-100 text-teal-800' : index === 1 ? 'bg-sky-100 text-sky-800' : index === 2 ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                              {step}
                            </div>
                            {index < 3 && <ChevronRight className="h-4 w-4 text-slate-400" />}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-teal-50 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Current status</p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">Searching for a possible next step</p>
                          </div>
                          <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="mt-5 h-2.5 rounded-full bg-slate-200">
                          <div className="h-2.5 w-2/3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Why this matters</p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{t.problemHeadline}</h2>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {[
                  {
                    icon: <Phone className="h-6 w-6" />,
                    title: 'Health811',
                    description: 'Helps people understand where to seek care, but cannot guarantee that a clinic will accept them.',
                  },
                  {
                    icon: <Stethoscope className="h-6 w-6" />,
                    title: 'Central Intake',
                    description: 'May help connect patients with primary care opportunities, but entry requirements can create barriers for people without a family doctor.',
                  },
                  {
                    icon: <FileText className="h-6 w-6" />,
                    title: 'eReferral Ontario',
                    description: 'Supports electronic referrals, but does not independently solve the initial access problem for unattached patients.',
                  },
                ].map((card) => (
                  <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">{card.icon}</div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-900">{card.title}</h3>
                    <p className="mt-3 text-slate-600">{card.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-100 p-6 text-center text-slate-700">
                Patients can become stuck between navigation, clinic intake, and referral systems. This concept is designed to make the next step clearer without implying a real-time integrated service.
              </div>
            </section>

            <section className="bg-slate-900 py-16 text-white">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">The proposed solution</p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight">{t.solutionHeadline}</h2>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                  {[
                    'Less uncertainty about where to go.',
                    'Clearer application progress.',
                    'A more connected patient experience.',
                  ].map((benefit, index) => (
                    <div key={benefit} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-300">
                        {index + 1}
                      </div>
                      <p className="mt-5 text-xl font-semibold text-white">{benefit}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => openSection('find-care')}
                    className="rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    Start the patient journey
                  </button>
                </div>
              </div>
            </section>

            <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Design concept</p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">How It Works</h2>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-4">
                {[
                  { label: 'Patient', icon: <Home className="h-5 w-5" /> },
                  { label: 'Ontario Care Bridge', icon: <Globe2 className="h-5 w-5" /> },
                  { label: 'Existing Healthcare Services', icon: <ShieldCheck className="h-5 w-5" /> },
                  { label: 'Patient Update', icon: <MessageSquare className="h-5 w-5" /> },
                ].map((item, index) => (
                  <div key={item.label} className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">{item.icon}</div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{item.label}</p>
                    {index < 3 && <ArrowRight className="mt-3 h-4 w-4 text-slate-400" />}
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
                <div className="grid gap-8 lg:grid-cols-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Health811</h3>
                    <p className="mt-3 text-slate-600">Starting point for navigation and health advice.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Central Intake</h3>
                    <p className="mt-3 text-slate-600">Potential source of clinic matching and intake information.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">eReferral Ontario</h3>
                    <p className="mt-3 text-slate-600">Potential component of an appropriately authorized referral workflow.</p>
                  </div>
                </div>
                <p className="mt-8 text-base text-slate-700">
                  This is a proposal, not an existing integrated service. Any real implementation would require technical, clinical, legal, privacy, and operational approval.
                </p>
              </div>
            </section>

            <section id="track" className="bg-slate-100 py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Demo tracking</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{t.trackTitle}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setViewSampleApplication(true);
                      setActiveView('track');
                      setTimeout(() => document.getElementById('track')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 10);
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400"
                  >
                    {t.viewSample}
                  </button>
                </div>

                <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-500">Reference number</p>
                      <div className="mt-2 flex items-center gap-3">
                        <p className="text-2xl font-bold text-slate-900">{activeApplication.ref}</p>
                        <button
                          type="button"
                          onClick={handleCopyReference}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          <Clipboard className="h-4 w-4" /> Copy
                        </button>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-sm text-slate-500">Selected clinic</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">{activeApplication.clinic.name}</p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-6">
                    {timelineStages.map((stage, index) => {
                      const isCompleted = index < activeTimelineIndex;
                      const isCurrent = index === activeTimelineIndex;
                      const isUpcoming = index > activeTimelineIndex;

                      return (
                        <div key={stage.title} className="relative pl-10">
                          <div className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white text-xs font-bold shadow-sm ${isCompleted ? 'bg-emerald-100 text-emerald-700' : isCurrent ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                          </div>
                          <div className={`rounded-2xl border p-4 ${isCompleted ? 'border-emerald-200 bg-emerald-50' : isCurrent ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-slate-50'}`}>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-lg font-semibold text-slate-900">{stage.title}</p>
                                <p className="mt-1 text-sm text-slate-600">{stage.description}</p>
                              </div>
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isCompleted ? 'bg-emerald-100 text-emerald-800' : isCurrent ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'}`}>
                                {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
                              </span>
                            </div>
                            {isCompleted && (
                              <p className="mt-3 text-xs uppercase tracking-wide text-emerald-700">
                                Completed: {new Date(activeApplication.submittedAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={handleAdvanceTimeline}
                      className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                      Simulate Next Status
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('home')}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400"
                    >
                      {t.backToHome}
                    </button>
                  </div>

                  <p className="mt-6 text-sm text-slate-500">All statuses are simulated and do not represent real clinic activity or patient care.</p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section id="track" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Application dashboard</p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{t.trackTitle}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView('home')}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  {t.backToHome}
                </button>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Reference number</p>
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-2xl font-bold text-slate-900">{activeApplication.ref}</p>
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    <Clipboard className="h-4 w-4" /> Copy
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                {timelineStages.map((stage, index) => {
                  const isCompleted = index < activeTimelineIndex;
                  const isCurrent = index === activeTimelineIndex;
                  const isUpcoming = index > activeTimelineIndex;

                  return (
                    <div key={stage.title} className="relative pl-10">
                      <div className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white text-xs font-bold shadow-sm ${isCompleted ? 'bg-emerald-100 text-emerald-700' : isCurrent ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                      </div>
                      <div className={`rounded-2xl border p-4 ${isCompleted ? 'border-emerald-200 bg-emerald-50' : isCurrent ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-slate-900">{stage.title}</p>
                            <p className="mt-1 text-sm text-slate-600">{stage.description}</p>
                          </div>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${isCompleted ? 'bg-emerald-100 text-emerald-800' : isCurrent ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'}`}>
                            {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
                          </span>
                        </div>
                        {isCompleted && (
                          <p className="mt-3 text-xs uppercase tracking-wide text-emerald-700">
                            Completed: {new Date(activeApplication.submittedAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleAdvanceTimeline}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Simulate Next Status
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewSampleApplication(true);
                    setSampleStageIndex(2);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  {t.viewSample}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white">
                <HeartPulse className="h-5 w-5" />
              </div>
              <p className="text-lg font-bold text-slate-900">Ontario Care Bridge</p>
            </div>
            <p className="mt-4 text-sm text-slate-600">This is a demonstration concept for helping patients understand their next step toward primary care in Ontario.</p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Explore</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>About Ontario Care Bridge</li>
              <li>How It Works</li>
              <li>Accessibility</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Privacy</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Privacy</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Disclaimer</p>
            <p className="mt-4 text-sm text-slate-600">This site is a demonstration concept and is not connected to Ontario healthcare systems or real service delivery.</p>
          </div>
        </div>
      </footer>

      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Find care</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">Your care search</h3>
              </div>
              <button type="button" onClick={() => setWizardOpen(false)} className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100" aria-label={translateText('Close', language)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  <span>Step {wizardStep} of 4</span>
                  <span>{Math.round((wizardStep / 4) * 100)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400" style={{ width: `${(wizardStep / 4) * 100}%` }} />
                </div>
              </div>

              {isSearching ? (
                <div className="space-y-6 py-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                    <Clock3 className="h-8 w-8 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-slate-900">Reviewing your preferences...</p>
                    <p className="mt-2 text-sm text-slate-600">Checking simulated clinic availability...</p>
                    <p className="mt-1 text-sm text-slate-600">Finding a potential match...</p>
                  </div>
                </div>
              ) : (
                <>
                  {renderStepContent()}
                  {wizardError && <p className="mt-4 text-sm font-medium text-red-600">{wizardError}</p>}
                </>
              )}
            </div>

            {!isSearching && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-between">
                <div className="flex gap-3">
                  {wizardStep > 1 && (
                    <button type="button" onClick={handlePrevStep} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400">
                      Back
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  {wizardStep < 4 && (
                    <button type="button" onClick={handleNextStep} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
                      Continue
                    </button>
                  )}

                  {wizardStep === 4 && !searchPerformed && (
                    <button type="button" onClick={handleFindClinics} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
                      Find Matching Clinics
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Clinic details</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">{selectedClinic.name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedClinic(null)} className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100" aria-label={translateText('Close clinic details', language)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">General location</p>
                  <p className="mt-2 font-semibold text-slate-900">{selectedClinic.location}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Approximate distance</p>
                  <p className="mt-2 font-semibold text-slate-900">{selectedClinic.distance} km</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Supported languages</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedClinic.languages.map((languageOption) => (
                    <span key={languageOption} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{languageOption}</span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Simulated intake requirements</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {selectedClinic.intakeRequirements.map((item) => (
                    <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-600" />{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Illustrative next steps</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {selectedClinic.nextSteps.map((item) => (
                    <li key={item} className="flex gap-2"><ArrowRight className="mt-0.5 h-4 w-4 text-slate-500" />{item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                This is a fictional clinic profile used for the prototype. It does not represent a real appointment or confirmed acceptance.
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmitApplication(selectedClinic)}
                  className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  Submit Demo Application
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClinic(null)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    language,
  );
}

export default App;
