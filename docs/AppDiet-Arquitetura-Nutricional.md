# AppDiet — Arquitetura Nutricional com TBCA, Validação Determinística e Retrieval Híbrido

> Última atualização: Julho de 2026  
> Status: Proposta técnica para implementação

---

## 1. Resumo executivo

Esta arquitetura separa as responsabilidades entre o modelo de linguagem, o backend, o validador nutricional e a camada de busca de alimentos.

O objetivo é aumentar a precisão calórica, reduzir alucinações, respeitar restrições alimentares e tornar a geração de planos mais previsível, auditável e barata.

| Camada | Responsabilidade | Resultado |
|---|---|---|
| LLM | Escolher alimentos e montar combinações | Variedade, preferências e coerência alimentar |
| Backend | Calcular metas, calorias e macronutrientes | Fonte única de verdade |
| Validador | Aplicar regras nutricionais e de negócio | Garantias determinísticas |
| Otimizador | Ajustar porções para aproximar metas | Menos retries e menor custo |
| Catálogo TBCA | Fornecer composição nutricional oficial | Redução de valores inventados |
| Retrieval | Localizar e ordenar alimentos candidatos | Matching semântico e lexical |
| Recipes/CustomFood | Representar pratos compostos | Cobertura além da TBCA |

A regra principal é:

```text
LLM escolhe foodId e porção aproximada.
Backend calcula os nutrientes.
Validador verifica o plano.
Otimizador ajusta as quantidades.
```

O LLM não deve ser considerado fonte confiável para calorias, proteínas, carboidratos ou gorduras.

---

## 2. Problema atual

No fluxo atual, o LLM gera simultaneamente:

- nome do alimento;
- quantidade em gramas;
- calorias estimadas;
- proteínas estimadas;
- carboidratos estimados;
- gorduras estimadas;
- meta calórica da refeição.

Exemplo do contrato atual:

```typescript
interface ParsedFoodItem {
  foodName: string
  estimatedGrams: number
  estimatedKcal: number
  estimatedProtein: number
  estimatedCarbs: number
  estimatedFat: number
}
```

Esse desenho permite inconsistências como:

```json
{
  "name": "Almoço",
  "kcalTarget": 600,
  "items": [
    {
      "foodName": "Arroz branco",
      "estimatedGrams": 100,
      "estimatedKcal": 130
    },
    {
      "foodName": "Peito de frango",
      "estimatedGrams": 100,
      "estimatedKcal": 165
    }
  ]
}
```

A refeição declara 600 kcal, mas os itens totalizam apenas 295 kcal.

Além disso, o modelo pode:

- inventar alimentos;
- inventar IDs;
- confundir alimento cru e cozido;
- violar restrições;
- usar porções irreais;
- repetir alimentos excessivamente;
- gerar macros incompatíveis;
- criar combinações culinárias ruins;
- devolver JSON válido, mas nutricionalmente incorreto.

---

## 3. Princípios da arquitetura

### 3.1 Separação de responsabilidades

A arquitetura deve seguir esta divisão:

```text
LLM:
- escolhe alimentos;
- organiza refeições;
- considera preferências;
- busca variedade;
- evita combinações ruins.

Backend:
- calcula meta calórica diária;
- calcula metas de macros;
- distribui targets por refeição;
- resolve foodId;
- calcula nutrientes;
- converte medidas caseiras.

Validador:
- verifica restrições;
- valida IDs;
- valida quantidades;
- compara target e valor real;
- verifica repetição e variedade;
- aplica regras de segurança.

Otimizador:
- ajusta quantidades;
- corrige pequenos desvios;
- mantém porções realistas;
- reduz necessidade de retries.
```

### 3.2 Target e valor calculado são diferentes

A meta de cada refeição deve ser definida antes da geração.

O valor real deve ser calculado depois da resposta do LLM.

```typescript
interface PlannedMeal {
  name: string
  kcalTarget: number
  kcalActual: number
  items: MealItem[]
}
```

Nunca derive `kcalTarget` da soma dos itens.

O fluxo correto é:

```text
dailyKcalTarget
      ↓
distribuição das metas por refeição
      ↓
LLM seleciona alimentos e porções
      ↓
backend calcula kcalActual
      ↓
validador compara kcalActual com kcalTarget
```

---

## 4. Arquitetura proposta

```text
┌──────────────────────────────────────────────────────────┐
│                    Perfil do usuário                     │
│ kcal, macros, refeições, restrições, preferências        │
└─────────────────────────────┬────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│              Gate de segurança e elegibilidade           │
│ alergias, condições clínicas, idade, gestação etc.       │
└─────────────────────────────┬────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│                  Planejamento determinístico             │
│ meta diária + targets por refeição + macros              │
└─────────────────────────────┬────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│              Busca estruturada de candidatos             │
│ restrições + papel nutricional + preparo + faixa         │
└─────────────────────────────┬────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│             Ranking lexical e vetorial opcional          │
│ nome + sinônimos + full-text + pg_trgm + pgvector        │
└─────────────────────────────┬────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│                           LLM                            │
│ escolhe foodId + quantidade aproximada                  │
└─────────────────────────────┬────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│              Hidratação e cálculo nutricional            │
│ TBCA/Recipe/CustomFood → kcal e macros reais             │
└─────────────────────────────┬────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│                  Otimizador de porções                   │
│ pequenos ajustes para aproximar targets                  │
└─────────────────────────────┬────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│                        Validador                         │
│ targets, macros, porções, restrições, variedade          │
└─────────────────────────────┬────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
           Plano válido              Erro semântico
                 │                         │
                 ▼                         ▼
           Plano final            Reparo direcionado
```

---

## 5. Contratos de dados

### 5.1 Entrada da geração

```typescript
interface GenerateDietPlanParams {
  dailyKcalTarget: number

  macroTargets?: {
    proteinGrams: number
    carbsGrams: number
    fatGrams: number
    fiberMinimumGrams?: number
  }

  meals: Array<{
    id: string
    name: string
    startHour: number
    endHour: number
    kcalTarget: number
    proteinTargetGrams?: number
  }>

  restrictions: NormalizedDietRestrictions

  preferences?: {
    preferredFoodIds?: string[]
    dislikedFoodIds?: string[]
    preferredCuisines?: string[]
    practicalMeals?: boolean
    budgetLevel?: "low" | "medium" | "high"
  }
}
```

### 5.2 Restrições normalizadas

Evitar `string[]` como representação principal.

```typescript
type DietaryPattern =
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "lactose_free"
  | "gluten_free"

type Allergen =
  | "milk"
  | "egg"
  | "peanut"
  | "tree_nut"
  | "soy"
  | "wheat"
  | "fish"
  | "shellfish"
  | "sesame"

interface NormalizedDietRestrictions {
  excludedFoodIds: string[]
  excludedCategories: string[]
  allergens: Allergen[]
  dietaryPatterns: DietaryPattern[]
  medicalRestrictions?: string[]
}
```

Preferências e restrições devem ser tratadas de maneira diferente:

```text
Alergia:
proibição rígida.

Restrição:
proibição ou regra obrigatória.

Preferência:
aumenta prioridade.

Alimento não apreciado:
reduz prioridade, mas não representa risco.
```

### 5.3 Contrato retornado pelo LLM

O modelo deve retornar apenas composição.

```typescript
interface GeneratedDietDraft {
  status: "ok" | "unfeasible"

  meals?: Array<{
    mealId: string
    items: Array<{
      foodId: string
      quantityGrams: number
    }>
  }>

  reason?: string
}
```

Exemplo:

```json
{
  "status": "ok",
  "meals": [
    {
      "mealId": "lunch",
      "items": [
        {
          "foodId": "tbca_123",
          "quantityGrams": 150
        },
        {
          "foodId": "tbca_456",
          "quantityGrams": 100
        }
      ]
    }
  ]
}
```

O LLM não deve retornar:

- calorias;
- proteínas;
- carboidratos;
- gorduras;
- fibras;
- nomes livres;
- unidades abertas;
- IDs fora do catálogo;
- valores nutricionais estimados.

### 5.4 Plano hidratado

```typescript
interface NutritionTotals {
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  fiberGrams: number
}

interface DietPlan {
  dailyTarget: NutritionTotals
  dailyActual: NutritionTotals

  meals: Array<{
    id: string
    name: string

    kcalTarget: number
    kcalActual: number

    macroTargets?: Partial<NutritionTotals>
    actualNutrition: NutritionTotals

    items: Array<{
      foodId: string
      name: string

      quantityGrams: number
      displayMeasure?: string

      nutrition: NutritionTotals

      source: "TBCA" | "RECIPE" | "CUSTOM_FOOD"
    }>
  }>
}
```

---

## 6. Catálogo nutricional

### 6.1 Fonte de verdade

O catálogo deve usar a TBCA como fonte principal para alimentos brasileiros.

Também pode aceitar:

- alimentos customizados;
- rótulos cadastrados;
- receitas;
- produtos específicos;
- dados complementares de outras fontes.

A origem deve ser registrada em cada item.

### 6.2 Modelo de alimento

```prisma
model Food {
  id                  String   @id @default(cuid())
  externalCode        String?
  source              FoodSource

  name                String
  normalizedName      String
  category            String?
  nutritionalRole     String?
  preparationMethod   String?
  physicalState       String?

  kcalPer100g         Float
  proteinPer100g      Float
  carbsPer100g        Float
  fatPer100g          Float
  fiberPer100g        Float?

  portionDefaultGrams Float?
  portionMinGrams     Float?
  portionMaxGrams     Float?
  portionStepGrams    Float?   @default(5)

  synonyms            String[] @default([])
  searchText          String?

  containsGluten      Boolean?
  containsLactose     Boolean?
  containsAnimal      Boolean?
  isVegan             Boolean?
  isVegetarian        Boolean?

  allergens           String[] @default([])
  contaminationRisks  String[] @default([])

  active              Boolean  @default(true)

  mealItems           MealItem[]

  @@index([normalizedName])
  @@index([category])
  @@index([nutritionalRole])
}
```

O uso de `Boolean?` é intencional:

```text
true  = confirmado
false = confirmado como ausente
null  = ainda não validado
```

Um valor desconhecido não deve ser interpretado automaticamente como seguro.

### 6.3 Estado de preparo

O estado de preparo faz parte da identidade nutricional.

Exemplos distintos:

```text
arroz cru
arroz cozido
frango cru
frango grelhado
batata crua
batata cozida
atum em óleo
atum drenado
```

Campos relevantes:

```typescript
interface PreparationAttributes {
  preparationMethod?: string
  rawOrCooked?: "raw" | "cooked"
  withSkin?: boolean
  withOil?: boolean
  drained?: boolean
  physicalState?: string
}
```

---

## 7. Medidas caseiras

A aplicação deve armazenar gramas internamente, mas pode exibir medidas compreensíveis ao usuário.

```prisma
model HouseholdMeasure {
  id          String @id @default(cuid())
  foodId      String
  name        String
  qualifier   String?
  grams       Float

  food        Food @relation(fields: [foodId], references: [id])

  @@index([foodId])
}
```

Exemplos:

```json
{
  "foodId": "rice_cooked",
  "name": "colher de sopa",
  "qualifier": "cheia",
  "grams": 25
}
```

```json
{
  "foodId": "banana_silver",
  "name": "unidade",
  "qualifier": "média",
  "grams": 80
}
```

A conversão deve ser determinística:

```typescript
function convertMeasureToGrams(
  measure: HouseholdMeasure,
  amount: number,
): number {
  return measure.grams * amount
}
```

---

## 8. Receitas e alimentos compostos

Nem todos os pratos estarão disponíveis como item direto na TBCA.

Exemplos:

- crepioca;
- panqueca proteica;
- vitamina;
- sanduíche;
- omelete composto;
- marmita;
- prato preparado;
- receita do próprio usuário.

Usar uma tabela de receitas:

```prisma
model Recipe {
  id              String   @id @default(cuid())
  name            String
  normalizedName  String
  synonyms        String[] @default([])

  servingGrams    Float
  active          Boolean  @default(true)

  ingredients     RecipeIngredient[]
}

model RecipeIngredient {
  id          String @id @default(cuid())
  recipeId    String
  foodId      String
  grams       Float

  recipe      Recipe @relation(fields: [recipeId], references: [id])
  food        Food   @relation(fields: [foodId], references: [id])
}
```

Os nutrientes da receita devem ser derivados dos ingredientes:

```typescript
function computeRecipeNutrition(
  ingredients: Array<{
    food: Food
    grams: number
  }>,
): NutritionTotals {
  return ingredients.reduce(
    (totals, ingredient) => {
      const nutrition = computeFoodNutrition(
        ingredient.food,
        ingredient.grams,
      )

      return addNutritionTotals(totals, nutrition)
    },
    emptyNutritionTotals(),
  )
}
```

---

## 9. Cálculo determinístico

### 9.1 Nutrientes por quantidade

```typescript
function computeFoodNutrition(
  food: Food,
  grams: number,
): NutritionTotals {
  const factor = grams / 100

  return {
    calories: food.kcalPer100g * factor,
    proteinGrams: food.proteinPer100g * factor,
    carbsGrams: food.carbsPer100g * factor,
    fatGrams: food.fatPer100g * factor,
    fiberGrams: (food.fiberPer100g ?? 0) * factor,
  }
}
```

### 9.2 Distribuição de calorias por refeição

A distribuição deve acontecer antes da chamada do LLM.

```typescript
interface MealWindow {
  id: string
  name: string
  startHour: number
  endHour: number
}

interface MealTarget extends MealWindow {
  kcalTarget: number
}
```

Exemplo:

```typescript
function distributeMealCalories(
  dailyKcalTarget: number,
  meals: MealWindow[],
): MealTarget[] {
  const weights = meals.map((meal) => {
    const name = normalizeText(meal.name)

    if (name.includes("almoco")) return 0.30
    if (name.includes("jantar")) return 0.25
    if (name.includes("cafe")) return 0.20
    if (name.includes("ceia")) return 0.10
    if (name.includes("lanche")) return 0.15

    return 1 / meals.length
  })

  const weightSum = weights.reduce(
    (total, weight) => total + weight,
    0,
  )

  const targets = meals.map((meal, index) => ({
    ...meal,
    kcalTarget: Math.round(
      dailyKcalTarget * (weights[index] / weightSum),
    ),
  }))

  const allocated = targets.reduce(
    (total, meal) => total + meal.kcalTarget,
    0,
  )

  targets[targets.length - 1].kcalTarget +=
    dailyKcalTarget - allocated

  return targets
}
```

Os pesos devem ser configuráveis por:

- número de refeições;
- objetivo;
- rotina;
- preferência do usuário;
- horário de treino;
- perfil clínico aprovado.

---

## 10. Busca de candidatos

### 10.1 O retrieval não substitui filtros estruturados

A seleção de alimentos deve seguir esta ordem:

```text
1. Restrições rígidas
2. Segurança alimentar
3. Papel nutricional
4. Categoria
5. Estado de preparo
6. Faixa nutricional
7. Porção possível
8. Preferências
9. Busca lexical
10. Similaridade semântica
```

Embeddings devem refinar o resultado, não definir sozinhos quais alimentos são adequados.

### 10.2 Papéis nutricionais

Exemplos:

```typescript
type NutritionalRole =
  | "protein"
  | "carbohydrate"
  | "vegetable"
  | "fruit"
  | "fat"
  | "dairy"
  | "beverage"
  | "complement"
```

Um alimento pode ter mais de um papel.

### 10.3 Busca estruturada

```typescript
interface FindFoodCandidatesParams {
  mealType: string
  excludedFoodIds: string[]
  excludedCategories: string[]
  excludedAllergens: Allergen[]
  dietaryPatterns: DietaryPattern[]

  nutritionalRoles: NutritionalRole[]

  kcalPer100gRange?: {
    min?: number
    max?: number
  }

  proteinPer100gMinimum?: number

  preferredFoodIds?: string[]
  query?: string

  limitPerRole?: number
}
```

### 10.4 Quantidade de candidatos

Evitar catálogos muito grandes no prompt.

Sugestão por refeição:

```typescript
const candidateLimits = {
  protein: 8,
  carbohydrate: 8,
  fruit: 5,
  vegetable: 5,
  fat: 4,
  dairy: 4,
  complement: 5,
}
```

Normalmente, 20 a 40 candidatos bem selecionados por refeição são melhores do que 80 a 150 itens pouco filtrados.

---

## 11. Retrieval lexical e vetorial

### 11.1 MVP

Começar com:

```text
nome normalizado
+ sinônimos
+ PostgreSQL full-text
+ pg_trgm
+ filtros estruturados
```

Isso cobre casos como:

```text
frango
peito de frango
filé de frango
frango grelhado
arroz integral
iogurte natural
```

### 11.2 Evolução com pgvector

Adicionar embeddings quando houver evidência de que o matching lexical não é suficiente.

Stack:

```text
PostgreSQL
├── full-text search
├── pg_trgm
└── pgvector
```

### 11.3 Texto usado no embedding

O embedding deve conter informações semânticas, não números usados em cálculo.

Bom exemplo:

```text
Peito de frango sem pele grelhado.
Categoria: carnes e derivados.
Sinônimos: frango grelhado, filé de frango, peito de frango.
Preparo: grelhado.
Papel nutricional: fonte de proteína magra.
Refeições comuns: almoço e jantar.
```

Evitar incluir:

```text
159 kcal
32 g de proteína
3 g de gordura
```

Comparações numéricas devem ser realizadas por filtros estruturados.

### 11.4 Score híbrido

Exemplo conceitual:

```text
score_final =
  peso_lexical × lexical_score
  + peso_semantico × cosine_similarity
  + bonus_preferencia
  + bonus_refeicao
```

O score não substitui as restrições.

### 11.5 Contrato da busca

```typescript
interface FoodSearchResult {
  foodId: string
  name: string
  score: number

  nutritionalRole?: NutritionalRole
  preparationMethod?: string

  portionDefaultGrams?: number
  portionMinGrams?: number
  portionMaxGrams?: number
  portionStepGrams?: number
}

async function searchFoods(
  params: FindFoodCandidatesParams,
): Promise<FoodSearchResult[]> {
  // implementação
}
```

---

## 12. Modos de uso do retrieval

### 12.1 Pré-retrieval

Recomendado para o MVP.

```typescript
const candidatesByMeal = await Promise.all(
  mealTargets.map(async (meal) => {
    return {
      meal,
      candidates: await foodRepository.findCandidates({
        mealType: meal.name,
        excludedFoodIds:
          restrictions.excludedFoodIds,
        excludedCategories:
          restrictions.excludedCategories,
        excludedAllergens:
          restrictions.allergens,
        dietaryPatterns:
          restrictions.dietaryPatterns,
        nutritionalRoles:
          inferRequiredRoles(meal),
        limitPerRole: 6,
      }),
    }
  }),
)
```

Vantagens:

- apenas uma chamada ao LLM;
- schema simples;
- menor latência;
- validação fácil;
- IDs fechados.

### 12.2 Tool calling

Usar como evolução.

Ferramentas possíveis:

```typescript
searchFoods()
searchEquivalentFoods()
searchRecipes()
getFoodDetails()
```

Exemplo:

```json
{
  "mealType": "café da manhã",
  "nutritionalRole": "protein",
  "restrictions": ["lactose_free"],
  "kcalRange": [100, 250],
  "topK": 8
}
```

Vantagens:

- catálogo dinâmico;
- menos itens no prompt;
- busca sob demanda.

Desvantagens:

- mais round-trips;
- maior latência;
- maior complexidade;
- dependência de tool calling confiável.

---

## 13. Prompt do sistema

```typescript
export function buildDietPlanSystemPrompt(): string {
  return `
Você é um assistente de planejamento alimentar.

Sua tarefa é montar um rascunho de plano alimentar utilizando exclusivamente os alimentos fornecidos no catálogo.

Regras obrigatórias:

- Utilize somente foodId presentes no catálogo recebido.
- Nunca invente alimentos, IDs, ingredientes ou informações nutricionais.
- Retorne somente foodId e quantityGrams para cada item.
- Utilize quantidades compatíveis com as faixas e passos informados.
- Não calcule nem informe calorias, proteínas, carboidratos, gorduras ou fibras.
- O backend calculará todos os valores nutricionais.
- Respeite integralmente alergias, exclusões e padrões alimentares.
- Preferências devem ser priorizadas, mas não são obrigatórias.
- Não remova, adicione ou renomeie as refeições recebidas.
- Cada refeição deve conter ao menos um alimento.
- Busque aproximar cada refeição de seu target.
- Distribua fontes de proteína conforme as metas recebidas.
- Evite repetir desnecessariamente o mesmo alimento.
- Monte combinações alimentares realistas e comuns no Brasil.
- Não inclua texto fora do JSON.
- Caso o catálogo não permita um plano válido, retorne status "unfeasible".

Retorne estritamente o formato definido pelo schema.
`.trim()
}
```

Evitar usar:

```text
Você é um nutricionista.
```

Preferir:

```text
Você é um assistente de planejamento alimentar.
```

O produto pode apoiar decisões, mas não deve representar o LLM como profissional habilitado.

---

## 14. Schema de resposta

```typescript
import { z } from "zod"

export const generatedDietDraftSchema =
  z.discriminatedUnion("status", [
    z.object({
      status: z.literal("ok"),

      meals: z
        .array(
          z.object({
            mealId: z.string().min(1),

            items: z
              .array(
                z.object({
                  foodId: z.string().min(1),

                  quantityGrams: z
                    .number()
                    .positive()
                    .max(1000),
                }),
              )
              .min(1),
          }),
        )
        .min(1),
    }),

    z.object({
      status: z.literal("unfeasible"),

      reason: z
        .string()
        .min(1)
        .max(500),
    }),
  ])
```

Após o parse, validar os IDs contra o catálogo enviado:

```typescript
function validateCatalogIds(
  draft: GeneratedDietDraft,
  allowedFoodIds: Set<string>,
): string[] {
  if (draft.status === "unfeasible") {
    return []
  }

  const invalidIds: string[] = []

  for (const meal of draft.meals) {
    for (const item of meal.items) {
      if (!allowedFoodIds.has(item.foodId)) {
        invalidIds.push(item.foodId)
      }
    }
  }

  return invalidIds
}
```

---

## 15. Hidratação do plano

```typescript
async function hydrateDietDraft(params: {
  draft: GeneratedDietDraft
  mealTargets: MealTarget[]
  foodsById: Map<string, Food>
}): Promise<DietPlan> {
  if (params.draft.status === "unfeasible") {
    throw new Error(params.draft.reason)
  }

  const meals = params.draft.meals.map((draftMeal) => {
    const mealTarget = params.mealTargets.find(
      (meal) => meal.id === draftMeal.mealId,
    )

    if (!mealTarget) {
      throw new Error(
        `Refeição desconhecida: ${draftMeal.mealId}`,
      )
    }

    const items = draftMeal.items.map((draftItem) => {
      const food = params.foodsById.get(
        draftItem.foodId,
      )

      if (!food) {
        throw new Error(
          `Alimento desconhecido: ${draftItem.foodId}`,
        )
      }

      return {
        foodId: food.id,
        name: food.name,
        quantityGrams: draftItem.quantityGrams,
        nutrition: computeFoodNutrition(
          food,
          draftItem.quantityGrams,
        ),
        source: food.source,
      }
    })

    const actualNutrition =
      sumItemNutrition(items)

    return {
      id: mealTarget.id,
      name: mealTarget.name,

      kcalTarget: mealTarget.kcalTarget,
      kcalActual: actualNutrition.calories,

      actualNutrition,
      items,
    }
  })

  return {
    dailyTarget: buildDailyTarget(params.mealTargets),
    dailyActual: sumMealNutrition(meals),
    meals,
  }
}
```

---

## 16. Validador

### 16.1 Tipos de problemas

```typescript
type DietValidationIssueCode =
  | "DAILY_CALORIES_OUT_OF_RANGE"
  | "MEAL_CALORIES_OUT_OF_RANGE"
  | "DAILY_PROTEIN_OUT_OF_RANGE"
  | "MEAL_PROTEIN_TOO_LOW"
  | "UNKNOWN_FOOD"
  | "FORBIDDEN_FOOD"
  | "ALLERGEN_CONFLICT"
  | "INVALID_PORTION"
  | "EMPTY_MEAL"
  | "DUPLICATE_MEAL"
  | "EXCESSIVE_REPETITION"
  | "MISSING_NUTRITIONAL_ROLE"
  | "UNREALISTIC_COMBINATION"
  | "UNKNOWN_SAFETY_ATTRIBUTE"

interface DietValidationIssue {
  code: DietValidationIssueCode
  category:
    | "STRUCTURAL"
    | "NUTRITIONAL"
    | "RESTRICTION"
    | "QUALITY"
    | "SAFETY"

  path?: string
  message: string
  expected?: unknown
  received?: unknown
  repairableLocally: boolean
}
```

### 16.2 Tolerâncias sugeridas

| Regra | Tolerância |
|---|---:|
| Calorias diárias | ±5% |
| Calorias por refeição | ±10% a ±15% |
| Proteína diária | ±5% a ±10% |
| Proteína por refeição | Mínimo configurável |
| Quantidade | Faixa definida pelo alimento |
| Passo de quantidade | 5 g ou 10 g |
| Repetição | Configurável por alimento e dia |

### 16.3 Exemplo de validação

```typescript
function validateDietPlan(input: {
  plan: DietPlan
  dailyKcalTarget: number
  mealTargets: MealTarget[]
  restrictions: NormalizedDietRestrictions
  foodCatalog: Map<string, Food>
  macroTargets?: {
    proteinGrams: number
    carbsGrams: number
    fatGrams: number
  }
}): {
  valid: boolean
  issues: DietValidationIssue[]
} {
  const issues: DietValidationIssue[] = []

  const dailyDeviation =
    Math.abs(
      input.plan.dailyActual.calories -
        input.dailyKcalTarget,
    ) / input.dailyKcalTarget

  if (dailyDeviation > 0.05) {
    issues.push({
      code: "DAILY_CALORIES_OUT_OF_RANGE",
      category: "NUTRITIONAL",
      message:
        "O total calórico diário excede a tolerância.",
      expected: input.dailyKcalTarget,
      received:
        input.plan.dailyActual.calories,
      repairableLocally: true,
    })
  }

  for (const meal of input.plan.meals) {
    const target = input.mealTargets.find(
      (candidate) => candidate.id === meal.id,
    )

    if (!target) {
      continue
    }

    if (meal.items.length === 0) {
      issues.push({
        code: "EMPTY_MEAL",
        category: "STRUCTURAL",
        path: `meals.${meal.id}`,
        message: "A refeição não possui alimentos.",
        repairableLocally: false,
      })
    }

    const mealDeviation =
      Math.abs(
        meal.kcalActual - target.kcalTarget,
      ) / target.kcalTarget

    if (mealDeviation > 0.12) {
      issues.push({
        code: "MEAL_CALORIES_OUT_OF_RANGE",
        category: "NUTRITIONAL",
        path: `meals.${meal.id}`,
        message:
          "A refeição está distante da meta calórica.",
        expected: target.kcalTarget,
        received: meal.kcalActual,
        repairableLocally: true,
      })
    }

    for (const item of meal.items) {
      const food = input.foodCatalog.get(
        item.foodId,
      )

      if (!food) {
        issues.push({
          code: "UNKNOWN_FOOD",
          category: "STRUCTURAL",
          path: `meals.${meal.id}.items`,
          message: `Alimento não encontrado: ${item.foodId}`,
          repairableLocally: false,
        })

        continue
      }

      if (
        food.portionMinGrams &&
        item.quantityGrams < food.portionMinGrams
      ) {
        issues.push({
          code: "INVALID_PORTION",
          category: "NUTRITIONAL",
          path: `meals.${meal.id}.items.${item.foodId}`,
          message:
            "Quantidade abaixo da porção mínima.",
          expected: food.portionMinGrams,
          received: item.quantityGrams,
          repairableLocally: true,
        })
      }

      if (
        food.portionMaxGrams &&
        item.quantityGrams > food.portionMaxGrams
      ) {
        issues.push({
          code: "INVALID_PORTION",
          category: "NUTRITIONAL",
          path: `meals.${meal.id}.items.${item.foodId}`,
          message:
            "Quantidade acima da porção máxima.",
          expected: food.portionMaxGrams,
          received: item.quantityGrams,
          repairableLocally: true,
        })
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}
```

---

## 17. Otimizador de porções

### 17.1 Objetivo

O otimizador deve corrigir desvios pequenos sem chamar novamente o LLM.

Exemplos:

```text
refeição 35 kcal abaixo;
proteína diária 6 g abaixo;
porção fora do passo de 10 g;
gordura 4 g acima.
```

### 17.2 Porções discretas

Cada alimento deve ter:

```typescript
interface PortionConstraints {
  minGrams: number
  maxGrams: number
  stepGrams: number
  defaultGrams: number
}
```

Exemplo:

```typescript
const ricePortions = [
  80,
  90,
  100,
  110,
  120,
  130,
  140,
  150,
]
```

### 17.3 Função de custo

```text
cost =
  calorieWeight × calorieDeviation
  + proteinWeight × proteinDeviation
  + carbWeight × carbDeviation
  + fatWeight × fatDeviation
  + portionPenalty
  + repetitionPenalty
```

Exemplo:

```typescript
function calculateOptimizationCost(params: {
  actual: NutritionTotals
  target: NutritionTotals
  portionPenalty: number
  repetitionPenalty: number
}): number {
  return (
    Math.abs(
      params.actual.calories -
        params.target.calories,
    ) * 1 +
    Math.abs(
      params.actual.proteinGrams -
        params.target.proteinGrams,
    ) * 4 +
    Math.abs(
      params.actual.carbsGrams -
        params.target.carbsGrams,
    ) * 1.5 +
    Math.abs(
      params.actual.fatGrams -
        params.target.fatGrams,
    ) * 2 +
    params.portionPenalty +
    params.repetitionPenalty
  )
}
```

### 17.4 Estratégia inicial

Para o MVP:

- gerar porções possíveis;
- testar pequenos ajustes;
- limitar o número de combinações;
- escolher a configuração de menor custo.

Não é obrigatório começar com um solver matemático externo.

Uma busca local ou greedy pode ser suficiente.

---

## 18. Estratégia de reparo

A ordem recomendada é:

```text
1. Validar estrutura.
2. Hidratar IDs.
3. Calcular nutrientes.
4. Detectar erros.
5. Corrigir localmente erros numéricos.
6. Validar novamente.
7. Chamar o LLM apenas para erros semânticos.
8. Usar fallback quando o modelo principal persistir no erro.
```

### 18.1 Matriz de tratamento

| Erro | Tratamento |
|---|---|
| Kcal ligeiramente abaixo | Ajustar gramas |
| Kcal ligeiramente acima | Reduzir gramas |
| Proteína abaixo | Aumentar fonte proteica |
| Porção fora da faixa | Limitar ou arredondar |
| Quantidade fora do passo | Arredondar |
| ID inexistente | Retry do LLM |
| Alimento proibido | Retry do LLM |
| Alergênico presente | Descartar e refazer |
| Combinação culinária ruim | Retry do LLM |
| Refeição vazia | Retry do LLM |
| Catálogo insuficiente | Retornar `unfeasible` |

### 18.2 Prompt de reparo

```typescript
function buildDietPlanRepairPrompt(input: {
  context: DietGenerationContext
  previousDraft: GeneratedDietDraft
  issues: DietValidationIssue[]
}): string {
  return `
Corrija o plano anterior.

Regras:

- Mantenha as refeições solicitadas.
- Utilize somente IDs existentes no catálogo.
- Corrija apenas os problemas informados.
- Respeite todas as restrições.
- Retorne o plano completo.
- Não explique as alterações.
- Não retorne nutrientes calculados.

CONTEXTO:
${JSON.stringify(input.context)}

PLANO ANTERIOR:
${JSON.stringify(input.previousDraft)}

ERROS:
${JSON.stringify(input.issues)}
`.trim()
}
```

---

## 19. Orquestração da geração

```typescript
async function generateDietPlan(
  params: GenerateDietPlanParams,
): Promise<DietPlan> {
  assertEligibleForAutomaticPlan(params)

  const mealTargets =
    distributeMealCalories(
      params.dailyKcalTarget,
      params.meals,
    )

  const candidateCatalog =
    await buildCandidateCatalog({
      mealTargets,
      restrictions: params.restrictions,
      preferences: params.preferences,
      macroTargets: params.macroTargets,
    })

  const generationContext = {
    dailyKcalTarget:
      params.dailyKcalTarget,
    macroTargets:
      params.macroTargets,
    mealTargets,
    restrictions:
      params.restrictions,
    preferences:
      params.preferences,
    candidateCatalog,
  }

  let previousDraft:
    | GeneratedDietDraft
    | undefined

  let previousIssues:
    DietValidationIssue[] = []

  for (let attempt = 1; attempt <= 3; attempt++) {
    const useFallback = attempt === 3

    const draft =
      await requestStructuredJson({
        label: "diet plan draft",
        schema:
          generatedDietDraftSchema,

        request: () =>
          chat({
            systemPrompt:
              buildDietPlanSystemPrompt(),

            messages: [
              {
                role: "user",

                content:
                  attempt === 1
                    ? buildDietPlanUserPrompt(
                        generationContext,
                      )
                    : buildDietPlanRepairPrompt({
                        context:
                          generationContext,
                        previousDraft:
                          previousDraft!,
                        issues:
                          previousIssues,
                      }),
              },
            ],

            temperature:
              attempt === 1
                ? 0.3
                : 0.1,

            maxTokens: 4096,
            jsonMode: true,

            model: useFallback
              ? config.fallbackModel
              : config.primaryModel,
          }),
      })

    if (draft.status === "unfeasible") {
      throw new DietPlanUnfeasibleError(
        draft.reason,
      )
    }

    const hydratedPlan =
      await hydrateDietDraft({
        draft,
        mealTargets,
        foodsById:
          candidateCatalog.foodsById,
      })

    const firstValidation =
      validateDietPlan({
        plan: hydratedPlan,
        dailyKcalTarget:
          params.dailyKcalTarget,
        mealTargets,
        restrictions:
          params.restrictions,
        foodCatalog:
          candidateCatalog.foodsById,
        macroTargets:
          params.macroTargets,
      })

    if (firstValidation.valid) {
      return hydratedPlan
    }

    const localIssues =
      firstValidation.issues.filter(
        (issue) =>
          issue.repairableLocally,
      )

    const semanticIssues =
      firstValidation.issues.filter(
        (issue) =>
          !issue.repairableLocally,
      )

    const optimizedPlan =
      localIssues.length > 0
        ? optimizeDietPlan({
            plan: hydratedPlan,
            issues: localIssues,
            targets: {
              dailyKcalTarget:
                params.dailyKcalTarget,
              macroTargets:
                params.macroTargets,
              mealTargets,
            },
            foodCatalog:
              candidateCatalog.foodsById,
          })
        : hydratedPlan

    const secondValidation =
      validateDietPlan({
        plan: optimizedPlan,
        dailyKcalTarget:
          params.dailyKcalTarget,
        mealTargets,
        restrictions:
          params.restrictions,
        foodCatalog:
          candidateCatalog.foodsById,
        macroTargets:
          params.macroTargets,
      })

    if (secondValidation.valid) {
      return optimizedPlan
    }

    previousDraft = draft
    previousIssues = [
      ...semanticIssues,
      ...secondValidation.issues,
    ]
  }

  throw new DietPlanGenerationError(
    "Não foi possível gerar um plano válido.",
  )
}
```

---

## 20. Estratégia de modelos

Sugestão operacional:

```text
Tentativa 1:
DeepSeek V4 Flash
temperature 0.3
thinking desabilitado

Correção local:
backend/otimizador

Tentativa 2:
DeepSeek V4 Flash
temperature 0.1
feedback dos erros semânticos

Tentativa 3:
modelo fallback
temperature 0.1
plano anterior + erros específicos
```

O fallback não deve ser usado apenas porque o primeiro JSON apresentou um erro simples.

Prioridade:

```text
reparo local
→ retry barato
→ fallback de qualidade
```

---

## 21. Segurança e elegibilidade

A geração automática deve aplicar um gate antes do LLM.

Casos que podem exigir bloqueio, modo informativo ou revisão profissional:

- crianças e adolescentes;
- gestação;
- lactação;
- transtornos alimentares;
- doença renal;
- doença hepática;
- diabetes medicado;
- alergias graves;
- baixo peso relevante;
- restrições clínicas complexas;
- uso de medicamentos que afetem glicemia, eletrólitos ou pressão.

Exemplo:

```typescript
interface EligibilityResult {
  mode:
    | "automatic"
    | "professional_review"
    | "informational_only"
    | "blocked"

  reasons: string[]
}
```

O gate deve ser implementado em código, não apenas no prompt.

---

## 22. Observabilidade e auditoria

Cada geração deve armazenar:

```typescript
interface DietGenerationAudit {
  requestId: string
  userId: string

  primaryModel: string
  fallbackModel?: string

  attempts: number

  promptVersion: string
  schemaVersion: string
  validatorVersion: string
  catalogVersion: string
  tbcaVersion?: string

  initialIssues: DietValidationIssue[]
  finalIssues: DietValidationIssue[]

  localOptimizationApplied: boolean
  fallbackUsed: boolean

  latencyMs: number
  tokenUsage?: {
    input: number
    output: number
  }

  createdAt: Date
}
```

Métricas úteis:

- taxa de planos válidos na primeira tentativa;
- taxa de ajustes locais;
- taxa de fallback;
- erro calórico médio;
- erro proteico médio;
- IDs inventados;
- violações de restrição;
- latência;
- custo por plano;
- alimentos mais repetidos;
- casos `unfeasible`.

---

## 23. Avaliação de qualidade

Criar um dataset de testes com perfis conhecidos.

Exemplos:

```text
1. Dieta comum sem restrições.
2. Vegetariano.
3. Vegano.
4. Sem lactose.
5. Sem glúten.
6. Alergia a amendoim.
7. Alta proteína.
8. Baixo orçamento.
9. Poucas refeições.
10. Muitas refeições.
11. Preferências incompatíveis.
12. Catálogo insuficiente.
```

Critérios:

```typescript
interface DietEvaluationResult {
  caloriesWithinTolerance: boolean
  macrosWithinTolerance: boolean
  restrictionsRespected: boolean
  allIdsValid: boolean
  portionsRealistic: boolean
  mealsComplete: boolean
  varietyScore: number
  repetitionScore: number
  culinaryCoherenceScore: number
}
```

Separar:

```text
acurácia numérica;
segurança;
validade estrutural;
qualidade alimentar;
aceitação humana.
```

---

## 24. Performance esperada

| Etapa | Tempo esperado |
|---|---:|
| Filtros SQL | <10 ms |
| Full-text/pg_trgm | 1–20 ms |
| pgvector em poucos milhares de itens | 1–20 ms |
| Cálculo nutricional | <1 ms |
| Otimização local | poucos ms a centenas de ms |
| LLM | principal gargalo |
| Retry adicional | adiciona outra chamada completa |

O retrieval não deve ser o gargalo.

A otimização local tende a ser muito mais barata que uma nova chamada ao modelo.

---

## 25. Roadmap de implementação

### Fase 1 — Fonte de verdade

- importar TBCA;
- preservar código e versão da fonte;
- normalizar nomes;
- implementar cálculo por 100 g;
- adicionar testes unitários;
- registrar alimento cru/cozido/preparado.

### Fase 2 — Catálogo operacional

- sinônimos;
- categorias;
- papéis nutricionais;
- porções mínimas e máximas;
- passo de porção;
- medidas caseiras;
- alergênicos;
- atributos alimentares;
- receitas;
- alimentos customizados.

### Fase 3 — Geração fechada

- calcular targets por refeição;
- buscar candidatos com SQL;
- limitar catálogo por refeição;
- novo schema `foodId + quantityGrams`;
- validar IDs;
- hidratar o plano;
- calcular macros no backend.

### Fase 4 — Validação

- kcal diária;
- kcal por refeição;
- macros;
- restrições;
- porções;
- repetição;
- variedade;
- refeições vazias;
- catálogo insuficiente;
- status `unfeasible`.

### Fase 5 — Otimização

- arredondamento de porções;
- ajuste local de calorias;
- ajuste de proteína;
- função de custo;
- busca local;
- registro dos ajustes.

### Fase 6 — Busca lexical

- `normalizedName`;
- sinônimos;
- PostgreSQL full-text;
- `pg_trgm`;
- ranking;
- métricas de recall.

### Fase 7 — Retrieval vetorial

- `pgvector`;
- embeddings;
- busca híbrida;
- conjunto de avaliação;
- comparação lexical versus híbrida.

### Fase 8 — Tool calling

- `searchFoods`;
- `searchEquivalentFoods`;
- `searchRecipes`;
- catálogo dinâmico;
- geração sob demanda.

### Fase 9 — Segurança e auditoria

- gate de elegibilidade;
- logs;
- versões;
- métricas;
- alertas;
- revisão profissional.

---

## 26. Estrutura sugerida de arquivos

```text
src/
├── lib/
│   ├── ai/
│   │   ├── clients/
│   │   ├── prompts/
│   │   │   ├── diet-plan-system.ts
│   │   │   ├── diet-plan-user.ts
│   │   │   └── diet-plan-repair.ts
│   │   ├── schemas/
│   │   │   └── diet-plan-draft.schema.ts
│   │   └── generate-diet-draft.ts
│   │
│   ├── nutrition/
│   │   ├── calculations/
│   │   │   ├── compute-food-nutrition.ts
│   │   │   ├── compute-recipe-nutrition.ts
│   │   │   ├── distribute-meal-targets.ts
│   │   │   └── sum-nutrition.ts
│   │   │
│   │   ├── catalog/
│   │   │   ├── food-repository.ts
│   │   │   ├── recipe-repository.ts
│   │   │   ├── candidate-builder.ts
│   │   │   └── household-measures.ts
│   │   │
│   │   ├── retrieval/
│   │   │   ├── lexical-search.ts
│   │   │   ├── vector-search.ts
│   │   │   ├── hybrid-rank.ts
│   │   │   └── search-foods.ts
│   │   │
│   │   ├── validation/
│   │   │   ├── plan-validator.ts
│   │   │   ├── restriction-validator.ts
│   │   │   ├── portion-validator.ts
│   │   │   └── quality-validator.ts
│   │   │
│   │   ├── optimization/
│   │   │   ├── optimize-plan.ts
│   │   │   ├── optimize-meal.ts
│   │   │   ├── portion-options.ts
│   │   │   └── cost-function.ts
│   │   │
│   │   ├── safety/
│   │   │   └── eligibility-gate.ts
│   │   │
│   │   └── orchestration/
│   │       ├── create-diet-plan.ts
│   │       ├── hydrate-diet-draft.ts
│   │       └── repair-diet-plan.ts
│   │
│   └── observability/
│       └── diet-generation-audit.ts
│
├── scripts/
│   ├── tbca-import.ts
│   ├── generate-food-synonyms.ts
│   ├── generate-food-embeddings.ts
│   └── validate-food-catalog.ts
│
└── prisma/
    └── schema.prisma
```

---

## 27. Decisões recomendadas para o MVP

Implementar agora:

```text
TBCA importada
cálculo determinístico
targets por refeição
catálogo fechado
foodId + gramas
validação
ajuste local
sinônimos
full-text/pg_trgm
receitas básicas
medidas caseiras
```

Deixar para evolução:

```text
pgvector
tool calling
reranking avançado
solver matemático externo
aprendizado com histórico
personalização automática de porções
```

---

## 28. Veredito

A arquitetura recomendada é:

```text
LLM para composição
+
backend para nutrientes
+
validador para garantias
+
otimizador para ajustes
+
retrieval para identificação e ranking
```

Os pontos mais importantes são:

1. `kcalTarget` deve existir antes da geração.
2. `kcalActual` deve ser calculado depois da geração.
3. O LLM deve retornar somente `foodId` e gramas.
4. Nutrientes devem vir da TBCA, receitas ou alimentos cadastrados.
5. Restrições devem ser estruturadas e filtradas antes do LLM.
6. Embeddings devem complementar, não substituir, filtros nutricionais.
7. Desvios numéricos devem ser corrigidos localmente antes de um retry.
8. Receitas e medidas caseiras devem fazer parte do domínio.
9. IDs, porções e regras precisam de validação determinística.
10. Casos clínicos e de risco devem passar por um gate específico.

Essa estrutura reduz alucinação, melhora a auditabilidade, diminui custo com retries e permite evoluir o sistema sem acoplar a qualidade nutricional ao modelo de IA utilizado.
