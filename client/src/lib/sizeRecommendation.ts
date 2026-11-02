export interface BodyMeasurements {
  weight: number; // kg
  height: number; // cm
}

export interface SizeRecommendation {
  size: string;
  bmi: number;
  bodyFrame: 'petite' | 'regular' | 'tall';
  fitType: 'slim' | 'regular' | 'relaxed';
  fittingTips: string[];
}

export const calculateBMI = (weight: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
};

export const getBodyFrame = (heightCm: number): 'petite' | 'regular' | 'tall' => {
  if (heightCm < 160) return 'petite';
  if (heightCm > 180) return 'tall';
  return 'regular';
};

export const getFitType = (bmi: number): 'slim' | 'regular' | 'relaxed' => {
  if (bmi < 20) return 'slim';
  if (bmi > 27) return 'relaxed';
  return 'regular';
};

export const getRecommendedSize = (measurements: BodyMeasurements): SizeRecommendation => {
  const { weight, height } = measurements;
  const bmi = calculateBMI(weight, height);
  const bodyFrame = getBodyFrame(height);
  const fitType = getFitType(bmi);
  
  // Size mapping based on BMI with height adjustments
  let size: string;
  
  if (bmi < 18.5) {
    size = bodyFrame === 'tall' ? 'S' : 'XS';
  } else if (bmi < 22) {
    size = bodyFrame === 'tall' ? 'M' : 'S';
  } else if (bmi < 25) {
    size = bodyFrame === 'petite' ? 'S' : bodyFrame === 'tall' ? 'L' : 'M';
  } else if (bmi < 28) {
    size = bodyFrame === 'petite' ? 'M' : bodyFrame === 'tall' ? 'XL' : 'L';
  } else if (bmi < 32) {
    size = bodyFrame === 'petite' ? 'L' : 'XL';
  } else {
    size = 'XXL';
  }

  // Generate fitting tips based on body measurements
  const fittingTips: string[] = [];

  // Height-based tips
  if (bodyFrame === 'petite') {
    fittingTips.push('Look for petite sizing options or shorter inseams');
    fittingTips.push('Cropped styles and high-waisted fits will flatter your proportions');
  } else if (bodyFrame === 'tall') {
    fittingTips.push('Consider tall sizing for better sleeve and inseam lengths');
    fittingTips.push('Longer tops and jackets will provide better coverage');
  }

  // Fit-based tips
  if (fitType === 'slim') {
    fittingTips.push('Slim fit styles will provide a tailored look without being too loose');
    fittingTips.push('Structured pieces will add definition to your silhouette');
  } else if (fitType === 'relaxed') {
    fittingTips.push('Look for relaxed fit or straight-cut styles for comfort');
    fittingTips.push('Stretchy fabrics and adjustable waistbands offer flexibility');
  } else {
    fittingTips.push('Regular fit styles will suit you well for everyday wear');
    fittingTips.push('You have flexibility to choose between slim and relaxed fits based on preference');
  }

  // BMI-based style suggestions
  if (bmi < 20) {
    fittingTips.push('Layering can add visual depth and dimension to your outfits');
  } else if (bmi > 28) {
    fittingTips.push('Vertical patterns and darker colors create a streamlined look');
    fittingTips.push('V-necks and open collars elongate the neckline');
  }

  return {
    size,
    bmi: Math.round(bmi * 10) / 10,
    bodyFrame,
    fitType,
    fittingTips,
  };
};

export const validateMeasurements = (weight: number, height: number): { valid: boolean; error?: string } => {
  if (weight < 30 || weight > 200) {
    return { valid: false, error: 'Weight should be between 30 and 200 kg' };
  }
  if (height < 100 || height > 250) {
    return { valid: false, error: 'Height should be between 100 and 250 cm' };
  }
  return { valid: true };
};
