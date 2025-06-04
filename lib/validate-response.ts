import { VerifiedRizaInfo } from "./verified-riza-info";

const VERIFIED_TERMS = [
  ...Object.values(VerifiedRizaInfo.currentPosition),
  ...VerifiedRizaInfo.education.flatMap((edu) => Object.values(edu)),
  ...VerifiedRizaInfo.experience.flatMap((exp) => Object.values(exp)),
  Object.values(VerifiedRizaInfo.research),
  ...VerifiedRizaInfo.interests,
].filter((v) => typeof v === "string");

export async function validateResponse(response: string): Promise<boolean> {
  // Check for unsafe phrases
  const unsafePhrases = [
    "I think",
    "probably",
    "if I remember correctly",
    "not sure but",
    "might be",
  ];

  if (unsafePhrases.some((phrase) => response.includes(phrase))) {
    return false;
  }

  // Check if response contains only verified terms for professional context
  const professionalTerms = response.match(/\b[A-Z][a-zA-Z.]+\b/g) || [];
  const unverifiedTerms = professionalTerms.filter(
    (term) => !VERIFIED_TERMS.some((v) => v.includes(term))
  );

  return unverifiedTerms.length === 0;
}
