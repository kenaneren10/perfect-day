import { describe, it, expect, beforeEach, vi } from 'vitest'
import { calculateTDEE, applyGoalAdjustment, deriveMacroTargets, calcPortionNutrients } from './tdee'

describe('calculateTDEE', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01'))
  })

  it('calculates BMR and TDEE for a male', () => {
    // Male, 80kg, 180cm, born 1990 → age 36
    // BMR = 10*80 + 6.25*180 - 5*36 + 5 = 800 + 1125 - 180 + 5 = 1750
    // TDEE sedentary = 1750 * 1.2 = 2100
    const { bmr, tdee } = calculateTDEE(80, 180, 1990, 'male', 'sedentary')
    expect(bmr).toBe(1750)
    expect(tdee).toBe(2100)
  })

  it('calculates BMR and TDEE for a female', () => {
    // Female, 60kg, 165cm, born 1995 → age 31
    // BMR = 10*60 + 6.25*165 - 5*31 - 161 = 600 + 1031.25 - 155 - 161 = 1315.25 → 1315
    // TDEE moderately_active = 1315 * 1.55 = 2038.25 → 2038
    // BMR = 10*60 + 6.25*165 - 5*31 - 161 = 1315.25 → rounds to 1315
    // TDEE = Math.round(1315.25 * 1.55) = Math.round(2038.64) = 2039
    const { bmr, tdee } = calculateTDEE(60, 165, 1995, 'female', 'moderately_active')
    expect(bmr).toBe(1315)
    expect(tdee).toBe(2039)
  })

  it('applies correct multiplier for very_active', () => {
    const { tdee } = calculateTDEE(75, 175, 1990, 'male', 'very_active')
    const { bmr } = calculateTDEE(75, 175, 1990, 'male', 'sedentary')
    expect(tdee).toBe(Math.round(bmr * 1.725))
  })

  it('applies correct multiplier for extra_active', () => {
    const { tdee } = calculateTDEE(75, 175, 1990, 'male', 'extra_active')
    const { bmr } = calculateTDEE(75, 175, 1990, 'male', 'sedentary')
    expect(tdee).toBe(Math.round(bmr * 1.9))
  })
})

describe('applyGoalAdjustment', () => {
  it('subtracts 500 kcal for weight_loss', () => {
    expect(applyGoalAdjustment(2500, 'weight_loss')).toBe(2000)
  })

  it('enforces minimum 1200 kcal floor for weight_loss', () => {
    expect(applyGoalAdjustment(1600, 'weight_loss')).toBe(1200)
  })

  it('adds 300 kcal for muscle_gain', () => {
    expect(applyGoalAdjustment(2500, 'muscle_gain')).toBe(2800)
  })

  it('returns TDEE unchanged for maintenance goals', () => {
    expect(applyGoalAdjustment(2500, 'fitness')).toBe(2500)
    expect(applyGoalAdjustment(2500, 'flexibility')).toBe(2500)
    expect(applyGoalAdjustment(2500, null)).toBe(2500)
  })
})

describe('deriveMacroTargets', () => {
  it('derives protein based on 2g per kg bodyweight', () => {
    const { protein_g } = deriveMacroTargets(2000, 75)
    expect(protein_g).toBe(150) // 75 * 2
  })

  it('derives fat at 25% of calories', () => {
    const { fat_g } = deriveMacroTargets(2000, 75)
    // 25% of 2000 = 500 kcal / 9 = 55.5 → 56
    expect(fat_g).toBe(56)
  })

  it('carbs fill the remaining calories', () => {
    const { protein_g, fat_g, carbs_g } = deriveMacroTargets(2000, 75)
    const totalKcal = protein_g * 4 + fat_g * 9 + carbs_g * 4
    expect(totalKcal).toBeCloseTo(2000, 0)
  })

  it('does not produce negative carbs for high protein/fat ratios', () => {
    const { carbs_g } = deriveMacroTargets(1200, 120)
    expect(carbs_g).toBeGreaterThanOrEqual(0)
  })
})

describe('calcPortionNutrients', () => {
  const per100g = { kcal: 400, protein: 20, carbs: 50, fat: 10 }

  it('returns correct values for 100g serving', () => {
    const result = calcPortionNutrients(per100g, 100)
    expect(result.kcal).toBe(400)
    expect(result.protein_g).toBe(20)
    expect(result.carbs_g).toBe(50)
    expect(result.fat_g).toBe(10)
  })

  it('scales correctly for 50g serving', () => {
    const result = calcPortionNutrients(per100g, 50)
    expect(result.kcal).toBe(200)
    expect(result.protein_g).toBe(10)
    expect(result.carbs_g).toBe(25)
    expect(result.fat_g).toBe(5)
  })

  it('scales correctly for 250g serving', () => {
    const result = calcPortionNutrients(per100g, 250)
    expect(result.kcal).toBe(1000)
    expect(result.protein_g).toBe(50)
    expect(result.carbs_g).toBe(125)
    expect(result.fat_g).toBe(25)
  })

  it('rounds to 1 decimal place', () => {
    const result = calcPortionNutrients({ kcal: 100, protein: 10, carbs: 10, fat: 10 }, 33)
    expect(result.kcal.toString()).toMatch(/^\d+(\.\d)?$/)
  })
})
