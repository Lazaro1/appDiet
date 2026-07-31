# AppDiet — Proposta de Arquitetura Nutricional com TBCA + RAG

> Última atualização: Julho 2026

## 1. Resumo

Esta proposta separa responsabilidades entre **LLM**, **backend** e **validador** para aumentar a acurácia calórica e a qualidade dos planos alimentares.

| Camada | Responsabilidade | Ganho principal |
|--------|------------------|-----------------|
| **LLM** | Composição do plano (`foodId` + gramas) | Foco em escolha alimentar, variedade e preferências |
| **Backend** | Cálculo determinístico de kcal e macros | Uma fonte de verdade (TBCA), sem alucinação numérica |
| **Validador** | Restrições, porções e tolerâncias | Garantias que o LLM não cumpre sozinho |
| **RAG (TBCA)** | Busca semântica de alimentos | Match rápido e preciso entre texto livre e `foodId` |

---

## 2. Problema Atual

Hoje o LLM gera tudo de uma vez: nome do alimento, gramas, kcal e macros estimados. O prompt pede coerência com a TBCA, mas o modelo **não consulta a tabela** — apenas estima.

```typescript
// src/lib/ai/types.ts — contrato atual
interface ParsedFoodItem {
  foodName: string
  estimatedGrams: number
  estimatedKcal: number
  estimatedProtein: number
  estimatedCarbs: number
  estimatedFat: number
}
```

O schema do banco já prevê `foodId` referenciando `TBACFood`, mas o mapeamento ainda não usa isso:

```typescript
// src/lib/diet/map-ai-plan.ts — foodId nunca é preenchido
export function mapFoodItemToMealItem(item: ParsedFoodItem) {
  return {
    name: item.foodName,
    quantity: item.estimatedGrams,
    unit: "g",
    kcal: item.estimatedKcal,
    protein: item.estimatedProtein,
    carbs: item.estimatedCarbs,
    fat: item.estimatedFat,
  }
}
```

Há um comentário em `src/lib/ai/parsers.ts` indicando fuzzy matching futuro com TBCA, mas ainda não implementado. O script `prisma/seed/tbca-import.ts` está previsto na arquitetura, mas não existe no repositório.

---

## 3. Arquitetura Proposta

```
                    ┌─────────────────────────────────┐
                    │         TBCA (PostgreSQL)        │
                    │  id, name, category, macros...   │
                    │  embedding vector(1536)          │  ← pgvector
                    │  tags: [sem_lactose, vegano...]  │
                    └──────────────┬──────────────────┘
                                   │
     "arroz integral cozido"        │  top-K (5–15)
     "frango desfiado"       ─────►│  busca híbrida
     "iogurte natural"              │
                                   ▼
┌──────────┐   candidatos     ┌──────────┐   foodId+grams   ┌──────────┐
│   LLM    │ ◄─────────────── │   RAG    │ ───────────────► │ Backend  │
│ (escolhe │                  │ (busca)  │                  │ (macros) │
│  + gramas)│                  └──────────┘                  └────┬─────┘
└──────────┘                                                       │
                                                                   ▼
                                                            ┌──────────┐
                                                            │Validador │
                                                            └────┬─────┘
                                                                 │
                                                      falhou? ───┴───► retry / ajuste
                                                                 │
                                                                 ▼
                                                            Plano final
```

### 3.1 Contrato do LLM (novo)

O LLM deixa de estimar nutrientes. Retorna apenas composição:

```json
{
  "meals": [
    {
      "name": "Almoço",
      "items": [
        { "foodId": "tbca_123", "grams": 150 },
        { "foodId": "tbca_456", "grams": 80 }
      ]
    }
  ]
}
```

### 3.2 Backend (cálculo determinístico)

```typescript
function computeNutrients(food: TBACFood, grams: number) {
  const factor = grams / 100
  return {
    kcal: food.kcalPer100g * factor,
    protein: food.proteinPer100g * factor,
    carbs: food.carbsPer100g * factor,
    fat: food.fatPer100g * factor,
    fiber: (food.fiberPer100g ?? 0) * factor,
  }
}
```

O `kcalTarget` de cada refeição passa a ser **derivado** da soma dos itens, não estimado pelo LLM.

### 3.3 Validador

Regras que o backend aplica após o cálculo:

| Regra | Tolerância / critério |
|-------|----------------------|
| Kcal da refeição | ±10% do target (já existe `isConformant` em `meal-status.ts`) |
| Kcal diária total | ±5% da meta do usuário |
| Gramas por item | Faixas realistas por categoria (ex.: arroz 80–200g no almoço) |
| Restrições alimentares | Tags estruturadas por alimento (não string matching) |
| Proteína por refeição | Mínimo configurável por objetivo (lose/gain/maintain) |
| Variedade | Não repetir o mesmo alimento em todas as refeições |
| IDs válidos | `foodId` deve existir no catálogo |

### 3.4 Estratégia de reparo quando o validador falha

| Estratégia | Prós | Contras |
|------------|------|---------|
| Retry LLM com feedback | Simples | Lento, caro, pode loopar |
| Ajuste local de gramas (±5–15%) | Rápido, barato | Pode distorcer porções |
| Otimizador (atingir meta mantendo alimentos) | Preciso | Mais complexo |
| **Híbrido (recomendado)** | Melhor custo/benefício | Mais código |

Fluxo recomendado: 1–2 retries do LLM com erros específicos → ajuste fino de gramas no backend.

---

## 4. RAG com Embeddings na TBCA

### 4.1 O que o RAG resolve

| Problema | RAG ajuda? |
|----------|------------|
| LLM inventa kcal/macros | ✅ Indiretamente — nutrientes saem do backend |
| LLM inventa `foodId` | ✅ Busca retorna IDs reais |
| "frango grelhado" → item correto da TBCA | ✅ Similaridade semântica |
| "2 colheres de arroz" → gramas | ❌ Ainda é trabalho do LLM |
| "crepioca", pratos fora da TBCA | ❌ Precisa de receitas customizadas |
| Validar restrições (sem glúten) | ❌ Precisa de tags no catálogo |

### 4.2 Stack sugerida

```
Prisma + PostgreSQL
  └── extensão pgvector
  └── TBACFood.embedding (vector 1536)
  └── TBACFood.searchText (tsvector, gerado)
  └── TBACFood.tags (text[])

src/lib/nutrition/
  ├── tbca-search.ts      # busca híbrida
  ├── compute-nutrients.ts
  └── plan-validator.ts

scripts/
  └── tbca-import.ts      # importa CSV + gera embeddings + sinônimos
```

**pgvector** no PostgreSQL existente evita serviços externos (Pinecone, Qdrant) no MVP. Com ~5–7 mil alimentos na TBCA, busca com índice HNSW fica em **<10ms**.

### 4.3 Indexação de cada alimento

O embedding não deve ser só o nome. Montar texto rico para melhor recall:

```
Frango, peito, sem pele, grelhado
Categoria: carnes e derivados
Sinônimos: frango grelhado, peito de frango, filé de frango
Preparo: grelhado
Porção típica: 120g
Macros/100g: 159 kcal, 32g proteína, 0g carb, 3g gordura
```

Sinônimos curados (mesmo que poucos) valem mais que modelo de embedding caro.

### 4.4 Busca híbrida (embedding + lexical)

Só embedding falha em casos específicos:

| Query | Problema do embedding puro |
|-------|---------------------------|
| Código TBCA | Precisa match exato |
| "ovo" | Retorna muitos tipos parecidos |
| "iogurte" vs "iogurte grego" | Precisa desambiguar |

Combinar:

```
score_final = 0.7 × cosine_similarity + 0.3 × ts_rank(nome, query)
```

PostgreSQL já suporta `tsvector` (full-text) e `pg_trgm` (fuzzy). Com pgvector, cobre semântica e match exato.

### 4.5 Contrato do serviço de busca

```typescript
interface TbcaSearchResult {
  foodId: string
  name: string
  score: number        // 0–1 confidence
  kcalPer100g: number
  portionDefault?: number
}

async function searchTbca(params: {
  query: string
  restrictions?: string[]
  category?: string
  topK?: number
  minScore?: number    // default 0.75
}): Promise<TbcaSearchResult[]>
```

### 4.6 Dois modos de uso do RAG

#### Modo 1: Tool calling (melhor para geração de plano)

O LLM chama uma ferramenta durante a geração:

```
searchFoods({
  query: "proteína magra café da manhã",
  restrictions: ["sem_lactose"],
  kcalRange: [100, 300],
  topK: 10
})
```

**Vantagens:** catálogo dinâmico, não estoura contexto, busca sob demanda.  
**Desvantagem:** mais round-trips (latência), precisa de suporte a tools no provider.

#### Modo 2: Pré-retrieval (recomendado para MVP)

Antes de chamar o LLM, o backend busca candidatos por refeição:

```typescript
const candidates = await searchTbca({
  query: `${mealType} ${preferences} ${restrictions}`,
  topK: 80,
})

// Prompt recebe só esses IDs + nomes + porção típica
// LLM escolhe entre lista fechada
```

**Vantagens:** um único call ao LLM, schema simples, fácil de validar.  
**Desvantagem:** lista pode ficar grande; precisa filtrar bem por refeição.

---

## 5. Fluxos por Feature

| Feature | Fluxo |
|---------|-------|
| **Gerar plano** | Pré-busca por refeição → LLM escolhe `foodId + grams` → backend calcula → validador |
| **Parse refeição** | LLM extrai nomes livres → RAG faz match → confidence < 0.8 → retry ou confirmação |
| **Import dieta** | Mesmo do parse, com suporte a "Opção A/B" |
| **Swap** | RAG busca equivalentes calóricos na mesma categoria |

Para pratos compostos no import (panqueca, crepioca), manter fallback:

- `foodId: null` + nome livre + macros de receita cadastrada, ou
- Tabela `Recipe` / `CustomFood` com embedding próprio

---

## 6. Performance Esperada

| Etapa | Tempo típico |
|-------|--------------|
| Embedding da query (API) | 50–150ms |
| pgvector top-10 em ~6k vetores | 1–10ms |
| Cálculo de macros (determinístico) | <1ms |
| Geração do plano (LLM) | 3–15s (dominante) |

O RAG **não é o gargalo** — a geração do LLM é. Embeddings dos alimentos TBCA são pré-computados no import; só a query do usuário precisa de embedding em runtime. Queries comuns ("arroz", "frango", "ovo") podem ser cacheadas.

---

## 7. Comparativo de Abordagens

| Abordagem | Acurácia | Velocidade | Complexidade |
|-----------|----------|------------|--------------|
| LLM estima tudo (atual) | Baixa | Rápida | Baixa |
| Lista fixa no prompt | Média | Média | Baixa |
| Fuzzy string (Levenshtein) | Média | Muito rápida | Baixa |
| **RAG embedding** | **Alta** | Rápida | Média |
| RAG + hybrid + rerank | Muito alta | Rápida | Média-alta |

Para TBCA em português (nomes técnicos vs. coloquiais), **RAG híbrido** é o sweet spot.

---

## 8. Desafios e Mitigações

### 8.1 Como o LLM escolhe `foodId`?

A TBCA tem milhares de itens — não cabe tudo no prompt.

- **MVP:** catálogo curado por refeição (80–150 alimentos filtrados por restrições/preferências)
- **Evolução:** tool calling com `searchFoods()`
- **Parse/import:** RAG pós-extração de nomes pelo LLM

### 8.2 Alucinação de IDs

Mesmo com `jsonMode`, o modelo inventa IDs. Validar com Zod + `catalog.has(id)` e loop de correção.

### 8.3 Gramas continuam sendo ponto fraco

Backend calcula kcal com precisão, mas só se os gramas estiverem corretos.

Mitigações:

- Usar `portionDefault` da TBCA como âncora
- Validador com faixas por categoria
- Arredondar para múltiplos de 5g ou 10g

### 8.4 Restrições estruturadas

Hoje restrições são texto livre (`"sem glúten, vegano"`). Enriquecer `TBACFood`:

```typescript
tags: ["contains_gluten", "contains_lactose", "animal_product"]
```

Filtrar **antes** da busca vetorial:

```sql
WHERE NOT (tags && ARRAY['contains_lactose'])
ORDER BY embedding <=> $query
LIMIT 15
```

### 8.5 Alimentos fora da TBCA

Criar `CustomFood` ou `Recipe` para pratos compostos. RAG retorna score baixo → fallback para item composto.

### 8.6 Qualidade da composição

Separar cálculo melhora acurácia numérica, mas não garante plano **bom** (variedade, praticidade, combinações brasileiras). O validador deve incluir regras de qualidade além de tolerância calórica.

### 8.7 Custo de embeddings

- Indexar ~6k alimentos: ~$0.01 com modelos baratos (ex.: text-embedding-3-small)
- Queries em runtime: centavos por mil
- Alternativa: modelo local (`all-MiniLM`) para zero custo recorrente

---

## 9. Schema Prisma (extensões sugeridas)

```prisma
model TBACFood {
  id              String   @id @default(cuid())
  name            String
  category        String?
  kcalPer100g     Float
  proteinPer100g  Float
  carbsPer100g    Float
  fatPer100g      Float
  fiberPer100g    Float?
  portionDefault  Float?
  portionUnit     PortionUnit?
  tags            String[] @default([])
  synonyms        String[] @default([])
  searchText      String?  // texto usado para gerar embedding
  // embedding       Unsupported("vector(1536)")?  // via pgvector + raw SQL

  mealItems MealItem[]

  @@index([name])
}
```

> Nota: Prisma ainda tem suporte limitado a `vector`. Usar `$queryRaw` para buscas ou extensão community até suporte nativo.

---

## 10. Roadmap de Implementação

| Fase | Entrega | Dependências |
|------|---------|--------------|
| **1** | Script `tbca-import.ts` — popular TBCA no PostgreSQL | CSV/fonte TBCA |
| **2** | `compute-nutrients.ts` — cálculo determinístico por `foodId + grams` | Fase 1 |
| **3** | pgvector + embeddings no import + `tbca-search.ts` híbrido | Fase 1 |
| **4** | Novo schema LLM (`foodId + grams`) + lista pré-filtrada no prompt | Fases 2, 3 |
| **5** | `plan-validator.ts` + loop de retry/ajuste | Fase 4 |
| **6** | RAG no parse/import (`parsers.ts`) + confidence threshold | Fase 3 |
| **7** | Tags de restrição + filtro no retrieval | Curadoria manual ou LLM batch |
| **8** | Tool calling `searchFoods` (opcional) | Fases 3–5 estáveis |

---

## 11. Integração com Código Existente

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `src/lib/ai/types.ts` | Novo tipo `PlannedFoodItem { foodId, grams }` |
| `src/lib/ai/prompts.ts` | Remover regras de estimativa de macros; instruir `foodId + grams` |
| `src/lib/ai/json-response.ts` | Novo schema Zod; validar IDs contra catálogo |
| `src/lib/diet/map-ai-plan.ts` | Resolver `foodId` → nome + macros via backend |
| `src/lib/diet/create-plan.ts` | Orquestrar busca → LLM → cálculo → validação |
| `src/lib/ai/parsers.ts` | Implementar RAG match pós-extração |
| `prisma/schema.prisma` | Campos `tags`, `synonyms`, suporte pgvector |

### O que permanece

- `isConformant()` em `src/lib/nutrition/meal-status.ts` (±10%)
- `calculateMacros()` em `src/lib/nutrition/macros.ts` (metas diárias por objetivo)
- `MealItem.foodId` opcional no schema — passa a ser obrigatório na geração

---

## 12. Veredito

A separação **LLM (composição) + Backend (nutrientes) + Validador (regras) + RAG (match TBCA)** é a direção correta para o AppDiet:

1. **Acurácia calórica** — macros sempre da TBCA, nunca alucinados
2. **Match semântico** — "frango grelhado" encontra o item certo
3. **Velocidade** — busca em ms, sem mandar milhares de alimentos no prompt
4. **Validação fechada** — `foodId` sempre existe no banco

O maior investimento não é o vector search em si — é **enriquecer o catálogo** (sinônimos, tags de restrição, porções típicas, receitas compostas). Sem isso, até o melhor embedding erra em casos como "sem glúten" ou pratos que não existem na TBCA.

---

## 13. Referências no Repositório

- `docs/ARCHITECTURE.md` — modelo `TBACFood` e fluxos gerais
- `prisma/schema.prisma` — `MealItem.foodId`, `TBACFood`
- `src/lib/ai/prompts.ts` — prompts atuais com estimativa TBCA pelo LLM
- `src/lib/nutrition/meal-status.ts` — `isConformant()` (±10%)
- `src/lib/ai/parsers.ts` — placeholder para fuzzy matching TBCA
