# AppDiet — Resumo da Ideia

## O Problema

Pacientes em dieta têm baixa adesão. Recebem um plano alimentar do nutricionista, mas na prática: esquecem de comer no horário, não têm os ingredientes da receita, fazem trocas ruins, e perdem a noção de quanto consumiram no dia. Sem acompanhamento diário, a dieta vira um papel guardado na gaveta.

## A Solução

AppDiet é um assistente de nutrição que acompanha o paciente **refeição por refeição**, todos os dias. Combina um app web com notificações via WhatsApp para garantir que o paciente siga a dieta — e quando não puder seguir, sugere alternativas inteligentes que não fujam da meta.

## Como Funciona

### 1. Onboarding

O paciente se cadastra (login com Google) e responde um formulário rápido com 5 passos:

1. **Dados básicos** — nome, idade, sexo
2. **Medidas** — peso, altura
3. **Objetivo e atividade** — perder/ganhar/manter peso, nível de exercício
4. **Restrições e preferências** — alergias, intolerâncias, o que gosta e não gosta
5. **Rotina** — quantas refeições por dia, horários preferidos

Com esses dados, o app calcula automaticamente o gasto calórico basal (Mifflin-St Jeor), o gasto total (TDEE), e a meta calórica diária (déficit para perda, superávit para ganho, manutenção).

### 2. Criando a Dieta

O paciente escolhe como a dieta entra no sistema:

- **Gerar pela IA** — o app cria um plano alimentar completo com base no perfil
- **Importar do nutricionista** — o paciente cola o texto da dieta que recebeu (do WhatsApp, de uma foto, etc.) e a IA faz o parsing estruturado

Em ambos os casos, o paciente **revisa todas as refeições antes de ativar** o plano. Pode pedir ajustes no chat antes de confirmar.

A dieta fica organizada como um **plano diário que se repete**, com cada refeição tendo uma **janela de tempo** (ex: almoço das 11h às 14h).

### 3. O Dia a Dia

#### Lembretes via WhatsApp

No horário de cada refeição, o paciente recebe um lembrete no WhatsApp. Pode responder diretamente:

- **"comi arroz, feijão e frango"** → a IA faz o parsing, calcula calorias, e responde com a confirmação
- **"pulei"** → marca como pulada, sem julgamento
- **"78.5"** → registra como peso (lembrete diário pela manhã)

Para trocas e conversas mais longas, o paciente é direcionado ao app.

#### No App — Dashboard

A tela principal mostra tudo de uma vez:

- **Barra de calorias do dia** — quanto consumiu vs meta
- **Barra de calorias da semana** — se está em déficit, superávit ou manutenção
- **Lista de refeições do dia** — com status (feita, pendente, perdida)
- **Gráfico de progresso de peso**
- **Botão de chat com a IA**

#### Registrando uma Refeição

O paciente abre a refeição pendente e digita o que comeu em texto livre: *"comi arroz, feijão, frango grelhado e salada"*. A IA:

1. Faz o parsing dos alimentos e estima porções
2. Consulta a TBCA (tabela brasileira de alimentos) para valores nutricionais precisos
3. Calcula calorias e macronutrientes
4. Mostra o resultado: *"580 kcal de 600 kcal meta. Bom almoço!"*

#### Troca de Alimentos

Se o paciente não tem um ingrediente ou quer variar, tem duas opções:

- **Botão "Trocar"** na refeição → a IA sugere alternativas equivalentes
- **Chat livre** → *"não tenho frango, tenho ovo e queijo, o que posso fazer?"* → a IA sugere com base nos ingredientes disponíveis

A IA sempre mantém a meta calórica e de macronutrientes da refeição.

### 4. Quando as Coisas Dão Errado

O app não pune. Se o paciente pular uma refeição ou comer fora do plano:

- Registra o desvio
- Mostra o impacto no contexto semanal: *"Hoje ficou 300 kcal acima da meta, mas sua semana ainda está em déficit de 1.200 kcal!"*
- Reforço positivo, sem julgamento

### 5. Progresso

O paciente acompanha:

- **Calorias diárias** — barra de progresso com saldo do dia
- **Calorias semanais** — se a semana está em déficit, superávit ou manutenção
- **Peso** — gráfico ao longo do tempo (registrado via WhatsApp ou app)
- **Adesão** — taxa de registro (% de refeições registradas) e taxa de conformidade (% dentro de ±10% da meta)

## A IA

O tom da IA é **prático e direto**, como um amigo que entende de nutrição. Sem jargão, sem enrolação, sem julgamento. Exemplos:

- *"Tá, sem frango? Que tal ovo cozido — mesma proteína, 200 kcal a menos, bom pra fechar o almoço."*
- *"Registrado! 580 kcal de 600 kcal. Sobrou 20 kcal, tá no caminho certo."*
- *"Hoje passou um pouco, mas olha a semana: você tá 1.200 kcal em déficit. Continue assim!"*

O modelo primário é DeepSeek V4 Flash (via OpenRouter), com fallback para GPT-4o-mini se o primário estiver indisponível. Respostas em streaming para velocidade percebida.

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Front-end + Back-end | Next.js (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| Banco de dados | PostgreSQL + Prisma ORM |
| Autenticação | Clerk (Google login) |
| IA | OpenRouter (DeepSeek V4 Flash + GPT-4o-mini fallback) |
| Alimentos | TBCA importada no PostgreSQL |
| WhatsApp | WAHA (self-hosted, Docker) → Z-API no futuro |
| Deploy | VPS único (Hetzner/DigitalOcean, São Paulo) |
| Estado no cliente | React Query + estado local |

## O Que Não É (No MVP)

- App nativo (iOS/Android) — é web app responsivo
- Despensa persistente de ingredientes
- Plano semanal com variação por dia
- Análise de fotos de refeições
- Dashboard para nutricionistas
- Pagamento/freemium
- Suporte a outros idiomas além de pt-BR
- Memória de conversas entre dias

## O Que Vem Depois

1. Despensa persistente
2. Plano semanal
3. Freemium (plano gratuito limitado + pago)
4. Migração WhatsApp para Z-API (número business)
5. Compartilhamento com nutricionista
6. Fotos de refeições (opcional)
7. Memória de conversas entre dias
8. i18n (inglês, espanhol)
9. App nativo (React Native/Expo)
10. Dashboard para nutricionistas (B2B2C)