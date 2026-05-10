export type PatientIdentity = {
  name?: string;
  dob?: string;
  identifier?: string;
  pointer?: string;
};

export function normalizePatientToken(value?: string): string {
  return value
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    : '';
}

export function buildPatientKey(identity?: PatientIdentity, fallbackSeed?: string): string {
  const explicitPointer = normalizePatientToken(identity?.pointer);
  if (explicitPointer) return explicitPointer;

  const parts = [identity?.name, identity?.dob, identity?.identifier]
    .map((part) => normalizePatientToken(part))
    .filter(Boolean);

  if (parts.length > 0) {
    return parts.join('::');
  }

  const fallback = normalizePatientToken(fallbackSeed);
  return fallback ? `unassigned-${fallback}` : 'unassigned';
}

export function buildPatientLabel(identity?: PatientIdentity): string {
  const name = identity?.name?.trim();
  if (name) return name;

  const pointer = identity?.pointer?.trim();
  if (pointer) return pointer;

  const identifier = identity?.identifier?.trim();
  if (identifier) return identifier;

  return 'Unassigned patient';
}