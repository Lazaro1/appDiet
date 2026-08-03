export interface ParsedRestrictions {
  excludeLactose: boolean
  excludeGluten: boolean
  excludeAnimal: boolean
  vegan: boolean
  vegetarian: boolean
  pescatarian: boolean
  rawTerms: string[]
}

const TERM_MAP: Array<{ pattern: RegExp; apply: (r: ParsedRestrictions) => void }> = [
  {
    pattern: /sem\s*lactose|lactose\s*free|intoleran.*lactose/i,
    apply: (r) => {
      r.excludeLactose = true
    },
  },
  {
    pattern: /sem\s*gluten|gluten\s*free|cel[ií]ac/i,
    apply: (r) => {
      r.excludeGluten = true
    },
  },
  {
    pattern: /\bvegano?\b/i,
    apply: (r) => {
      r.vegan = true
      r.excludeAnimal = true
      r.excludeLactose = true
    },
  },
  {
    pattern: /\bvegetarian[oa]?\b/i,
    apply: (r) => {
      r.vegetarian = true
      r.excludeAnimal = true
    },
  },
  {
    pattern: /pescetarian|pescatarian|peixe\s*ok/i,
    apply: (r) => {
      r.pescatarian = true
      r.excludeAnimal = true
    },
  },
]

export function parseRestrictionsText(
  restrictions?: string | string[] | null,
): ParsedRestrictions {
  const result: ParsedRestrictions = {
    excludeLactose: false,
    excludeGluten: false,
    excludeAnimal: false,
    vegan: false,
    vegetarian: false,
    pescatarian: false,
    rawTerms: [],
  }

  const text = Array.isArray(restrictions)
    ? restrictions.join(", ")
    : restrictions?.trim() ?? ""

  if (!text) return result

  result.rawTerms = text
    .split(/[,;\n]/)
    .map((term) => term.trim())
    .filter(Boolean)

  for (const term of TERM_MAP) {
    if (term.pattern.test(text)) {
      term.apply(result)
    }
  }

  return result
}

export function buildRestrictionWhereClause(restrictions: ParsedRestrictions) {
  const and: Record<string, unknown>[] = [{ active: true }]

  if (restrictions.excludeLactose) {
    and.push({ NOT: { containsLactose: true } })
  }

  if (restrictions.excludeGluten) {
    and.push({ NOT: { containsGluten: true } })
  }

  if (restrictions.vegan || restrictions.vegetarian || restrictions.pescatarian) {
    and.push({ NOT: { containsAnimal: true } })
  }

  return { AND: and }
}
