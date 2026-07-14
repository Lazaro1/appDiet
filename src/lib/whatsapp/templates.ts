/** WhatsApp message templates sent by the app */

export function mealReminder(mealName: string): string {
  return `Hora do ${mealName}! 🍽️ Não esqueça de registrar o que comeu.`
}

export function mealWindowClosing(mealName: string): string {
  return `Quase acabou a janela do ${mealName}. Já comeu?`
}

export function weightReminder(): string {
  return `Bom dia! 😊 Qual seu peso hoje?`
}

export function mealRegistered(kcal: number, target: number): string {
  const diff = target - kcal
  if (Math.abs(diff) <= target * 0.1) {
    return `Registrado! ${kcal} kcal de ${target} kcal meta. Na meta! 👍`
  }
  if (diff > 0) {
    return `Registrado! ${kcal} kcal de ${target} kcal meta. Sobrou ${diff} kcal.`
  }
  return `Registrado! ${kcal} kcal de ${target} kcal meta. ${Math.abs(diff)} kcal acima.`
}

export function weightRegistered(weight: number, previousWeight?: number): string {
  if (previousWeight) {
    const diff = weight - previousWeight
    const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)
    return `Registrado! ${weight} kg (${diffStr} kg). Continue assim! 💪`
  }
  return `Registrado! ${weight} kg. Continue assim! 💪`
}
