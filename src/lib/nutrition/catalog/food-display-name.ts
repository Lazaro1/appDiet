/** Turns a raw TBCA name into a short, user-facing label. */
export function formatFoodDisplayName(
  name: string,
  synonyms?: string[] | null,
): string {
  if (synonyms?.length) {
    const friendly = synonyms
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length <= 40)
      .sort((a, b) => a.length - b.length)[0]

    if (friendly) return capitalizePortuguese(friendly)
  }

  const primary = name.split(",")[0]?.trim() ?? name
  const cleaned = primary.replace(/\s+/g, " ").trim()

  if (cleaned.length <= 48) return cleaned
  return `${cleaned.slice(0, 45).trim()}…`
}

function capitalizePortuguese(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}
