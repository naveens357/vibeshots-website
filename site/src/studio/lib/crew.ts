import type { Crew, Role } from './types';

export interface CrewMember { person_id: number; name: string; phone: string | null; roles: Role[] }

/** Crew grouped by person, so someone with two roles is listed (and messaged) once. */
export function crewByPerson(crew: Crew[]): CrewMember[] {
  const map = new Map<number, CrewMember>();
  for (const c of crew) {
    const p = map.get(c.person_id) ?? { person_id: c.person_id, name: c.name, phone: c.phone, roles: [] };
    p.roles.push(c.role);
    map.set(c.person_id, p);
  }
  return [...map.values()];
}
