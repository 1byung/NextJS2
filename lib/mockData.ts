// Mock Data Generator for Wind Turbine Monitoring Dashboard

export interface PowerCurveDataPoint {
  windSpeed: number;
  actualPower?: number;
  minPower: number;
  maxPower: number;
  expectedPower: number;
  timestamp: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  time: number;
  rotorSpeed: number;
  pitchAngle: number;
  generatorTemp: number;
  windSpeed: number;
}

export interface CorrelationFactor {
  id: string;
  name: string;
  value: number;
  deviation: number;
  deviationScore: number;
  unit: string;
  normalRange: { min: number; max: number };
  history: Array<{ time: string; value: number }>;
}

export interface UnitInfo {
  id: number;
  name: string;
  currentYield: number;
  status: 'normal' | 'warning' | 'critical';
}

// Calculate expected power using power curve formula (S-Curve)
function calculateExpectedPower(windSpeed: number): number {
  const cutInSpeed = 3; // Wind speed where turbine starts producing power
  const ratedSpeed = 12; // Wind speed at which turbine reaches rated power
  const cutOutSpeed = 25; // Wind speed where turbine shuts down for safety
  const ratedPower = 2000; // Rated power in kW

  if (windSpeed < cutInSpeed) return 0;
  if (windSpeed >= cutOutSpeed) return 0;
  if (windSpeed >= ratedSpeed) return ratedPower;

  // Cubic relationship in the linear region (simplified S-curve)
  // P ≈ k * v^3 where k is a constant
  const normalizedSpeed = (windSpeed - cutInSpeed) / (ratedSpeed - cutInSpeed);
  const power = ratedPower * Math.pow(normalizedSpeed, 3);

  return power;
}

// Generate Power Curve data (Wind Speed vs Power)
export function generatePowerCurveData(unitId: number, numPoints: number = 200): PowerCurveDataPoint[] {
  const data: PowerCurveDataPoint[] = [];
  const isCriticalUnit = unitId === 6;
  const now = Date.now();

  // Generate wind speed data points with HIGHER DENSITY in the ramp-up zone (4-11 m/s)
  // This makes the "dip and recover" behavior more visible and smooth
  const windSpeeds: number[] = [];

  // Zone C: 0-4 m/s (startup zone) - Coarse sampling (0.5 m/s steps)
  for (let ws = 0; ws <= 4; ws += 0.5) {
    windSpeeds.push(ws);
  }

  // Zone B: 4-11 m/s (RAMP-UP - THE INTERESTING ZONE!) - Dense sampling (0.1 m/s steps)
  // This creates ~70 data points in this 7 m/s range for smooth dip-and-recover visualization
  for (let ws = 4.1; ws <= 11; ws += 0.1) {
    windSpeeds.push(ws);
  }

  // Zone A: 11-25 m/s (rated power zone) - Coarse sampling (0.5 m/s steps)
  // Just a flat line here, so we don't need many points
  for (let ws = 11.5; ws <= 25; ws += 0.5) {
    windSpeeds.push(ws);
  }

  // Generate power curve data for each wind speed
  windSpeeds.forEach((windSpeed) => {
    const expectedPower = calculateExpectedPower(windSpeed);
    const timestamp = new Date(now - (numPoints - (windSpeed * 4)) * 5 * 60 * 1000);

    // Gray NBM Baseline Band (min/max bounds)
    const minPower = expectedPower * 0.85;
    const maxPower = expectedPower * 1.05;

    let actualPower: number | undefined;

    if (windSpeed >= 3 && windSpeed <= 25) {
      const isWarningUnit = unitId === 4; // Unit 4: Yellow/Warning status

      if (!isCriticalUnit) {
        // Units 1-5: Different behavior patterns based on status
        // ZONE A (>11 m/s): Rated power region - LOCKED at max power (flat line)
        // ZONE B (4-11 m/s): Ramp-up region - DIFFERENT BEHAVIORS PER UNIT TYPE
        // ZONE C (<4 m/s): Below operational range (handled by cut-in check)

        if (windSpeed > 11) {
          // ═══ ZONE A: HIGH WIND (>11 m/s) ═══
          // ALL units reach rated power - output is LOCKED at maximum
          // This creates the flat line at the top of the curve
          actualPower = expectedPower * (0.98 + Math.random() * 0.02); // 98-100% of rated power

          // Ensure we stay at max power (flat line)
          actualPower = Math.min(actualPower, expectedPower * 1.0);
        } else if (windSpeed >= 4 && windSpeed <= 11) {
          // ═══ ZONE B: RAMP-UP (4-11 m/s) - THE OPTIMIZATION ZONE ═══

          if (isWarningUnit) {
            // ═══ UNIT 4 (YELLOW/WARNING): DEEP DIP & SHARP RECOVERY ═══
            // Major efficiency loss that is being successfully optimized/corrected
            // Visual: Blue line drops DEEP below gray band, then curves sharply UP to recover
            // Creates a visible "V-shape" or "U-shape" recovery arc
            // Cause: Previous fault being corrected, optimization in progress

            const rampProgress = (windSpeed - 4) / 7; // 0 to 1 across the ramp-up zone

            // Create a DEEP dip with sharp recovery pattern
            // At start (4 m/s): Inside the band (92-95%)
            // Middle (6-8 m/s): DEEP DIP (75-80% - MUCH LOWER than normal units!)
            // End (11 m/s): SHARP RECOVERY back to band (95-98%)

            // Use a sine wave to create the deep V-shape
            const dipCycle = Math.sin(rampProgress * Math.PI); // 0 → 1 → 0

            // Calculate efficiency with DEEPER dip than normal units:
            // Normal units dip to 70-75%
            // Unit 4 dips to 75-80% (more visible gap from gray band)
            // But recovers SHARPLY to match normal at the end
            const baseEfficiency = 0.75 + (0.20 * (1 - dipCycle)); // 75-95% based on deep dip cycle
            const randomVariation = Math.random() * 0.03; // Add 0-3% noise

            actualPower = expectedPower * (baseEfficiency + randomVariation);

            // CRITICAL: NEVER exceed the gray band (must stay below maxPower)
            actualPower = Math.min(actualPower, maxPower * 0.98);

            // Ensure DEEP visible dip at peak (middle of ramp-up zone)
            // This creates the pronounced "V-shape" that distinguishes Unit 4
            if (dipCycle > 0.5) {
              // At the deepest point, force it to be WELL BELOW the gray band
              actualPower = Math.min(actualPower, minPower * 0.88); // 88% of lower bound
            }

            // At the recovery phase (end of ramp), ensure it's climbing back UP
            if (rampProgress > 0.7) {
              // Sharp recovery: interpolate from deep dip to near-optimal
              const recoveryFactor = (rampProgress - 0.7) / 0.3; // 0 to 1 in last 30%
              // Interpolate from 80% (deep dip) to 95-98% (recovered)
              actualPower = Math.max(actualPower, expectedPower * (0.80 + recoveryFactor * 0.15));
            }
          } else {
            // ═══ UNITS 1, 2, 3, 5 (GREEN/NORMAL): GENTLE DIP & SMOOTH RECOVERY ═══
            // Minor efficiency loss → Smooth recovery to optimal
            // Visual: Blue line stays VERY CLOSE to gray band (minimal deviation)

            const rampProgress = (windSpeed - 4) / 7; // 0 to 1 across the ramp-up zone

            // Create a GENTLE dip and recover pattern
            // At start (4 m/s): Near optimal efficiency (92-95%)
            // Middle (7-8 m/s): SLIGHT dip (88-92% - stays close to band)
            // End (11 m/s): Recovered to optimal (95-98%)

            const dipCycle = Math.sin(rampProgress * Math.PI); // 0 → 1 → 0

            // Calculate efficiency with GENTLE dip (much less than Unit 4):
            // Normal units: Stay close to the band (88-98%)
            // Unit 4: Deep dip (75-80%) - MUCH more visible
            const baseEfficiency = 0.88 + (0.07 * (1 - dipCycle)); // 88-95% based on gentle dip
            const randomVariation = Math.random() * 0.03; // Add 0-3% noise

            actualPower = expectedPower * (baseEfficiency + randomVariation);

            // Physics constraint: Never exceed theoretical maximum
            actualPower = Math.min(actualPower, maxPower * 0.98);

            // Ensure gentle dip (stays close to lower bound of gray band)
            if (dipCycle > 0.5) {
              actualPower = Math.min(actualPower, minPower * 1.02); // Just 2% above lower bound
            }
          }
        } else {
          // ═══ ZONE C: LOW WIND (3-4 m/s) ═══
          // Just above cut-in speed - turbine starting up
          // Output is low but relatively stable (all units behave similarly here)
          actualPower = expectedPower * (0.85 + Math.random() * 0.10); // 85-95% efficiency
        }
      } else {
        // Unit 6: Critical/Faulty behavior with 3-5 spike attempts
        const baselineLow = minPower * 0.45; // Well below gray area (45% of min)

        // Define 5 spike positions
        const spikePositions = [6.5, 10, 13.5, 17, 20.5];
        let isSpike = false;
        let spikeStrength = 0;

        // Check if current windSpeed is near any spike position
        for (let i = 0; i < spikePositions.length; i++) {
          const spikePos = spikePositions[i];
          const distance = Math.abs(windSpeed - spikePos);

          if (distance < 1.2) {
            isSpike = true;
            // Spike shape: rises sharply then falls back
            // Use a bell curve for the spike
            const normalizedDist = distance / 1.2;
            spikeStrength = Math.exp(-8 * normalizedDist * normalizedDist);
            break;
          }
        }

        if (isSpike) {
          // Spike attempts to reach the baseline but fails (reaches ~70-85% of minPower)
          const maxSpikeHeight = minPower * (0.7 + Math.random() * 0.15);
          actualPower = baselineLow + (maxSpikeHeight - baselineLow) * spikeStrength;
        } else {
          // Stay low between spikes with slight random noise
          actualPower = baselineLow * (0.85 + Math.random() * 0.3);
        }
      }
    }

    data.push({
      windSpeed: Math.round(windSpeed * 100) / 100,
      actualPower: actualPower ? Math.round(actualPower * 10) / 10 : undefined,
      minPower: Math.round(minPower * 10) / 10,
      maxPower: Math.round(maxPower * 10) / 10,
      expectedPower: Math.round(expectedPower * 10) / 10,
      timestamp: timestamp.toISOString(),
    });
  });

  return data;
}

// Generate theoretical power curve baseline (smooth S-curve)
export function generateTheoreticalPowerCurve(): PowerCurveDataPoint[] {
  const data: PowerCurveDataPoint[] = [];
  const now = Date.now();

  // Generate smooth curve with many points
  for (let windSpeed = 0; windSpeed <= 25; windSpeed += 0.2) {
    const expectedPower = calculateExpectedPower(windSpeed);

    data.push({
      windSpeed: Math.round(windSpeed * 10) / 10,
      minPower: Math.round(expectedPower * 0.85 * 10) / 10,
      maxPower: Math.round(expectedPower * 1.05 * 10) / 10,
      expectedPower: expectedPower,
      timestamp: new Date(now).toISOString(),
    });
  }

  return data;
}

// Generate time-series data for correlation factors
export function generateTimeSeriesData(unitId: number, hours: number = 24): TimeSeriesDataPoint[] {
  const data: TimeSeriesDataPoint[] = [];
  const now = Date.now();
  const pointsPerHour = 12; // 5-minute intervals
  const totalPoints = hours * pointsPerHour;
  const isCriticalUnit = unitId === 6;

  for (let i = 0; i < totalPoints; i++) {
    const timestamp = new Date(now - (totalPoints - i) * 5 * 60 * 1000);

    let rotorSpeed: number;
    let pitchAngle: number;
    let generatorTemp: number;
    let windSpeed: number;

    if (isCriticalUnit) {
      // Unit 6: Critical state parameters
      rotorSpeed = 8 + Math.random() * 3;
      pitchAngle = 15 + Math.random() * 10;
      generatorTemp = 85 + Math.random() * 5;
      windSpeed = 6 + Math.random() * 3;
    } else if (unitId === 4) {
      // Unit 4: Warning state parameters
      rotorSpeed = 14 + Math.random() * 3;
      pitchAngle = 5 + Math.random() * 5;
      generatorTemp = 78 + Math.random() * 4;
      windSpeed = 8 + Math.random() * 4;
    } else {
      // Normal operation
      rotorSpeed = 16 + Math.random() * 4;
      pitchAngle = 2 + Math.random() * 3;
      generatorTemp = 70 + Math.random() * 5;
      windSpeed = 8 + Math.random() * 6;
    }

    data.push({
      timestamp: timestamp.toISOString(),
      time: i,
      rotorSpeed: Math.round(rotorSpeed * 10) / 10,
      pitchAngle: Math.round(pitchAngle * 10) / 10,
      generatorTemp: Math.round(generatorTemp * 10) / 10,
      windSpeed: Math.round(windSpeed * 10) / 10,
    });
  }

  return data;
}

// Generate unit information
export function generateUnitsInfo(): UnitInfo[] {
  return [
    { id: 1, name: 'Unit 1', currentYield: 97.2, status: 'normal' },
    { id: 2, name: 'Unit 2', currentYield: 98.5, status: 'normal' },
    { id: 3, name: 'Unit 3', currentYield: 95.8, status: 'normal' },
    { id: 4, name: 'Unit 4', currentYield: 91.3, status: 'warning' },
    { id: 5, name: 'Unit 5', currentYield: 96.7, status: 'normal' },
    { id: 6, name: 'Unit 6', currentYield: 80.0, status: 'critical' }, // Critical unit
  ];
}

// Get status color based on yield and status
export function getStatusColor(status: UnitInfo['status']): string {
  switch (status) {
    case 'critical':
      return 'rgb(239, 68, 68)'; // Red
    case 'warning':
      return 'rgb(251, 191, 36)'; // Amber/Yellow
    case 'normal':
      return 'rgb(34, 197, 94)'; // Green
    default:
      return 'rgb(148, 163, 184)'; // Gray
  }
}

// Generate initial historical data for a factor
function generateInitialHistory(
  factorId: string,
  isCritical: boolean,
  numPoints: number = 30
): Array<{ time: string; value: number }> {
  const history: Array<{ time: string; value: number }> = [];
  const now = Date.now();

  for (let i = 0; i < numPoints; i++) {
    // Generate timestamps going backwards from now
    const timestamp = new Date(now - (numPoints - i) * 5000).toLocaleTimeString();
    let value: number;

    if (isCritical) {
      // Unit 6: Historical erratic behavior
      const isAnomaly = Math.random() > 0.7;

      switch (factorId) {
        case 'pitch':
          value = isAnomaly ? 20 + Math.random() * 8 : 12 + Math.random() * 8;
          break;
        case 'rotor':
          value = isAnomaly ? 6 + Math.random() * 3 : 11 + Math.random() * 4;
          break;
        case 'generator':
          value = 85 + Math.random() * 10;
          break;
        case 'windSpeed':
          value = isAnomaly ? 5 + Math.random() * 2 : 6 + Math.random() * 3;
          break;
        default:
          value = 0;
      }
    } else {
      // Normal units: Historical smooth variations
      switch (factorId) {
        case 'pitch':
          value = 2 + Math.random() * 3;
          break;
        case 'rotor':
          value = 14 + Math.random() * 4;
          break;
        case 'generator':
          value = 68 + Math.random() * 6;
          break;
        case 'windSpeed':
          value = 9 + Math.random() * 4;
          break;
        default:
          value = 0;
      }
    }

    history.push({
      time: timestamp,
      value: Math.round(value * 10) / 10,
    });
  }

  return history;
}

// Initialize correlation factors for a unit with pre-filled history
export function initializeCorrelationFactors(unitId: number): CorrelationFactor[] {
  const isCritical = unitId === 6;

  // Calculate initial deviation for each factor
  const calculateInitialDeviation = (value: number, normalRange: { min: number; max: number }) => {
    const { min, max } = normalRange;
    let deviation: number;

    if (value < min) {
      deviation = min - value;
    } else if (value > max) {
      deviation = value - max;
    } else {
      deviation = 0;
    }

    const rangeWidth = max - min;
    const deviationScore = Math.min(100, (Math.abs(deviation) / rangeWidth) * 100);

    return {
      deviation: Math.round(deviation * 10) / 10,
      deviationScore: Math.round(deviationScore * 10) / 10,
    };
  };

  const factors = [
    {
      id: 'pitch',
      name: 'Pitch Angle',
      value: isCritical ? 18 : 3,
      unit: '°',
      normalRange: { min: 0, max: 5 },
    },
    {
      id: 'rotor',
      name: 'Rotor Speed',
      value: isCritical ? 9 : 16,
      unit: 'RPM',
      normalRange: { min: 14, max: 18 },
    },
    {
      id: 'generator',
      name: 'Generator Temp',
      value: isCritical ? 87 : 72,
      unit: '°C',
      normalRange: { min: 65, max: 75 },
    },
    {
      id: 'windSpeed',
      name: 'Wind Speed',
      value: isCritical ? 6 : 10,
      unit: 'm/s',
      normalRange: { min: 8, max: 14 },
    },
  ];

  return factors.map((factor) => {
    const { deviation, deviationScore } = calculateInitialDeviation(factor.value, factor.normalRange);

    return {
      ...factor,
      deviation,
      deviationScore,
      history: generateInitialHistory(factor.id, isCritical, 30),
    };
  });
}

// Generate next data point for real-time simulation
export function generateNextDataPoint(
  unitId: number,
  currentTime: number,
  currentFactors: CorrelationFactor[]
): CorrelationFactor[] {
  const isCritical = unitId === 6;
  const timestamp = new Date(Date.now()).toLocaleTimeString();

  return currentFactors.map((factor) => {
    let newValue: number;

    if (isCritical) {
      // Unit 6: Erratic behavior with spikes
      const isAnomaly = Math.random() > 0.7; // 30% chance of anomaly

      switch (factor.id) {
        case 'pitch':
          newValue = isAnomaly
            ? 20 + Math.random() * 8  // Spike to 20-28°
            : 12 + Math.random() * 8; // Normal faulty range 12-20°
          break;
        case 'rotor':
          newValue = isAnomaly
            ? 6 + Math.random() * 3   // Drop to 6-9 RPM
            : 11 + Math.random() * 4; // Normal faulty range 11-15 RPM
          break;
        case 'generator':
          newValue = 85 + Math.random() * 10; // High temp 85-95°C
          break;
        case 'windSpeed':
          newValue = isAnomaly
            ? 5 + Math.random() * 2   // Low wind 5-7 m/s
            : 6 + Math.random() * 3; // Below normal 6-9 m/s
          break;
        default:
          newValue = factor.value;
      }
    } else {
      // Normal units: Smooth variations within normal range
      switch (factor.id) {
        case 'pitch':
          newValue = 2 + Math.random() * 3; // 2-5°
          break;
        case 'rotor':
          newValue = 14 + Math.random() * 4; // 14-18 RPM
          break;
        case 'generator':
          newValue = 68 + Math.random() * 6; // 68-74°C
          break;
        case 'windSpeed':
          newValue = 9 + Math.random() * 4; // 9-13 m/s
          break;
        default:
          newValue = factor.value;
      }
    }

    // Calculate deviation from normal range
    const { min, max } = factor.normalRange;
    let deviation: number;

    if (newValue < min) {
      deviation = min - newValue;
    } else if (newValue > max) {
      deviation = newValue - max;
    } else {
      deviation = 0;
    }

    // Calculate deviation score (normalized 0-100)
    const rangeWidth = max - min;
    const deviationScore = Math.min(100, (Math.abs(deviation) / rangeWidth) * 100);

    // Update history (keep last 20 points)
    const newHistory = [
      ...factor.history,
      { time: timestamp, value: newValue },
    ].slice(-20);

    return {
      ...factor,
      value: Math.round(newValue * 10) / 10,
      deviation: Math.round(deviation * 10) / 10,
      deviationScore: Math.round(deviationScore * 10) / 10,
      history: newHistory,
    };
  });
}

// Sort factors by deviation score (highest first)
export function sortFactorsByDeviation(factors: CorrelationFactor[]): CorrelationFactor[] {
  return [...factors].sort((a, b) => b.deviationScore - a.deviationScore);
}

// ═══════════════════════════════════════════════════════════════
// DISTRIBUTION ANALYSIS - Bell Curve (Gaussian Distribution)
// ═══════════════════════════════════════════════════════════════

export interface BellCurveDataPoint {
  value: number;
  density: number;
}

export interface DistributionData {
  reference: BellCurveDataPoint[];
  actual: BellCurveDataPoint[];
  referenceMean: number;
  referenceStdDev: number;
  actualMean: number;
  actualStdDev: number;
}

/**
 * Generate Gaussian (Bell Curve) distribution data points
 * Uses the formula: f(x) = (1 / (σ√(2π))) * e^(-(x-μ)²/(2σ²))
 */
function generateBellCurveData(
  mean: number,
  stdDev: number,
  rangeMin: number,
  rangeMax: number,
  numPoints: number = 100
): BellCurveDataPoint[] {
  const data: BellCurveDataPoint[] = [];
  const step = (rangeMax - rangeMin) / numPoints;

  for (let i = 0; i <= numPoints; i++) {
    const x = rangeMin + i * step;

    // Gaussian probability density function
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const density = coefficient * Math.exp(exponent);

    data.push({
      value: Math.round(x * 100) / 100,
      density: Math.round(density * 1000) / 1000,
    });
  }

  return data;
}

/**
 * Generate distribution comparison data for a correlation factor
 * Returns both reference (NBM) and actual distributions
 */
export function generateDistributionData(
  factor: CorrelationFactor,
  unitId: number
): DistributionData {
  const isCritical = unitId === 6;
  const isWarning = unitId === 4;

  // Calculate reference (NBM) distribution parameters
  // Reference should be centered at the middle of normal range
  const referenceMean = (factor.normalRange.min + factor.normalRange.max) / 2;
  const referenceStdDev = (factor.normalRange.max - factor.normalRange.min) / 6; // ~99.7% within range

  // Calculate actual distribution parameters based on unit status
  let actualMean: number;
  let actualStdDev: number;

  if (isCritical) {
    // Unit 6: Heavily shifted mean, higher variance (unstable)
    // Shift by 30-50% away from reference
    const shiftAmount = (factor.normalRange.max - factor.normalRange.min) * 0.4;
    actualMean = factor.value < referenceMean
      ? referenceMean - shiftAmount
      : referenceMean + shiftAmount;
    actualStdDev = referenceStdDev * 2.0; // Double variance (very unstable)
  } else if (isWarning) {
    // Unit 4: Moderately shifted mean, slightly higher variance
    // This visualizes the "Deep Dip" statistically
    const shiftAmount = (factor.normalRange.max - factor.normalRange.min) * 0.25;
    actualMean = factor.value < referenceMean
      ? referenceMean - shiftAmount
      : referenceMean + shiftAmount;
    actualStdDev = referenceStdDev * 1.4; // 40% more variance
  } else {
    // Normal units: Very close to reference, minimal shift
    actualMean = referenceMean + (Math.random() - 0.5) * referenceStdDev * 0.5;
    actualStdDev = referenceStdDev * 1.1; // Slightly higher variance
  }

  // Determine range for visualization (wider than normal range to show tails)
  const rangeWidth = factor.normalRange.max - factor.normalRange.min;
  const rangeMin = factor.normalRange.min - rangeWidth * 0.5;
  const rangeMax = factor.normalRange.max + rangeWidth * 0.5;

  // Generate both curves
  const reference = generateBellCurveData(referenceMean, referenceStdDev, rangeMin, rangeMax);
  const actual = generateBellCurveData(actualMean, actualStdDev, rangeMin, rangeMax);

  return {
    reference,
    actual,
    referenceMean: Math.round(referenceMean * 100) / 100,
    referenceStdDev: Math.round(referenceStdDev * 100) / 100,
    actualMean: Math.round(actualMean * 100) / 100,
    actualStdDev: Math.round(actualStdDev * 100) / 100,
  };
}
