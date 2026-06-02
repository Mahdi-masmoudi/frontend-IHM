import { Offre } from './types';

export const MOCK_OFFRES: Offre[] = [
  {
    idOffre: 'static-1',
    titre: 'Senior Full Stack Developer (Angular / Node.js)',
    description: `Nous recherchons un développeur Full Stack Senior passionné pour concevoir et développer la prochaine génération de nos produits SaaS. Vous travaillerez au sein d'une équipe agile pluridisciplinaire et serez responsable de la qualité technique du code Angular et Node.js.

Responsabilités :
- Concevoir et implémenter des fonctionnalités sur notre application Angular moderne.
- Développer des APIs robustes et hautement performantes en Node.js/Express.
- Collaborer avec l'équipe design pour fournir une expérience utilisateur (UX/UI) irréprochable.
- Participer activement à la refactorisation et à la mise en place de bonnes pratiques de développement (TDD, Clean Architecture).

Profil recherché :
- Au moins 5 ans d'expérience en développement Angular et Node.js.
- Solide compréhension de TypeScript et de l'architecture moderne.
- Expérience avec MongoDB et SQLite.
- Excellente capacité de communication et esprit d'équipe.`,
    typeContrat: 'CDI',
    salaire: 5500,
    localisation: 'Tunis, Tunisie',
    datePublication: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    statut: 'PUBLIEE',
    competences: 'Angular, Node.js, TypeScript, MongoDB, Clean Architecture',
    experienceDemandee: 5,
    nomEntreprise: 'TechLabs Europe',
    adresseEntreprise: 'Les Berges du Lac II, Tunis',
    secteurActivite: 'Nouvelles technologies',
    entrepriseDescription: 'TechLabs Europe est un éditeur de logiciels spécialisé dans les solutions RH innovantes et le matching de profils par IA.'
  },
  {
    idOffre: 'static-2',
    titre: 'UX/UI Designer & Product Thinker',
    description: `Nous recherchons un designer UX/UI d'exception pour concevoir des parcours utilisateurs simples, fluides et esthétiquement parfaits. Vous interviendrez sur l'ensemble de la chaîne de création : de la phase de recherche utilisateur (User Research) aux maquettes interactives haute fidélité.

Responsabilités :
- Mener des ateliers UX et concevoir des wireframes.
- Développer et maintenir notre Design System sous Figma.
- Réaliser des prototypes interactifs et effectuer des tests utilisateurs.
- Travailler main dans la main avec l'équipe de développement pour s'assurer de la conformité du rendu final.

Profil recherché :
- 3 ans d'expérience minimum dans le design de produits Web et Mobiles.
- Maîtrise avancée de Figma et des micro-animations.
- Portfolio solide démontrant une sensibilité pour les interfaces premium et épurées.`,
    typeContrat: 'CDI',
    salaire: 2800,
    localisation: 'Sfax, Tunisie',
    datePublication: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    statut: 'PUBLIEE',
    competences: 'Figma, UX Research, Design System, Prototyping, CSS Grid',
    experienceDemandee: 3,
    nomEntreprise: 'Creative Agency',
    adresseEntreprise: 'Route de Teniour, Sfax',
    secteurActivite: 'Design & Marketing',
    entrepriseDescription: 'Creative Agency accompagne les startups internationales dans leur identité de marque et leur design produit.'
  },
  {
    idOffre: 'static-3',
    titre: 'Product Manager (SaaS & AI)',
    description: `Rejoignez-nous en tant que Product Manager pour piloter la feuille de route de nos modules basés sur l'intelligence artificielle. Vous collaborerez avec les clients, les ingénieurs et la direction pour concevoir des produits à forte valeur ajoutée.

Responsabilités :
- Définir la vision produit et maintenir le backlog.
- Rédiger des spécifications claires et détaillées (User Stories).
- Analyser les indicateurs de performance (KPIs) pour itérer sur le produit.
- Assurer la communication et la formation interne lors des sorties de fonctionnalités.`,
    typeContrat: 'CDD',
    salaire: 3800,
    localisation: 'Tunis, Tunisie',
    datePublication: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    statut: 'PUBLIEE',
    competences: 'Agile, Product Roadmap, Scrum, Jira, Business Intelligence',
    experienceDemandee: 4,
    nomEntreprise: 'Innovate AI',
    adresseEntreprise: 'Technopark El Ghazela, Ariana',
    secteurActivite: 'Intelligence Artificielle',
    entrepriseDescription: 'Innovate AI développe des solutions intelligentes de traitement du langage naturel (NLP) pour les entreprises.'
  },
  {
    idOffre: 'static-4',
    titre: 'DevOps & Site Reliability Engineer (SRE)',
    description: `Afin de soutenir notre forte croissance, nous recherchons un ingénieur DevOps pour automatiser, sécuriser et faire passer à l'échelle nos infrastructures cloud hybrides (AWS / GCP).

Responsabilités :
- Gérer et optimiser notre infrastructure Kubernetes en production.
- Mettre en œuvre et maintenir des pipelines CI/CD ultra-rapides.
- Assurer la sécurité, la haute disponibilité et la surveillance des systèmes.
- Automatiser les tâches récurrentes de déploiement et de scaling.`,
    typeContrat: 'Freelance',
    salaire: 6500,
    localisation: 'Remote (Tunisie)',
    datePublication: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    statut: 'PUBLIEE',
    competences: 'Kubernetes, Docker, AWS, Terraform, CI/CD, Python',
    experienceDemandee: 6,
    nomEntreprise: 'CloudScale Solutions',
    adresseEntreprise: 'Remote',
    secteurActivite: 'Services Cloud',
    entrepriseDescription: 'CloudScale est un cabinet de conseil spécialisé dans le cloud native et la transformation DevOps.'
  },
  {
    idOffre: 'static-5',
    titre: 'Développeur Angular Junior',
    description: `Nous recherchons un développeur Angular Junior curieux et passionné de frontend pour participer à l'évolution de nos tableaux de bord. Vous bénéficierez d'un encadrement de qualité pour progresser rapidement sur Angular moderne (v17/v18).

Responsabilités :
- Participer au développement de nouveaux composants web réutilisables.
- Résoudre les anomalies graphiques et optimiser les performances d'affichage.
- Collaborer aux revues de code hebdomadaires avec les développeurs seniors.`,
    typeContrat: 'Stage',
    salaire: 800,
    localisation: 'Sousse, Tunisie',
    datePublication: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    statut: 'PUBLIEE',
    competences: 'Angular, CSS, HTML5, RxJS, Git',
    experienceDemandee: 1,
    nomEntreprise: 'StartUp Factory',
    adresseEntreprise: 'Sousse Ville, Sousse',
    secteurActivite: 'Incubateur & Développement',
    entrepriseDescription: 'StartUp Factory est à la fois un incubateur de projets et un studio de création web basé à Sousse.'
  },
  {
    idOffre: 'static-6',
    titre: 'Data Scientist (Machine Learning & Python)',
    description: `Intégrez notre pôle R&D pour concevoir des modèles d'évaluation et de matching prédictif basés sur l'historique de recrutement de nos grands comptes clients.

Responsabilités :
- Analyser et structurer d'importants volumes de données candidats.
- Concevoir et entraîner des modèles de recommandation et de classification.
- Intégrer les modèles prédictifs dans notre API via Flask/FastAPI.
- Assurer la veille technologique sur les LLMs et les réseaux de neurones.`,
    typeContrat: 'CDI',
    salaire: 4600,
    localisation: 'Tunis, Tunisie',
    datePublication: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    statut: 'PUBLIEE',
    competences: 'Python, Machine Learning, Scikit-Learn, PyTorch, Pandas, SQL',
    experienceDemandee: 3,
    nomEntreprise: 'AI Solution',
    adresseEntreprise: 'Charguia II, Tunis',
    secteurActivite: 'Data Science & IA',
    entrepriseDescription: 'AI Solution conçoit des systèmes prédictifs à forte valeur ajoutée pour les banques et assurances.'
  }
];
