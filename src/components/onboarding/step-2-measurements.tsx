"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step2Data {
  weight?: number
  height?: number
}

interface Step2Props {
  data: Partial<Step2Data>
  onChange: (field: "weight" | "height", value: string) => void
  errors: Partial<Record<"weight" | "height", string>>
}

export function Step2Measurements({ data, onChange, errors }: Step2Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Weight */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="weight">Peso</Label>
        <div className="relative">
          <Input
            id="weight"
            type="number"
            inputMode="decimal"
            placeholder="70"
            value={data.weight ?? ""}
            onChange={(e) => onChange("weight", e.target.value)}
            aria-invalid={!!errors.weight}
            className="h-12 rounded-xl px-4 pr-12 text-base"
            min={30}
            max={300}
            step={0.1}
          />
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
            kg
          </span>
        </div>
        {errors.weight && (
          <p className="text-sm text-destructive">{errors.weight}</p>
        )}
      </div>

      {/* Height */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="height">Altura</Label>
        <div className="relative">
          <Input
            id="height"
            type="number"
            inputMode="numeric"
            placeholder="170"
            value={data.height ?? ""}
            onChange={(e) => onChange("height", e.target.value)}
            aria-invalid={!!errors.height}
            className="h-12 rounded-xl px-4 pr-12 text-base"
            min={100}
            max={250}
            step={1}
          />
          <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-muted-foreground">
            cm
          </span>
        </div>
        {errors.height && (
          <p className="text-sm text-destructive">{errors.height}</p>
        )}
      </div>
    </div>
  )
}
