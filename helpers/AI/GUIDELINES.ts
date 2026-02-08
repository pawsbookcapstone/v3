import { Guideline } from "./types";

export const IMAGE_GUIDELINES: Guideline[] = [
  {
    id: 'violence',
    name: 'Violence & Physical Harm',
    description: 'Images depicting gore, physical injury, or threats of violence.',
    enabled: true,
  },
  {
    id: 'adult',
    name: 'Adult Content',
    description: 'Nudity, sexually explicit material, or suggestive content inappropriate for general audiences.',
    enabled: true,
  },
  {
    id: 'hate',
    name: 'Hate Speech & Harassment',
    description: 'Symbols of hate, exclusionary imagery, or bullying aimed at individuals/groups.',
    enabled: true,
  },
  {
    id: 'illegal',
    name: 'Illegal Acts & Substances',
    description: 'Promotion of drug use, illegal weapons, or criminal activities.',
    enabled: true,
  },
  {
    id: 'pii',
    name: 'Private Information',
    description: 'Visible sensitive data like credit cards, IDs, or residential addresses.',
    enabled: true,
  },
  {
    id: 'spam',
    name: 'Deceptive Content',
    description: 'QR codes to suspicious sites, misleading overlays, or spammy text.',
    enabled: true,
  }
];

export const TEXT_GUIDELINES: Guideline[] = [
  {
    id: "hate",
    name: "Hate Speech & Discrimination",
    description:
      "Content that promotes hatred, discrimination, or violence against individuals or groups based on protected characteristics such as race, religion, gender, sexuality, nationality, or disability.",
    enabled: true,
  },
  {
    id: "harassment",
    name: "Harassment & Bullying",
    description:
      "Threats, intimidation, insults, or repeated abusive language directed at individuals or groups.",
    enabled: true,
  },
  {
    id: "violence",
    name: "Violence & Threats",
    description:
      "Explicit threats of physical harm, encouragement of violence, or glorification of violent acts.",
    enabled: true,
  },
  {
    id: "sexual",
    name: "Sexual & Explicit Content",
    description:
      "Pornographic, sexually explicit, or graphically suggestive language not suitable for general audiences.",
    enabled: true,
  },
  {
    id: "self_harm",
    name: "Self-Harm & Suicide",
    description:
      "Content that encourages, glorifies, or provides instructions for self-harm or suicide.",
    enabled: true,
  },
  {
    id: "illegal",
    name: "Illegal Activities",
    description:
      "Promotion, coordination, or encouragement of illegal acts, including drug use, fraud, hacking, or violence.",
    enabled: true,
  },
  {
    id: "scam",
    name: "Scams & Fraud",
    description:
      "Attempts to deceive users for financial gain, phishing, impersonation, or false promises.",
    enabled: true,
  },
  {
    id: "pii",
    name: "Personal & Private Information",
    description:
      "Sharing of sensitive personal data such as phone numbers, addresses, IDs, passwords, or financial information.",
    enabled: true,
  },
  {
    id: "spam",
    name: "Spam & Manipulation",
    description:
      "Repetitive, misleading, promotional, or low-effort content intended to manipulate engagement or redirect users.",
    enabled: true,
  },
  {
    id: "misinformation",
    name: "Misinformation & Harmful Claims",
    description:
      "False or misleading claims that could cause real-world harm, including medical, financial, or safety misinformation.",
    enabled: true,
  },
  {
    id: "impersonation",
    name: "Impersonation & Deception",
    description:
      "Pretending to be another person, brand, or authority in order to mislead or exploit others.",
    enabled: true,
  },
  {
    id: "profanity",
    name: "Excessive Profanity",
    description:
      "Overuse of obscene or vulgar language that degrades the quality of discourse.",
    enabled: true,
  },
];
