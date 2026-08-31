/**
 * Diretrizes do Ministério da Saúde e Institute of Medicine (IOM)
 * para Ganho de Peso Gestacional Baseado no IMC Pré-Gestacional
 */

export const BMI_CATEGORIES = {
  baixo_peso: {
    label: 'Abaixo do peso',
    range: 'IMC < 18.5',
    totalGainMin: 12.5,
    totalGainMax: 18.0,
    trimester1Min: 0.5,
    trimester1Max: 2.0,
    weeklyRateMin: 0.44,
    weeklyRateMax: 0.58,
    color: '#3b82f6',
  },
  peso_normal: {
    label: 'Peso normal / Adequado',
    range: 'IMC 18.5 - 24.9',
    totalGainMin: 11.5,
    totalGainMax: 16.0,
    trimester1Min: 0.5,
    trimester1Max: 2.0,
    weeklyRateMin: 0.35,
    weeklyRateMax: 0.50,
    color: '#10b981',
  },
  sobrepeso: {
    label: 'Sobrepeso',
    range: 'IMC 25.0 - 29.9',
    totalGainMin: 7.0,
    totalGainMax: 11.5,
    trimester1Min: 0.5,
    trimester1Max: 2.0,
    weeklyRateMin: 0.23,
    weeklyRateMax: 0.33,
    color: '#f59e0b',
  },
  obesidade: {
    label: 'Obesidade',
    range: 'IMC ≥ 30.0',
    totalGainMin: 5.0,
    totalGainMax: 9.0,
    trimester1Min: 0.5,
    trimester1Max: 2.0,
    weeklyRateMin: 0.17,
    weeklyRateMax: 0.27,
    color: '#ef4444',
  },
};

export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  if (heightM <= 0) return null;
  const bmi = weightKg / (heightM * heightM);
  return Number(bmi.toFixed(1));
}

export function getBMICategoryKey(bmi) {
  if (bmi === null || bmi === undefined) return 'peso_normal';
  if (bmi < 18.5) return 'baixo_peso';
  if (bmi <= 24.9) return 'peso_normal';
  if (bmi <= 29.9) return 'sobrepeso';
  return 'obesidade';
}

/**
 * Calcula a faixa esperada de ganho de peso (em kg) para uma determinada semana
 */
export function getExpectedGainForWeek(categoryKey, week) {
  const cat = BMI_CATEGORIES[categoryKey] || BMI_CATEGORIES.peso_normal;
  const clampedWeek = Math.max(1, Math.min(40, week || 1));

  if (clampedWeek <= 13) {
    // 1º Trimestre: ganho linear suave de 0 até ~0.5kg a 2.0kg na semana 13
    const factor = clampedWeek / 13;
    const min = cat.trimester1Min * factor;
    const max = cat.trimester1Max * factor;
    return {
      min: Number(min.toFixed(1)),
      max: Number(max.toFixed(1)),
    };
  }

  // 2º e 3º Trimestres (semanas 14 a 40)
  const weeksAfterT1 = clampedWeek - 13;
  const min = cat.trimester1Min + weeksAfterT1 * cat.weeklyRateMin;
  const max = cat.trimester1Max + weeksAfterT1 * cat.weeklyRateMax;

  return {
    min: Number(min.toFixed(1)),
    max: Number(max.toFixed(1)),
  };
}

/**
 * Gera a curva de referência (semanas 1 a 40) com valores absolutos de peso em kg
 */
export function generateReferenceCurve(preWeightKg, categoryKey) {
  const points = [];
  const baseWeight = Number(preWeightKg) || 60;

  for (let w = 1; w <= 40; w++) {
    const gain = getExpectedGainForWeek(categoryKey, w);
    points.push({
      week: w,
      minGain: gain.min,
      maxGain: gain.max,
      minWeight: Number((baseWeight + gain.min).toFixed(1)),
      maxWeight: Number((baseWeight + gain.max).toFixed(1)),
    });
  }

  return points;
}
