import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactNode } from 'react';
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

type CallAssistantStep = 'prep' | 'demo' | 'result';
type CallMode = 'assistant' | 'prepare' | 'self' | 'online';
type WorkflowHistoryState = {
  ocbFlow?: 'find-care' | 'clinic-details' | 'call';
  clinicId?: string;
  wizardStep?: WizardStep;
};

type DemoCallOutcome = {
  id: string;
  status: string;
  summary: string;
  nextStep: string;
  accepting: boolean;
  requiresIntake: boolean;
  appointmentConfirmed: boolean;
};

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

const beforeAfterWorkflow = [
  {
    title: 'Before Ontario Care Bridge',
    items: [
      'A patient may need to search multiple clinic lists and phone numbers.',
      'Clinic availability information can be hard to verify and may be outdated.',
      'Eligibility and intake requirements can create extra friction before a first call.',
      'Patients may not know whether they need an online form, a voicemail, or a direct phone call.',
      'The next step can be unclear when a clinic is not clearly accepting new patients.',
    ],
  },
  {
    title: 'After Ontario Care Bridge',
    items: [
      'Patients can compare clinic match criteria such as location, language, and intake process.',
      'Ontario Care Bridge can highlight verified contact options and clarify whether a call is required.',
      'The AI Clinic Calling Assistant can help communicate an approved request to a clinic.',
      'A human coordinator or patient can review the clinic response before taking the next step.',
      'Patients receive a clearer summary of what the clinic said and what to do next.',
    ],
  },
] as const;

const impactCards = [
  {
    title: 'For patients',
    items: [
      'Clearer next steps when a clinic requires a phone inquiry.',
      'A lower-friction way to understand clinic intake and contact requirements.',
      'A more informed process before making a call or completing an intake form.',
    ],
  },
  {
    title: 'For clinic teams',
    items: [
      'A more structured way to receive patient inquiries and triage new-patient requests.',
      'Helpful context for intake questions and communication preferences.',
      'A clearer administrative summary that reduces repeated back-and-forth.',
    ],
  },
  {
    title: 'For the healthcare system',
    items: [
      'Better visibility into which clinics are accepting new patients or requiring online intake.',
      'Less avoidable confusion around access pathways and next steps.',
      'A more transparent model for coordinating patient communication without overpromising care access.',
    ],
  },
] as const;

const translations = {
  en: {
    metaDescription:
      'Ontario Care Bridge is a demonstration concept for helping people in Ontario who do not have a family doctor identify clinic matches and next steps.',
    home: 'Home',
    howItWorks: 'How It Works',
    trackApplication: 'Track Application',
    findCareButton: 'Find Care Near Me',
    howItWorksButton: 'How It Works',
    heroHeadline: 'No family doctor? Let’s help you find your next step.',
    heroText:
      'Ontario residents without a family doctor may need help identifying clinics that are accepting new patients and meeting their location, language, and intake needs. Ontario Care Bridge is a proposed coordination platform that helps patients compare clinic matches and understand their next steps, including where an AI Clinic Calling Assistant may help.',
    disclaimer: 'Clinic information, availability, and application statuses are simulated for this demonstration.',
    problemHeadline: 'Many unattached patients need a clearer way to identify suitable clinics and understand what a clinic requires before they make contact.',
    solutionHeadline: 'Ontario Care Bridge helps patients compare clinic matches and coordinate an AI-assisted administrative contact when appropriate.',
    sectionTitle: 'How it works',
    trackTitle: 'Track your application',
    viewSample: 'View Sample Application',
    backToHome: 'Return to Home',
  },
  fr: {
    metaDescription:
      'Ontario Care Bridge est un concept de démonstration qui aide les personnes de l’Ontario sans médecin de famille à trouver des cliniques possibles et les prochaines étapes.',
    home: 'Accueil',
    howItWorks: 'Comment ça fonctionne',
    trackApplication: 'Suivi de la demande',
    findCareButton: 'Trouver des soins près de chez moi',
    howItWorksButton: 'Comment ça fonctionne',
    heroHeadline: 'Pas de médecin de famille? Aidons-vous à trouver votre prochaine étape.',
    heroText:
      'Les résidents de l’Ontario qui n’ont pas de médecin de famille peuvent avoir besoin d’aide pour repérer les cliniques qui acceptent de nouveaux patients et répondent à leurs besoins de localisation, de langue et d’admission. Ontario Care Bridge est une plateforme de coordination proposée qui aide les patients à comparer les cliniques et à comprendre les prochaines étapes, y compris quand l’assistant d’appel AI Clinic Calling peut être utile.',
    disclaimer: 'Les informations sur les cliniques, leur disponibilité et l’état des demandes sont simulées pour cette démonstration.',
    problemHeadline: 'De nombreux patients sans médecin de famille ont besoin d’un meilleur moyen de repérer les cliniques adaptées et de comprendre ce qu’une clinique exige avant de communiquer.',
    solutionHeadline: 'Ontario Care Bridge aide les patients à comparer les cliniques et à coordonner un contact administratif assisté par l’IA quand cela est approprié.',
    sectionTitle: 'Comment ça fonctionne',
    trackTitle: 'Suivez votre demande',
    viewSample: 'Voir un exemple de demande',
    backToHome: 'Retour à l’accueil',
  },
} as const;

const callAssistantTranslations = {
  en: {
    title: 'Would you like us to contact this clinic for you?',
    description: 'For clinics where telephone contact is appropriate, try a simulated administrative call using only the information you approve. No real call is placed.',
    contactForMe: 'Try a simulated AI call',
    prepareForCall: 'Help me prepare for a call',
    contactMyself: "I'll contact the clinic myself",
    continueOnline: 'Continue online',
    purpose: 'Purpose of the call',
    preferredLanguage: 'Preferred language',
    languageForCall: 'Language selected for the call',
    patientInfo: 'Patient-approved information to share',
    questions: 'Questions you want the assistant to ask',
    preferredContact: 'Preferred way for the clinic to contact the patient',
    consent: 'I understand this demo will simulate a clinic interaction using the approved information above. No real call or information-sharing will occur.',
    startDemoCall: 'Start demo call',
    clinicPhone: 'Simulated clinic telephone number',
    callInProgress: 'Simulated call in progress',
    preparingCall: 'Preparing simulated call',
    awaitingConsent: 'Awaiting consent',
    callCompleted: 'Call completed',
    callFailed: 'Call failed',
    notAccepting: 'Clinic not accepting new patients',
    onlineIntakeRequired: 'Online intake required',
    followUpRequired: 'Patient follow-up required',
    noAnswer: 'No answer',
    appointmentConfirmed: 'Appointment explicitly confirmed by the simulated clinic',
    backToResults: 'Return to clinic results',
    prepareAnother: 'Prepare another demo call',
    contactDetails: 'Clinic contact details',
    phoneMenuTitle: 'Demo phone menu',
    phoneMenu1: 'Press 1 for appointments.',
    phoneMenu2: 'Press 2 for new patients.',
    phoneMenu3: 'Press 3 to repeat these options.',
    demoIntro: 'Simulation: An AI assistant would ask whether the clinic is accepting new patients and what intake process to follow. No call is being placed.',
    consentButton: 'I agree to this simulated call',
    ready: 'Ready to begin',
    close: 'Close',
    simulatedOnly: 'This is a simulation only. No real call will be placed, and no appointment or clinic acceptance is confirmed.',
    noRealCall: 'No call is placed from this screen. Use the clinic number only if you choose to contact the clinic yourself.',
    callNotes: 'Call preparation notes',
    phoneNumber: 'Simulated clinic phone number',
    consentRequired: 'Review the information and provide consent before starting the simulated call.',
    callPurpose: 'Ask whether the clinic is accepting new patients and learn the next intake step.',
    acceptingStatus: 'The simulated clinic is accepting new-patient inquiries.',
    acceptingSummary: 'The clinic menu directed the inquiry to new-patient intake. In this simulation, the clinic is accepting inquiries and asks the patient to complete an intake form.',
    acceptingNextStep: 'Review and complete the clinic intake form, then wait for clinic staff to confirm any follow-up.',
    limitedStatus: 'The simulated clinic requires online intake.',
    limitedSummary: 'The clinic menu directed the inquiry to new-patient intake. In this simulation, the clinic asks the patient to complete an online form before reviewing availability.',
    limitedNextStep: 'Complete the online intake form and wait for the clinic to review the request.',
    notAcceptingStatus: 'The simulated clinic is not accepting new patients.',
    notAcceptingSummary: 'The clinic menu directed the inquiry to new-patient intake. In this simulation, the clinic is not currently accepting new patients.',
    notAcceptingNextStep: 'Continue comparing other clinic options or check back with this clinic later.',
    appointmentStatus: 'A demo appointment was confirmed by the simulated clinic.',
    appointmentSummary: 'The clinic menu directed the inquiry to appointments. In this simulation, a sample appointment slot was confirmed; this is not a real booking.',
    appointmentNextStep: 'In a real service, confirm the appointment details directly with the clinic.',
    appointmentMenu: 'Press 1 for appointments.',
    newPatientMenu: 'Press 2 for new patients.',
    repeatMenu: 'Press 3 to repeat these options.',
    menuPrompt: 'Choose an option to interact with the simulated phone menu.',
    selectedOption: 'You selected',
    contactBlocked: 'This clinic does not accept automated calls. You can use its online option, if available, or contact the clinic yourself.',
    contactMethodUnknown: 'The clinic contact method is not confirmed. This simulation will not place a call.',
    nextStep: 'Next step',
    approvedDetails: 'Name, service area, preferred language, and contact preference approved by the patient.',
    sampleQuestions: 'Are you accepting new patients? Is there an intake form or waitlist? What is the next step?',
    preferredContactDefault: 'Phone or email follow-up from clinic staff after review.',
    onlineBookingTitle: 'Simulated online intake',
    onlineBookingDescription: 'This fictional clinic offers a digital intake option. This demo does not open a clinic website or submit information.',
    completeDemoIntake: 'Show simulated intake result',
    onlineBookingStatus: 'Simulated online intake step completed.',
    onlineBookingSummary: 'The clinic’s digital intake option is represented in this demo only. No patient information was submitted and no booking was made.',
    onlineBookingNextStep: 'For a real service, use the clinic’s verified website or contact the clinic directly.',
  },
  fr: {
    title: 'Souhaitez-vous que nous contactions cette clinique pour vous?',
    description: 'Pour les cliniques où le contact téléphonique est approprié, essayez un appel administratif simulé en utilisant uniquement les renseignements que vous approuvez. Aucun véritable appel n’est effectué.',
    contactForMe: 'Essayer un appel IA simulé',
    prepareForCall: 'Aidez-moi à préparer un appel',
    contactMyself: 'Je contacterai la clinique moi-même',
    continueOnline: 'Continuer en ligne',
    purpose: 'Objet de l’appel',
    preferredLanguage: 'Langue préférée',
    languageForCall: 'Langue sélectionnée pour l’appel',
    patientInfo: 'Renseignements approuvés par le patient à partager',
    questions: 'Questions que vous souhaitez que l’assistant pose',
    preferredContact: 'Méthode privilégié pour que la clinique contacte le patient',
    consent: 'Je comprends que cette démonstration simulera une interaction avec la clinique à partir des renseignements approuvés ci-dessus. Aucun véritable appel ni partage de renseignements n’aura lieu.',
    startDemoCall: 'Démarrer l’appel de démonstration',
    clinicPhone: 'Numéro de téléphone fictif de la clinique',
    callInProgress: 'Appel simulé en cours',
    preparingCall: 'Préparation de l’appel simulé',
    awaitingConsent: 'En attente du consentement',
    callCompleted: 'Appel terminé',
    callFailed: 'Appel échoué',
    notAccepting: 'La clinique n’accepte pas de nouveaux patients',
    onlineIntakeRequired: 'Demande d’admission en ligne requise',
    followUpRequired: 'Suivi requis par le patient',
    noAnswer: 'Aucune réponse',
    appointmentConfirmed: 'Rendez-vous explicitement confirmé par la clinique simulée',
    backToResults: 'Retour aux résultats de la clinique',
    prepareAnother: 'Préparer un autre appel de démonstration',
    contactDetails: 'Coordonnées de la clinique',
    phoneMenuTitle: 'Menu téléphonique de démonstration',
    phoneMenu1: 'Appuyez sur 1 pour les rendez-vous.',
    phoneMenu2: 'Appuyez sur 2 pour les nouveaux patients.',
    phoneMenu3: 'Appuyez sur 3 pour répéter ces options.',
    demoIntro: 'Simulation : un assistant IA demanderait si la clinique accepte de nouveaux patients et quelle est la procédure d’admission. Aucun appel n’est effectué.',
    consentButton: 'J’accepte cet appel simulé',
    ready: 'Prêt à commencer',
    close: 'Fermer',
    simulatedOnly: 'Il s’agit uniquement d’une simulation. Aucun véritable appel ne sera effectué et aucun rendez-vous ni aucune acceptation par la clinique ne sont confirmés.',
    noRealCall: 'Aucun appel n’est effectué à partir de cet écran. Utilisez le numéro de la clinique seulement si vous choisissez de la contacter vous-même.',
    callNotes: 'Notes de préparation à l’appel',
    phoneNumber: 'Numéro de téléphone fictif de la clinique',
    consentRequired: 'Vérifiez les renseignements et donnez votre consentement avant de commencer l’appel simulé.',
    callPurpose: 'Demander si la clinique accepte de nouveaux patients et connaître la prochaine étape d’admission.',
    acceptingStatus: 'La clinique simulée accepte les demandes de nouveaux patients.',
    acceptingSummary: 'Le menu de la clinique a dirigé la demande vers l’admission des nouveaux patients. Dans cette simulation, la clinique accepte les demandes et demande au patient de remplir un formulaire d’admission.',
    acceptingNextStep: 'Consultez et remplissez le formulaire d’admission de la clinique, puis attendez que le personnel confirme le suivi.',
    limitedStatus: 'La clinique simulée exige une demande d’admission en ligne.',
    limitedSummary: 'Le menu de la clinique a dirigé la demande vers l’admission des nouveaux patients. Dans cette simulation, la clinique demande au patient de remplir un formulaire en ligne avant d’examiner les disponibilités.',
    limitedNextStep: 'Remplissez le formulaire d’admission en ligne et attendez que la clinique examine la demande.',
    notAcceptingStatus: 'La clinique simulée n’accepte pas de nouveaux patients.',
    notAcceptingSummary: 'Le menu de la clinique a dirigé la demande vers l’admission des nouveaux patients. Dans cette simulation, la clinique n’accepte pas actuellement de nouveaux patients.',
    notAcceptingNextStep: 'Continuez à comparer d’autres cliniques ou vérifiez plus tard si la situation a changé.',
    appointmentStatus: 'Un rendez-vous de démonstration a été confirmé par la clinique simulée.',
    appointmentSummary: 'Le menu de la clinique a dirigé la demande vers les rendez-vous. Dans cette simulation, un créneau d’exemple a été confirmé; il ne s’agit pas d’une véritable réservation.',
    appointmentNextStep: 'Dans un service réel, confirmez les détails du rendez-vous directement auprès de la clinique.',
    appointmentMenu: 'Appuyez sur 1 pour les rendez-vous.',
    newPatientMenu: 'Appuyez sur 2 pour les nouveaux patients.',
    repeatMenu: 'Appuyez sur 3 pour répéter ces options.',
    menuPrompt: 'Choisissez une option pour interagir avec le menu téléphonique simulé.',
    selectedOption: 'Vous avez choisi',
    contactBlocked: 'Cette clinique n’accepte pas les appels automatisés. Vous pouvez utiliser son option en ligne, si elle est offerte, ou contacter la clinique vous-même.',
    contactMethodUnknown: 'La méthode de contact de la clinique n’est pas confirmée. Cette simulation ne fera aucun appel.',
    nextStep: 'Prochaine étape',
    approvedDetails: 'Nom, secteur de service, langue préférée et mode de communication approuvés par le patient.',
    sampleQuestions: 'Acceptez-vous de nouveaux patients? Y a-t-il un formulaire d’admission ou une liste d’attente? Quelle est la prochaine étape?',
    preferredContactDefault: 'Suivi par téléphone ou par courriel du personnel de la clinique après examen.',
    onlineBookingTitle: 'Admission en ligne simulée',
    onlineBookingDescription: 'Cette clinique fictive offre une option d’admission numérique. Cette démonstration n’ouvre aucun site Web de clinique et ne transmet aucun renseignement.',
    completeDemoIntake: 'Afficher le résultat d’admission simulé',
    onlineBookingStatus: 'Étape d’admission en ligne simulée terminée.',
    onlineBookingSummary: 'L’option d’admission numérique de la clinique est représentée uniquement dans cette démonstration. Aucun renseignement sur le patient n’a été transmis et aucune réservation n’a été faite.',
    onlineBookingNextStep: 'Pour un service réel, utilisez le site Web vérifié de la clinique ou contactez-la directement.',
  },
} as const;

const frenchText: Record<string, string> = {
  'Simulated service concept': 'Concept de service simulé',
  'Patient journey': 'Parcours du patient',
  'Your Needs': 'Vos besoins',
  'Find a Clinic': 'Trouver une clinique',
  'Submit an Application': 'Soumettre une demande',
  'Track Your Status': 'Suivre votre demande',
  'Current status': 'Statut actuel',
  'Searching for a possible next step': 'Recherche d’une prochaine étape possible',
  'Why this matters': 'Pourquoi est-ce important',
  'The proposed solution': 'La solution proposée',
  'Before Ontario Care Bridge': 'Avant Ontario Care Bridge',
  'After Ontario Care Bridge': 'Après Ontario Care Bridge',
  'A patient needs ongoing primary care.': 'Un patient a besoin de soins primaires continus.',
  'Clinic availability information may be fragmented or outdated.': 'Les informations sur la disponibilité des cliniques peuvent être fragmentées ou périmées.',
  'Eligibility and intake requirements must be checked manually.': 'Les critères d’admissibilité et les exigences d’admission doivent être vérifiés manuellement.',
  'Coordinators may re-enter information repeatedly.': 'Les coordonnateurs peuvent devoir saisir à nouveau les informations à plusieurs reprises.',
  'A suitable opening can be hard to connect to the right patient.': 'Il peut être difficile de relier une place disponible au bon patient.',
  'Authorized systems share attachment requirements and clinic capacity information.': 'Des systèmes autorisés partagent les exigences d’attachement et les informations sur la capacité des cliniques.',
  'The middleware identifies potential matches using location, eligibility, language and other approved criteria.': 'Le middleware identifie des correspondances potentielles selon l’emplacement, l’admissibilité, la langue et d’autres critères approuvés.',
  'Standardized intake packages are prepared using authorized patient information.': 'Des dossiers d’admission standardisés sont préparés à partir des renseignements autorisés sur le patient.',
  'A human coordinator reviews the match and approves, rejects, or requests changes.': 'Un coordonnateur humain examine la correspondance et approuve, refuse ou demande des changements.',
  'Approved cases progress through the existing OHT attachment workflow.': 'Les cas approuvés passent par le processus d’attachement existant de l’OHT.',
  'Intended benefits and pilot indicators': 'Bénéfices attendus et indicateurs pilotes',
  'For patients': 'Pour les patients',
  'For OHT coordinators and clinics': 'Pour les coordonnateurs OHT et les cliniques',
  'For the healthcare system': 'Pour le système de santé',
  'Fewer dead ends when searching for ongoing primary care.': 'Moins de faux départs lorsqu’on cherche des soins primaires continus.',
  'Clearer next steps and status visibility.': 'Des étapes suivantes et un suivi plus clairs.',
  'Better chances to connect suitable patients with relevant clinic openings.': 'De meilleures chances de relier les bons patients aux places disponibles dans les cliniques appropriées.',
  'Less repetitive data entry and fewer manual handoffs.': 'Moins de saisie répétée et moins de transferts manuels.',
  'More standardized intake packages.': 'Des dossiers d’admission plus standardisés.',
  'Better visibility into potential patient-clinic matches and review status.': 'Une meilleure visibilité sur les correspondances potentielles et l’état de l’examen.',
  'Better coordination of existing capacity and attachment pathways.': 'Une meilleure coordination des places disponibles et des parcours d’attachement.',
  'Improved measurement of the attachment process.': 'Une meilleure mesure du processus d’attachement.',
  'Potential reduction in avoidable administrative friction and some inappropriate reliance on emergency services.': 'Réduction possible des frictions administratives évitables et d’une utilisation inappropriée des services d’urgence.',
  'Less uncertainty about where to go.': 'Moins d’incertitude sur l’endroit où aller.',
  'Clearer application progress.': 'Un suivi plus clair de la demande.',
  'A more connected patient experience.': 'Une expérience de soins mieux coordonnée.',
  'Start the patient journey': 'Commencer le parcours de soins',
  'Design concept': 'Concept de conception',
  'Pilot measures': 'Mesures pilotes',
  'Expected impact': 'Impact attendu',
  'Time required to prepare an intake package.': 'Temps requis pour préparer un dossier d’admission.',
  'Percentage of suggested matches judged appropriate by coordinators.': 'Pourcentage de correspondances suggérées jugées appropriées par les coordonnateurs.',
  'Percentage of reviewed cases progressing to the next intake stage.': 'Pourcentage de cas examinés qui passent à l’étape suivante de l’admission.',
  'Rate of incomplete intake packages.': 'Taux de dossiers d’admission incomplets.',
  'Time between identifying a potential match and coordinator review.': 'Temps entre l’identification d’une correspondance potentielle et l’examen par le coordonnateur.',
  'Patient understanding of the next step.': 'Compréhension par le patient de la prochaine étape.',
  'Where are you looking for care?': 'Où cherchez-vous des soins ?',
  'Optional postal code': 'Code postal facultatif',
  'Preferred search radius': 'Rayon de recherche préféré',
  'What would help you feel comfortable accessing care?': 'Qu’est-ce qui vous aiderait à vous sentir à l’aise pour accéder aux soins ?',
  'Accessibility preferences': 'Préférences d’accessibilité',
  'Communication preferences': 'Préférences de communication',
  'What kind of care are you looking for?': 'Quel type de soins recherchez-vous ?',
  'Review your preferences': 'Vérifiez vos préférences',
  'Potential clinic matches': 'Cliniques potentiellement correspondantes',
  'Modify search': 'Modifier la recherche',
  'No matches found': 'Aucune correspondance trouvée',
  'Try widening the search radius or adjusting your language preferences.': 'Essayez d’élargir le rayon de recherche ou de modifier vos préférences linguistiques.',
  'Expand search radius': 'Élargir le rayon de recherche',
  'View Details': 'Voir les détails',
  'Select this clinic': 'Sélectionner cette clinique',
  'Back to matching results': 'Retour aux résultats des cliniques',
  'Back to Find Care': 'Retour à la recherche de soins',
  'Exit clinic details': 'Quitter les détails de la clinique',
  'Close Find Care': 'Fermer la recherche de soins',
  'Patient application': 'Demande du patient',
  'For your security, the clinic details could not be restored. Return to the matching results and select a clinic again.': 'Pour votre sécurité, les détails de la clinique n’ont pas pu être restaurés. Retournez aux résultats et sélectionnez une clinique de nouveau.',
  'Service area': 'Secteur de service',
  'Source': 'Source',
  'Eligibility notes': 'Notes d’admissibilité',
  'I understand the clinic results are simulated and do not represent a real appointment or confirmed acceptance.': 'Je comprends que les résultats des cliniques sont simulés et ne représentent ni un rendez-vous réel ni une acceptation confirmée.',
  'If you are experiencing a medical emergency, call 911.': 'Si vous êtes confronté à une urgence médicale, appelez le 911.',
  'For non-emergency health advice in Ontario, contact Health811.': 'Pour des conseils de santé non urgents en Ontario, communiquez avec Health811.',
  'This is a proposal, not an existing integrated service. Any real implementation would require technical, clinical, legal, privacy, and operational approval.': 'Il s’agit d’une proposition, pas d’un service intégré existant. Toute mise en œuvre réelle nécessiterait une approbation technique, clinique, juridique, en matière de protection de la vie privée et opérationnelle.',
  'All statuses are simulated and do not represent real clinic activity or patient care.': 'Tous les statuts sont simulés et ne représentent pas l’activité réelle d’une clinique ni des soins aux patients.',
  'Potential Clinic Match Found': 'Une clinique correspondante a été trouvée',
  'Awaiting Clinic Contact': 'En attente d’un contact de la clinique',
  'Next Steps Available': 'Prochaines étapes disponibles',
  'Application Submitted': 'Demande soumise',
  'Clinic Matching': 'Recherche de cliniques correspondantes',
  'We are checking which fictional clinics may be a potential fit.': 'Nous vérifions quelles cliniques fictives pourraient vous convenir.',
  'A clinic match has been identified and is ready for follow-up.': 'Une clinique correspondante a été repérée et un suivi peut être effectué.',
  'The system is waiting for a clinic response in this demonstration.': 'Dans cette démonstration, le système attend une réponse de la clinique.',
  'Your next step would be to confirm intake details and documentation requirements.': 'La prochaine étape consisterait à confirmer les détails de l’admission et les documents requis.',
  'Current': 'En cours',
  'Upcoming': 'À venir',
  'Completed': 'Terminé',
  'Completed:': 'Terminé :',
  'How It Works': 'Comment ça fonctionne',
  'Patient Update': 'Mise à jour au patient',
  'Clinic matching': 'Jumelage avec des cliniques',
  'Compare fictional clinics by location, language, eligibility, and intake requirements.': 'Comparez des cliniques fictives selon l’emplacement, la langue, l’admissibilité et les exigences d’admission.',
  'Contact options': 'Options de communication',
  'See whether a clinic offers online booking, telephone contact, or both.': 'Vérifiez si une clinique offre la prise de rendez-vous en ligne, le contact téléphonique ou les deux.',
  'Clear next steps': 'Prochaines étapes claires',
  'Review simulated clinic responses and decide how to proceed. No real calls or appointments are made.': 'Examinez les réponses simulées des cliniques et décidez de la suite. Aucun véritable appel ni rendez-vous n’est effectué.',
  'Ontario Care Bridge is a demonstration concept. Clinic information and availability are fictional and are not connected to real healthcare systems.': 'Ontario Care Bridge est un concept de démonstration. Les renseignements et les disponibilités des cliniques sont fictifs et ne sont pas liés aux systèmes de santé réels.',
  'Simulated communication': 'Communication simulée',
  'AI Clinic Calling Assistant': 'Assistant IA d’appel aux cliniques',
  'Review the clinic, choose what information may be shared, and provide explicit consent before exploring a simulated phone menu.': 'Examinez la clinique, choisissez les renseignements pouvant être partagés et donnez votre consentement explicite avant d’explorer un menu téléphonique simulé.',
  'The demo never places real calls, submits patient information, books appointments, or confirms clinic availability. Clinics that block automated calls will not offer the assistant.': 'La démonstration ne fait jamais de véritables appels, ne transmet pas de renseignements sur les patients, ne prend pas de rendez-vous et ne confirme pas les disponibilités des cliniques. L’assistant n’est pas offert pour les cliniques qui bloquent les appels automatisés.',
  'Demo tracking': 'Suivi de démonstration',
  'Reference number': 'Numéro de référence',
  'Selected clinic': 'Clinique sélectionnée',
  'Your demo application has been created and is ready for review.': 'Votre demande de démonstration a été créée et est prête à être examinée.',
  'Simulate Next Status': 'Simuler le prochain statut',
  'Application dashboard': 'Tableau de bord des demandes',
  'This is a demonstration concept for helping patients understand their next step toward primary care in Ontario.': 'Ce concept de démonstration aide les patients à comprendre la prochaine étape vers des soins primaires en Ontario.',
  'About Ontario Care Bridge': 'À propos d’Ontario Care Bridge',
  'This site is a demonstration concept and is not connected to Ontario healthcare systems or real service delivery.': 'Ce site est un concept de démonstration qui n’est lié ni aux systèmes de santé de l’Ontario ni à la prestation réelle de services.',
  'Find care': 'Trouver des soins',
  'Your care search': 'Recherche de soins',
  'of 4': 'sur 4',
  'Reviewing your preferences...': 'Examen de vos préférences...',
  'Checking simulated clinic availability...': 'Vérification des disponibilités simulées des cliniques...',
  'Finding a potential match...': 'Recherche d’une correspondance possible...',
  'Find Matching Clinics': 'Trouver des cliniques correspondantes',
  'Clinic details': 'Détails de la clinique',
  'Close clinic details': 'Fermer les détails de la clinique',
  'General location': 'Emplacement général',
  'Approximate distance': 'Distance approximative',
  'Supported languages': 'Langues offertes',
  'Simulated intake requirements': 'Conditions d’admission simulées',
  'Illustrative next steps': 'Prochaines étapes proposées',
  'This is a fictional clinic profile used for the prototype. It does not represent a real appointment or confirmed acceptance.': 'Ce profil de clinique est fictif et sert au prototype. Il ne représente ni un véritable rendez-vous ni une acceptation confirmée.',
  'Submit Demo Application': 'Soumettre une demande de démonstration',
  'Approx.': 'À environ',
  'km away': 'km de distance',
  'I understand': 'Je comprends',
  'Find a family doctor': 'Trouver un médecin de famille',
  'Find a primary care clinic': 'Trouver une clinique de soins primaires',
  'Get help understanding my healthcare options': 'Obtenir de l’aide pour comprendre mes options de soins de santé',
  'Help finding the right type of care': 'Obtenir de l’aide pour trouver le type de soins approprié',
  'Wheelchair access': 'Accès en fauteuil roulant',
  'Interpreter support': 'Services d’interprétation',
  'Large print materials': 'Documents en gros caractères',
  'Quiet visit options': 'Options de consultation dans un environnement calme',
  'Text message': 'Message texte',
  'In-person support': 'Soutien en personne',
  'City / town': 'Ville / localité',
  'Not provided': 'Non indiqué',
  'Postal code': 'Code postal',
  'Not selected': 'Aucune sélection',
  'Care need': 'Besoin en matière de soins',
  'Please enter a city or town to continue.': 'Veuillez saisir une ville ou une localité pour continuer.',
  'Please choose the type of care you are looking for.': 'Veuillez choisir le type de soins recherché.',
  'Please confirm that the clinic results are simulated.': 'Veuillez confirmer que les résultats des cliniques sont simulés.',
  'A welcoming community-based clinic with same-day intake support and a strong focus on family-based primary care.': 'Une clinique communautaire accueillante offrant un soutien à l’admission le jour même et axée sur les soins primaires familiaux.',
  'Good fit for patients seeking a family doctor and a clinic with broader community supports.': 'Un bon choix pour les personnes qui cherchent un médecin de famille et des services communautaires plus étendus.',
  'Maple Community Health Centre': 'Centre de santé communautaire Maple',
  'East Toronto, Ontario': 'Est de Toronto, Ontario',
  'Harbourview Primary Care': 'Soins primaires Harbourview',
  'Downtown Toronto, Ontario': 'Centre-ville de Toronto, Ontario',
  'Northstar Family Health Clinic': 'Clinique de santé familiale Northstar',
  'Riverside Community Medical Centre': 'Centre médical communautaire Riverside',
  'North York, Ontario': 'North York, Ontario',
  'Etobicoke, Ontario': 'Etobicoke, Ontario',
  'New patient registration form': 'Formulaire d’inscription pour les nouveaux patients',
  'Preferred contact method': 'Mode de communication privilégié',
  'Availability check for new openings': 'Vérification des nouvelles places disponibles',
  'Confirm whether intake is open for new patients': 'Confirmer si la clinique accepte de nouveaux patients',
  'Review registration information': 'Examiner les renseignements d’inscription',
  'Receive a follow-up communication from clinic staff': 'Recevoir un suivi du personnel de la clinique',
  'Fictional clinic profile for demonstration purposes only.': 'Profil de clinique fictif, à des fins de démonstration seulement.',
  'A downtown practice offering primary care and preventive services with limited new patient capacity.': 'Un cabinet du centre-ville offrant des soins primaires et préventifs, avec une capacité limitée pour les nouveaux patients.',
  'Best suited to patients who need a clinic with language support and a smaller caseload.': 'Convient particulièrement aux personnes qui ont besoin de services linguistiques et d’une clinique ayant une patientèle moins nombreuse.',
  'Brief intake questionnaire': 'Bref questionnaire d’admission',
  'Availability confirmation': 'Confirmation des disponibilités',
  'Language preference noted during registration': 'Préférence linguistique consignée lors de l’inscription',
  'Check current waitlist status': 'Vérifier l’état actuel de la liste d’attente',
  'Complete temporary registration form': 'Remplir le formulaire d’inscription provisoire',
  'Confirm whether a clinician is available for intake': 'Confirmer la disponibilité d’un professionnel de la santé pour l’admission',
  'A family health clinic with multilingual support and broad primary care services for unattached patients.': 'Une clinique de médecine familiale offrant des services multilingues et une vaste gamme de soins primaires aux personnes sans médecin de famille.',
  'Strong option for families or patients seeking care in a culturally inclusive environment.': 'Une excellente option pour les familles et les personnes qui cherchent des soins dans un milieu culturellement inclusif.',
  'Initial form and contact preference': 'Formulaire initial et préférence de communication',
  'Translation support if needed': 'Services de traduction au besoin',
  'Current patient capacity check': 'Vérification de la capacité actuelle de la clinique',
  'Review clinic intake timing': 'Vérifier les délais d’admission de la clinique',
  'Confirm preferred language support': 'Confirmer les services offerts dans la langue souhaitée',
  'Receive a simulated clinic response': 'Recevoir une réponse simulée de la clinique',
  'A community medical centre pairing primary care with integrated health and social supports, though currently at limited capacity.': 'Un centre médical communautaire qui associe les soins primaires à des services intégrés de santé et de soutien social, mais dont la capacité est actuellement limitée.',
  'Useful for patients who want a broader family health environment but may need to try again later.': 'Utile pour les personnes qui souhaitent bénéficier d’une gamme plus large de services de santé familiale, mais qui devront peut-être réessayer plus tard.',
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
  if (Array.isArray(node)) return Children.map(node, (child) => translateTree(child, language));
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
  const returnToFormAfterBackRef = useRef(false);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [wizardError, setWizardError] = useState('');
  const [workflowError, setWorkflowError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState<Clinic[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinicDetailsOpen, setClinicDetailsOpen] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<ApplicationRecord | null>(null);
  const [viewSampleApplication, setViewSampleApplication] = useState(false);
  const [trackingStageIndex, setTrackingStageIndex] = useState(0);
  const [sampleStageIndex, setSampleStageIndex] = useState(2);
  const [callAssistantOpen, setCallAssistantOpen] = useState(false);
  const [callAssistantStep, setCallAssistantStep] = useState<CallAssistantStep>('prep');
  const [callMode, setCallMode] = useState<CallMode>('assistant');
  const [callClinic, setCallClinic] = useState<Clinic | null>(null);
  const [callConsent, setCallConsent] = useState(false);
  const [callStatus, setCallStatus] = useState('Preparing call');
  const [callConversation, setCallConversation] = useState<string[]>([]);
  const [callOutcome, setCallOutcome] = useState<DemoCallOutcome | null>(null);
  const [callRequest, setCallRequest] = useState({
    purpose: 'Ask whether the clinic is accepting new patients and learn the next intake step.',
    preferredLanguage: language === 'fr' ? 'Français' : 'English',
    callLanguage: language === 'fr' ? 'Français' : 'English',
    patientDetails: 'Name, service area, preferred language, and contact preference approved by the patient.',
    questions: 'Are you accepting new patients? Is there an intake form or waitlist? What is the next step?',
    preferredContact: 'Phone or email follow-up from clinic staff after review.',
  });

  const t = translations[language];
  const callCopy = callAssistantTranslations[language];

  const updateWorkflowHistory = (state: WorkflowHistoryState) => {
    window.history.replaceState(state, '', window.location.href);
  };

  const pushWorkflowHistory = (state: WorkflowHistoryState) => {
    window.history.pushState(state, '', window.location.href);
  };

  const goBackInWorkflow = (currentFlow: WorkflowHistoryState['ocbFlow'], fallback: () => void) => {
    const currentState = window.history.state as WorkflowHistoryState | null;
    if (currentState?.ocbFlow === currentFlow) {
      window.history.back();
    } else {
      fallback();
    }
  };

  const translatedBeforeAfterWorkflow = beforeAfterWorkflow.map((stage) => ({
    ...stage,
    title: translateText(stage.title, language),
    items: stage.items.map((item) => translateText(item, language)),
  }));

  const translatedImpactCards = impactCards.map((group) => ({
    ...group,
    title: translateText(group.title, language),
    items: group.items.map((item) => translateText(item, language)),
  }));

  const translatedTimelineStages = timelineStages.map((stage) => ({
    ...stage,
    title: translateText(stage.title, language),
    description: translateText(stage.description, language),
  }));

  useEffect(() => {
    document.documentElement.lang = language;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.metaDescription);
  }, [language, t.metaDescription]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as WorkflowHistoryState | null;
      const flow = state?.ocbFlow;
      const clinic = state?.clinicId ? clinics.find((entry) => entry.id === state.clinicId) : undefined;

      setActiveView('home');
      setWorkflowError('');
      setCallAssistantOpen(flow === 'call');
      setClinicDetailsOpen(flow === 'clinic-details' || flow === 'call');
      setWizardOpen(flow === 'find-care' || flow === 'clinic-details' || flow === 'call');

      if (flow === 'find-care') {
        const restoredStep = returnToFormAfterBackRef.current ? 1 : state?.wizardStep ?? 1;
        returnToFormAfterBackRef.current = false;
        setWizardStep(restoredStep);
        if (state?.wizardStep !== restoredStep) {
          updateWorkflowHistory({ ocbFlow: 'find-care', wizardStep: restoredStep });
        }
      } else if (flow === 'clinic-details' || flow === 'call') {
        if (!clinic) {
          setCallAssistantOpen(false);
          setClinicDetailsOpen(false);
          setWizardOpen(true);
          setWizardStep(4);
          setWorkflowError(translateText(
            'For your security, the clinic details could not be restored. Return to the matching results and select a clinic again.',
            language,
          ));
          return;
        }
        setSelectedClinic(clinic);
        setCallClinic(clinic);
        setWizardStep(4);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [language]);

  useEffect(() => {
    if (!callAssistantOpen && !clinicDetailsOpen && !wizardOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (callAssistantOpen) {
        goBackInWorkflow('call', () => setCallAssistantOpen(false));
      } else if (clinicDetailsOpen) {
        goBackInWorkflow('clinic-details', () => setClinicDetailsOpen(false));
      } else if (wizardOpen) {
        goBackInWorkflow('find-care', () => setWizardOpen(false));
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [callAssistantOpen, clinicDetailsOpen, wizardOpen]);

  const openSection = (section: SectionId) => {
    setActiveView(section === 'track' ? 'track' : 'home');
    setMobileMenuOpen(false);

    if (section === 'find-care') {
      setClinicDetailsOpen(false);
      setCallAssistantOpen(false);
      setWizardOpen(true);
      const step = searchPerformed ? 4 : 1;
      setWizardStep(step);
      pushWorkflowHistory({ ocbFlow: 'find-care', wizardStep: step });
      setWizardError('');
      return;
    }

    if (section === 'track') {
      setWizardOpen(false);
      setClinicDetailsOpen(false);
      setCallAssistantOpen(false);
    }

    const targetId = section === 'home' ? 'top' : section;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLanguageToggle = (nextLanguage: Language) => {
    const previousCopy = callAssistantTranslations[language];
    const nextCopy = callAssistantTranslations[nextLanguage];
    setCallConversation((current) =>
      current.map((line) => {
        if (line === previousCopy.demoIntro) return nextCopy.demoIntro;
        const selectedOption = line.match(/^(?:You selected|Vous avez choisi) ([123])\./);
        if (!selectedOption) return line;
        const choice = Number(selectedOption[1]);
        const menu =
          choice === 1 ? nextCopy.appointmentMenu : choice === 2 ? nextCopy.newPatientMenu : nextCopy.repeatMenu;
        return `${nextCopy.selectedOption} ${choice}. ${menu}`;
      }),
    );
    if (callAssistantOpen) {
      if (callOutcome && callClinic) {
        if (callMode === 'online') {
          const outcome: DemoCallOutcome = {
            ...callOutcome,
            status: nextCopy.onlineBookingStatus,
            summary: nextCopy.onlineBookingSummary,
            nextStep: nextCopy.onlineBookingNextStep,
          };
          setCallOutcome(outcome);
          setCallStatus(outcome.status);
        } else {
          const outcome = getDemoCallOutcome(callClinic, callOutcome.id === 'appointment' ? 1 : 2, nextLanguage);
          setCallOutcome(outcome);
          setCallStatus(outcome.status);
        }
      } else {
        setCallStatus(callAssistantStep === 'demo' ? nextCopy.callInProgress : nextCopy.preparingCall);
      }
    }
    setLanguage(nextLanguage);
  };

  const renderLanguageToggle = () => (
    <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1" aria-label="Language">
      {(['en', 'fr'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleLanguageToggle(option)}
          aria-pressed={language === option}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            language === option ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );

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
      setWizardError(translateText('Please enter a city or town to continue.', language));
      return false;
    }
    if (wizardStep === 3 && !preferences.careNeed) {
      setWizardError(translateText('Please choose the type of care you are looking for.', language));
      return false;
    }
    if (wizardStep === 4 && !preferences.acknowledged) {
      setWizardError(translateText('Please confirm that the clinic results are simulated.', language));
      return false;
    }
    setWizardError('');
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep()) return;
    const nextStep = Math.min(wizardStep + 1, 4) as WizardStep;
    setWizardStep(nextStep);
    updateWorkflowHistory({ ocbFlow: 'find-care', wizardStep: nextStep });
  };

  const handlePrevStep = () => {
    const previousStep = Math.max(wizardStep - 1, 1) as WizardStep;
    setWizardStep(previousStep);
    updateWorkflowHistory({ ocbFlow: 'find-care', wizardStep: previousStep });
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
      updateWorkflowHistory({ ocbFlow: 'find-care', wizardStep: 4 });
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
    setClinicDetailsOpen(false);
    setWizardOpen(false);
    setActiveView('track');
    setTimeout(() => {
      const trackElement = document.getElementById('track');
      trackElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 10);
  };

  const openClinicDetails = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setClinicDetailsOpen(true);
    setWizardOpen(true);
    setActiveView('home');
    setWorkflowError('');
    pushWorkflowHistory({ ocbFlow: 'clinic-details', clinicId: clinic.id });
  };

  const backToFindCare = () => {
    const currentState = window.history.state as WorkflowHistoryState | null;
    if (currentState?.ocbFlow === 'clinic-details') {
      returnToFormAfterBackRef.current = true;
      window.history.back();
      return;
    }
    setCallAssistantOpen(false);
    setClinicDetailsOpen(false);
    setWizardOpen(true);
    setWizardStep(1);
    setActiveView('home');
  };

  const closeClinicDetails = () => {
    goBackInWorkflow('clinic-details', () => setClinicDetailsOpen(false));
  };

  const closeCallAssistant = () => {
    goBackInWorkflow('call', () => setCallAssistantOpen(false));
  };

  const closeFindCare = () => {
    goBackInWorkflow('find-care', () => setWizardOpen(false));
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

  const getCallActionsForClinic = (clinic: Clinic) => {
    const actions: Array<{ label: string; action: 'contact' | 'prepare' | 'self' | 'online' }> = [];
    const phoneContactSupported = clinic.contactMethod === 'telephone-required' || clinic.contactMethod === 'online-and-telephone';
    const phoneContactPossible = phoneContactSupported || clinic.contactMethod === 'unknown' || clinic.contactMethod === 'automated-calls-blocked';
    if (phoneContactSupported) {
      actions.push({ label: callAssistantTranslations[language].contactForMe, action: 'contact' });
      actions.push({ label: callAssistantTranslations[language].prepareForCall, action: 'prepare' });
    }
    if (phoneContactPossible) {
      actions.push({ label: callAssistantTranslations[language].contactMyself, action: 'self' });
    }
    if (clinic.bookingUrl) {
      actions.push({ label: callAssistantTranslations[language].continueOnline, action: 'online' });
    }
    return actions;
  };

  const getDemoCallOutcome = (clinic: Clinic, choice: 1 | 2, outcomeLanguage: Language = language): DemoCallOutcome => {
    const copy = callAssistantTranslations[outcomeLanguage];
    if (choice === 1) {
      return {
        id: 'appointment',
        status: copy.appointmentStatus,
        summary: copy.appointmentSummary,
        nextStep: copy.appointmentNextStep,
        accepting: true,
        requiresIntake: false,
        appointmentConfirmed: true,
      };
    }
    if (clinic.status === 'Simulated: Not Currently Accepting') {
      return {
        id: 'not-accepting',
        status: copy.notAcceptingStatus,
        summary: copy.notAcceptingSummary,
        nextStep: copy.notAcceptingNextStep,
        accepting: false,
        requiresIntake: false,
        appointmentConfirmed: false,
      };
    }
    if (clinic.status === 'Simulated: Limited Availability') {
      return {
        id: 'online-intake',
        status: copy.limitedStatus,
        summary: copy.limitedSummary,
        nextStep: copy.limitedNextStep,
        accepting: true,
        requiresIntake: true,
        appointmentConfirmed: false,
      };
    }
    return {
      id: 'accepting',
      status: copy.acceptingStatus,
      summary: copy.acceptingSummary,
      nextStep: copy.acceptingNextStep,
      accepting: true,
      requiresIntake: true,
      appointmentConfirmed: false,
    };
  };

  const openCallAssistant = (clinic: Clinic, mode: CallMode = 'assistant') => {
    setCallClinic(clinic);
    setCallMode(mode);
    setCallAssistantStep('prep');
    setCallConsent(false);
    setCallStatus(callAssistantTranslations[language].preparingCall);
    setCallConversation([]);
    setCallOutcome(null);
    const copy = callAssistantTranslations[language];
    setCallRequest({
      purpose: copy.callPurpose,
      preferredLanguage: language === 'fr' ? 'Français' : 'English',
      callLanguage: language === 'fr' ? 'Français' : 'English',
      patientDetails: copy.approvedDetails,
      questions: copy.sampleQuestions,
      preferredContact: copy.preferredContactDefault,
    });
    setCallAssistantOpen(true);
    pushWorkflowHistory({ ocbFlow: 'call', clinicId: clinic.id });
  };

  const startDemoCall = () => {
    if (
      !callClinic ||
      !callConsent ||
      callMode !== 'assistant' ||
      (callClinic.contactMethod !== 'telephone-required' && callClinic.contactMethod !== 'online-and-telephone')
    ) return;
    setCallAssistantStep('demo');
    setCallStatus(callCopy.callInProgress);
    setCallConversation([
      callCopy.demoIntro,
    ]);
  };

  const handlePhoneMenuChoice = (choice: 1 | 2 | 3) => {
    if (!callClinic || callAssistantStep !== 'demo') return;
    const copy = callCopy;
    const menuOption = choice === 1 ? copy.appointmentMenu : choice === 2 ? copy.newPatientMenu : copy.repeatMenu;
    setCallConversation((current) => [...current, `${copy.selectedOption} ${choice}. ${menuOption}`]);
    if (choice === 3) return;

    const nextOutcome = getDemoCallOutcome(callClinic, choice);
    setCallOutcome(nextOutcome);
    setCallStatus(nextOutcome.status);
    setCallAssistantStep('result');
  };

  const summaryItems = [
    { label: translateText('City / town', language), value: preferences.city || translateText('Not provided', language) },
    { label: translateText('Postal code', language), value: preferences.postalCode || translateText('Optional', language) },
    { label: translateText('Radius', language), value: `${preferences.radius} km` },
    {
      label: translateText('Language', language),
      value: preferences.languages.length
        ? preferences.languages.map((preferenceLanguage) => translateText(preferenceLanguage, language)).join(', ')
        : translateText('Not selected', language),
    },
    { label: translateText('Care need', language), value: translateText(preferences.careNeed, language) },
  ];

  const renderStepContent = () => {
    if (wizardStep === 1) {
      return (
        <div className="space-y-6">
          <div>
            <label htmlFor="city" className="mb-2 block text-sm font-semibold text-slate-800">
              {translateText('Where are you looking for care?', language)}
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
              {translateText('Optional postal code', language)}
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
            <p className="mb-3 text-sm font-semibold text-slate-800">{translateText('Preferred search radius', language)}</p>
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
            <p className="mb-3 text-sm font-semibold text-slate-800">{translateText('What would help you feel comfortable accessing care?', language)}</p>
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
            <p className="mb-3 text-sm font-semibold text-slate-800">{translateText('Accessibility preferences', language)}</p>
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
            <p className="mb-3 text-sm font-semibold text-slate-800">{translateText('Communication preferences', language)}</p>
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
            <p className="mb-3 text-sm font-semibold text-slate-800">{translateText('What kind of care are you looking for?', language)}</p>
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
            <p className="font-semibold">{translateText('If you are experiencing a medical emergency, call 911.', language)}</p>
            <p className="mt-1">{translateText('For non-emergency health advice in Ontario, contact Health811.', language)}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-800">{translateText('Review your preferences', language)}</p>
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
          <span>{translateText('I understand the clinic results are simulated and do not represent a real appointment or confirmed acceptance.', language)}</span>
        </label>

        {searchPerformed && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">{translateText('Potential clinic matches', language)}</h3>
              <button
                type="button"
                onClick={() => {
                  setSearchPerformed(false);
                  setMatches([]);
                  setWizardStep(1);
                }}
                className="text-sm font-medium text-teal-700 hover:text-teal-900"
              >
                {translateText('Modify search', language)}
              </button>
            </div>

            {matches.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-lg font-semibold text-slate-800">{translateText('No matches found', language)}</p>
                <p className="mt-2 text-sm text-slate-600">{translateText('Try widening the search radius or adjusting your language preferences.', language)}</p>
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

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Service area</p>
                        <p className="mt-1 text-sm text-slate-700">{clinic.serviceArea}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Source</p>
                        <p className="mt-1 text-sm text-slate-700">{clinic.source}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {clinic.languages.map((languageOption) => (
                        <span key={languageOption} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {languageOption}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Eligibility notes</p>
                      <ul className="mt-2 space-y-1">
                        {clinic.eligibilityCriteria.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => openClinicDetails(clinic)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => openClinicDetails(clinic)}
                        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                      >
                        Select this clinic
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
                            <p className="text-sm text-slate-500">{translateText('Current status', language)}</p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">{translateText('Searching for a possible next step', language)}</p>
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
                    title: 'Clinic matching',
                    description: 'Compare fictional clinics by location, language, eligibility, and intake requirements.',
                  },
                  {
                    icon: <Stethoscope className="h-6 w-6" />,
                    title: 'Contact options',
                    description: 'See whether a clinic offers online booking, telephone contact, or both.',
                  },
                  {
                    icon: <FileText className="h-6 w-6" />,
                    title: 'Clear next steps',
                    description: 'Review simulated clinic responses and decide how to proceed. No real calls or appointments are made.',
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
                Ontario Care Bridge is a demonstration concept. Clinic information and availability are fictional and are not connected to real healthcare systems.
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

              <div className="mt-10 grid gap-8 lg:grid-cols-2">
                {translatedBeforeAfterWorkflow.map((stage, index) => (
                  <div key={stage.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                    <h3 className="text-xl font-semibold text-slate-900">{stage.title}</h3>
                    <ul className="mt-5 space-y-3 text-slate-700">
                      {stage.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700">
                            {index === 1 ? '✓' : '•'}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
                <div className="grid gap-8 lg:grid-cols-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Clinic matching</h3>
                    <p className="mt-3 text-slate-600">Compare fictional clinics by location, language, eligibility, and intake requirements.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Contact options</h3>
                    <p className="mt-3 text-slate-600">See whether a clinic offers online booking, telephone contact, or both.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Clear next steps</h3>
                    <p className="mt-3 text-slate-600">Review simulated clinic responses and decide how to proceed. No real calls or appointments are made.</p>
                  </div>
                </div>
                <p className="mt-8 text-base text-slate-700">
                  This is a proposal, not an existing integrated service. Any real implementation would require technical, clinical, legal, privacy, and operational approval.
                </p>
              </div>
            </section>

            <section className="bg-slate-50 py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Expected impact</p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Intended benefits and pilot indicators</h2>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-3">
                  {translatedImpactCards.map((group) => (
                    <div key={group.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                      <h3 className="text-xl font-semibold text-slate-900">{group.title}</h3>
                      <ul className="mt-5 space-y-3 text-sm text-slate-700">
                        {group.items.map((item) => (
                          <li key={item} className="flex gap-3">
                            <span className="mt-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-700">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-100 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Pilot measures</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      'Time required to prepare an intake package.',
                      'Percentage of suggested matches judged appropriate by coordinators.',
                      'Percentage of reviewed cases progressing to the next intake stage.',
                      'Rate of incomplete intake packages.',
                      'Time between identifying a potential match and coordinator review.',
                      'Patient understanding of the next step.',
                    ].map((measure) => (
                      <div key={measure} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                        {measure}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 py-16 text-white">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">Simulated communication</p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight">AI Clinic Calling Assistant</h2>
                  <p className="mt-5 text-lg text-slate-200">
                    Review the clinic, choose what information may be shared, and provide explicit consent before exploring a simulated phone menu.
                  </p>
                  <p className="mt-4 text-slate-300">
                    The demo never places real calls, submits patient information, books appointments, or confirms clinic availability. Clinics that block automated calls will not offer the assistant.
                  </p>
                </div>
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
                    {translatedTimelineStages.map((stage, index) => {
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
                                {isCompleted ? translateText('Completed', language) : isCurrent ? translateText('Current', language) : translateText('Upcoming', language)}
                              </span>
                            </div>
                            {isCompleted && (
                              <p className="mt-3 text-xs uppercase tracking-wide text-emerald-700">
                                {translateText('Completed:', language)} {new Date(activeApplication.submittedAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
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
                      {translateText('Simulate Next Status', language)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('home')}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400"
                    >
                      {t.backToHome}
                    </button>
                  </div>

                  <p className="mt-6 text-sm text-slate-500">{translateText('All statuses are simulated and do not represent real clinic activity or patient care.', language)}</p>
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
                {translatedTimelineStages.map((stage, index) => {
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
                            {isCompleted ? translateText('Completed', language) : isCurrent ? translateText('Current', language) : translateText('Upcoming', language)}
                          </span>
                        </div>
                        {isCompleted && (
                          <p className="mt-3 text-xs uppercase tracking-wide text-emerald-700">
                            {translateText('Completed:', language)} {new Date(activeApplication.submittedAt).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
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
              <div className="flex items-center gap-3">
                {renderLanguageToggle()}
                <button type="button" onClick={closeFindCare} className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100" aria-label={translateText('Close Find Care', language)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
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
                  {workflowError && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-900">{workflowError}</p>}
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

      {activeView === 'home' && clinicDetailsOpen && selectedClinic && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clinic-details-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Clinic details</p>
                <h3 id="clinic-details-title" className="mt-2 text-2xl font-bold text-slate-900">{selectedClinic.name}</h3>
              </div>
              <div className="flex items-center gap-3">
                {renderLanguageToggle()}
                <button type="button" onClick={closeClinicDetails} className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100" aria-label={translateText('Exit clinic details', language)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex w-full flex-wrap gap-2">
                <button
                  type="button"
                  onClick={closeClinicDetails}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  Back to matching results
                </button>
                <button
                  type="button"
                  onClick={backToFindCare}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  Back to Find Care
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6">
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

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">{callAssistantTranslations[language].contactDetails}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {callAssistantTranslations[language].phoneNumber}: {selectedClinic.phoneNumber}
                </p>
                <p className="mt-1 text-xs text-slate-500">{callAssistantTranslations[language].simulatedOnly}</p>
                {selectedClinic.contactMethod === 'automated-calls-blocked' && (
                  <p className="mt-2 text-sm text-amber-800">{callAssistantTranslations[language].contactBlocked}</p>
                )}
                {selectedClinic.contactMethod === 'unknown' && (
                  <p className="mt-2 text-sm text-amber-800">{callAssistantTranslations[language].contactMethodUnknown}</p>
                )}
              </div>

              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
                <p className="font-semibold">{callAssistantTranslations[language].title}</p>
                <p className="mt-2">{callAssistantTranslations[language].description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {getCallActionsForClinic(selectedClinic).map((action) => (
                    <button
                      key={action.action}
                      type="button"
                      onClick={() => {
                        if (action.action === 'contact') {
                          openCallAssistant(selectedClinic, 'assistant');
                          return;
                        }
                        if (action.action === 'prepare') {
                          openCallAssistant(selectedClinic, 'prepare');
                          return;
                        }
                        if (action.action === 'self') {
                          openCallAssistant(selectedClinic, 'self');
                          return;
                        }
                        openCallAssistant(selectedClinic, 'online');
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 hover:border-slate-300"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
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
                  onClick={closeClinicDetails}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400"
                >
                  Exit clinic details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {callAssistantOpen && callClinic && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="call-assistant-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
                  {callStatus}
                </p>
                <h2 id="call-assistant-title" className="mt-1 text-2xl font-bold text-slate-900">
                  {callMode === 'assistant'
                    ? callCopy.title
                    : callMode === 'online'
                      ? callCopy.onlineBookingTitle
                      : callCopy.callNotes}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{callClinic.name}</p>
              </div>
              <div className="flex items-center gap-3">
                {renderLanguageToggle()}
                <button
                  type="button"
                  onClick={closeCallAssistant}
                  className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
                  aria-label={callCopy.close}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                {callCopy.simulatedOnly}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {callMode !== 'online' && (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">{callCopy.clinicPhone}</p>
                    <p className="mt-1 font-semibold text-slate-900">{callClinic.phoneNumber}</p>
                  </div>
                )}
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{callCopy.preferredLanguage}</p>
                  <p className="mt-1 font-semibold text-slate-900">{callRequest.preferredLanguage}</p>
                </div>
              </div>

              {callMode === 'online' ? (
                callAssistantStep === 'prep' && (
                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm leading-6 text-slate-700">{callCopy.onlineBookingDescription}</p>
                    <button
                      type="button"
                      onClick={() => {
                        const outcome: DemoCallOutcome = {
                          id: 'online-intake',
                          status: callCopy.onlineBookingStatus,
                          summary: callCopy.onlineBookingSummary,
                          nextStep: callCopy.onlineBookingNextStep,
                          accepting: false,
                          requiresIntake: true,
                          appointmentConfirmed: false,
                        };
                        setCallOutcome(outcome);
                        setCallStatus(outcome.status);
                        setCallAssistantStep('result');
                      }}
                      className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                    >
                      {callCopy.completeDemoIntake}
                    </button>
                  </div>
                )
              ) : callMode === 'self' ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {callCopy.noRealCall}
                </div>
              ) : (
                <>
                  {callAssistantStep === 'prep' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-slate-700">
                        {callCopy.purpose}
                        <input
                          value={callRequest.purpose}
                          onChange={(event) => setCallRequest((current) => ({ ...current, purpose: event.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700">
                        {callCopy.languageForCall}
                        <select
                          value={callRequest.callLanguage}
                          onChange={(event) => {
                            const nextCallLanguage = event.target.value;
                            setCallRequest((current) => ({ ...current, callLanguage: nextCallLanguage }));
                            setCallStatus(callAssistantTranslations[nextCallLanguage === 'Français' ? 'fr' : 'en'].preparingCall);
                          }}
                          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                        >
                          <option value="English">English</option>
                          <option value="Français">Français</option>
                        </select>
                      </label>
                      <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                        {callCopy.patientInfo}
                        <textarea
                          value={callRequest.patientDetails}
                          onChange={(event) => setCallRequest((current) => ({ ...current, patientDetails: event.target.value }))}
                          rows={2}
                          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                        {callCopy.questions}
                        <textarea
                          value={callRequest.questions}
                          onChange={(event) => setCallRequest((current) => ({ ...current, questions: event.target.value }))}
                          rows={2}
                          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                        />
                      </label>
                      <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                        {callCopy.preferredContact}
                        <input
                          value={callRequest.preferredContact}
                          onChange={(event) => setCallRequest((current) => ({ ...current, preferredContact: event.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900"
                        />
                      </label>
                    </div>
                  )}

                  {callMode === 'assistant' && callAssistantStep === 'prep' && (
                    <div className="space-y-4 border-t border-slate-200 pt-4">
                      <label className="flex items-start gap-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={callConsent}
                          onChange={(event) => setCallConsent(event.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600"
                        />
                        <span>{callCopy.consent}</span>
                      </label>
                      {!callConsent && (
                        <p className="text-sm text-amber-800">{callCopy.consentRequired}</p>
                      )}
                      <button
                        type="button"
                        onClick={startDemoCall}
                        disabled={!callConsent}
                        className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {callCopy.startDemoCall}
                      </button>
                    </div>
                  )}

                  {callAssistantStep === 'demo' && (
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-slate-900 p-4 text-sm text-white">
                        <p className="font-semibold">{callCopy.phoneMenuTitle}</p>
                        <p className="mt-3">{callCopy.menuPrompt}</p>
                        <ul className="mt-3 space-y-1">
                          <li>{callCopy.appointmentMenu}</li>
                          <li>{callCopy.newPatientMenu}</li>
                          <li>{callCopy.repeatMenu}</li>
                        </ul>
                      </div>
                      <div className="space-y-2" aria-live="polite">
                        {callConversation.map((line, index) => (
                          <p key={`${index}-${line}`} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{line}</p>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => handlePhoneMenuChoice(1)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-500">
                          {callCopy.appointmentMenu}
                        </button>
                        <button type="button" onClick={() => handlePhoneMenuChoice(2)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-500">
                          {callCopy.newPatientMenu}
                        </button>
                        <button type="button" onClick={() => handlePhoneMenuChoice(3)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-teal-500">
                          {callCopy.repeatMenu}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {callAssistantStep === 'result' && callOutcome && (
                <div className="space-y-4 rounded-2xl border border-teal-200 bg-teal-50 p-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">{callStatus}</p>
                    <p className="mt-3 text-sm leading-6 text-teal-950">{callOutcome.summary}</p>
                  </div>
                  <div className="border-t border-teal-200 pt-3">
                    <p className="text-sm font-semibold text-teal-900">{callCopy.nextStep}</p>
                    <p className="mt-1 text-sm text-teal-950">{callOutcome.nextStep}</p>
                  </div>
                </div>
              )}

              {(callMode === 'prepare' || callMode === 'self') && callAssistantStep === 'prep' && (
                <p className="text-sm text-slate-600">{callCopy.noRealCall}</p>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={closeCallAssistant}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400"
              >
                {callCopy.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    language,
  );
}

export default App;
