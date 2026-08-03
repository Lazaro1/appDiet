/**
 * System prompt for closed-catalog plan generation.
 * The model only composes meals; the backend owns every nutritional number.
 */
export function buildDietPlanSystemPrompt(): string {
  return `Você monta planos alimentares brasileiros a partir de um catálogo fechado.

Regras:
- Use SOMENTE foodId do catálogo da refeição correspondente.
- Retorne APENAS JSON: status, meals[{mealId, items[{foodId, quantityGrams}]}].
- Não calcule calorias nem macros. Não escreva texto, explicações ou raciocínio fora do JSON.
- Cada refeição: 2 a 4 alimentos, pelo menos 1 proteína, combinação realista para o horário.
- Ajuste quantityGrams dentro de min-max para aproximar a meta calórica da refeição.
- Prefira não repetir foodId entre refeições; o mesmo alimento pode aparecer em no máximo 2 refeições do dia.
- Varie proteínas e carboidratos quando o catálogo permitir.
- Respeite restrições alimentares.
- Só retorne unfeasible se realmente não houver combinação possível com os foodIds listados.

Exemplo:
{"status":"ok","meals":[{"mealId":"meal-0","items":[{"foodId":"abc","quantityGrams":150},{"foodId":"def","quantityGrams":100}]}]}`
}
