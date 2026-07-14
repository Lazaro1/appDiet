"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface WeeklyCalorieChartProps {
  days: Array<{ date: string; consumed: number; target: number }>
}

export function WeeklyCalorieChart({ days }: WeeklyCalorieChartProps) {
  const labels = days.map((d) => {
    const date = new Date(d.date + "T12:00:00")
    return date.toLocaleDateString("pt-BR", { weekday: "short" })
  })

  const data = {
    labels,
    datasets: [
      {
        label: "Consumido",
        data: days.map((d) => d.consumed),
        backgroundColor: "oklch(0.55 0.12 180)",
        borderRadius: 4,
      },
      {
        label: "Meta",
        data: days.map((d) => d.target),
        backgroundColor: "oklch(0.85 0.02 180)",
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const },
    },
    scales: {
      y: { beginAtZero: true },
    },
  }

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  )
}
