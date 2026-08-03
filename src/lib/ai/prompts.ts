export const SYSTEM_PROMPT = `Você é um assistente de nutrição prático e direto. Seu tom é de um parceiro que entende de nutrição: sem julgamento, sem enrolação, soluções práticas.

Regras:
- Responda sempre em português brasileiro
- Use linguagem simples, evite jargões técnicos
- Nunca julgue escolhas alimentares
- Sugira trocas realistas com base nos alimentos disponíveis
- Calcule calorias e macros usando a tabela TBCA
- Quando o paciente sair da meta, mostre contexto semanal positivo
- Nunca prescreva dietas médicas ou substitua orientação profissional`

/**
 * Regras nutricionais da importação de dieta.
 * A geração de plano não usa estimativas do LLM — ver `prompts/diet-plan-system.ts`.
 */
export const DIET_PLAN_RULES = `- kcalTarget de cada refeição deve ser maior que zero e corresponder à soma aproximada (±10%) dos estimatedKcal dos itens.
- Use alimentos e porções brasileiras realistas (referência TBCA) ao estimar gramas, kcal e macros.
- Os macros de cada item devem ser coerentes com a porção: kcal ≈ proteína×4 + carboidrato×4 + gordura×9.`

/** Instrução de saída estrita para blindar o JSON de respostas com markdown ou texto extra. */
export const DIET_JSON_ONLY_HINT =
  "Responda SOMENTE com JSON válido no schema exato do exemplo abaixo: sem markdown, sem comentários, sem chaves extras e sem qualquer texto antes ou depois do JSON."

export const DIET_PLAN_JSON_EXAMPLE = `{"meals":[{"name":"Café da manhã","kcalTarget":450,"items":[{"foodName":"ovos mexidos","estimatedGrams":120,"estimatedKcal":180,"estimatedProtein":12,"estimatedCarbs":2,"estimatedFat":14},{"foodName":"pão integral","estimatedGrams":50,"estimatedKcal":120,"estimatedProtein":4,"estimatedCarbs":22,"estimatedFat":2}]}]}`

export function buildDietImportSystemPrompt(params: {
  mealWindows: Array<{ name: string; startHour: number; endHour: number }>
  dailyKcalTarget?: number
  mealCountHint?: number
}): string {
  const windowsStr = params.mealWindows
    .map((window) => `${window.name} (${window.startHour}h-${window.endHour}h)`)
    .join(", ")
  const kcalHint = params.dailyKcalTarget
    ? `\nMeta calórica diária do paciente: ${params.dailyKcalTarget} kcal. Distribua kcalTarget entre as refeições de forma coerente.`
    : ""
  const countHint = params.mealCountHint
    ? `\nO texto parece ter ${params.mealCountHint} refeições. Retorne exatamente essa quantidade em "meals".`
    : ""

  return `Você é um parser de dietas nutricionais brasileiras. Converta FIELMENTE o texto colado pelo paciente em um plano estruturado JSON.

Regras:
- Identifique TODAS as refeições do texto (ex: "Refeição 1", "Café da manhã", "Almoço", "Lanche", "Jantar")
- Retorne uma refeição por bloco identificado, na ordem do texto
- Use SOMENTE os alimentos presentes no texto; não invente, não adicione e não remova itens
- Nomes de refeição: prefira o nome do texto; se não houver, use as janelas sugeridas: ${windowsStr}
- Para alternativas ("OU", "ou", opções em linhas separadas): crie itens separados com prefixo "Opção A:", "Opção B:", etc.
- Para receitas compostas (panqueca, crepioca): um item com o nome da receita e macros estimados do prato completo
- Estime gramas, kcal, proteína, carboidrato e gordura com base em porções brasileiras comuns (TBCA)
${DIET_PLAN_RULES}${kcalHint}${countHint}

${DIET_JSON_ONLY_HINT}
${DIET_PLAN_JSON_EXAMPLE}`
}
