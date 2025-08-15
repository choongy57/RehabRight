import { PoseLandmark, calculateAngle, getKeyLandmarks } from './pose-detection';

export interface ExerciseMetrics {
  repCount: number;
  currentScore: number;
  feedback: string[];
  angles: {
    knee: number;
    hip: number;
    shoulder: number;
  };
  isInPosition: boolean;
}

export interface ExerciseConfig {
  name: string;
  targetReps: number;
  thresholds: {
    depth?: number;
    valgusLimit?: number;
    leanLimit?: number;
    romMin?: number;
    romMax?: number;
    symmetryLimit?: number;
  };
}

export interface FeedbackMessage {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  priority: number;
}

export interface RepData {
  repIndex: number;
  angles: {
    knee: number;
    hip: number;
    shoulder: number;
  };
  flags: string[];
  score: number;
  timestamp: number;
}

export class ExerciseAnalyzer {
  private repCount = 0;
  private currentScore = 0;
  private lastPosition = 'up';
  private repData: RepData[] = [];
  private frameCount = 0;

  analyzeSquat(landmarks: PoseLandmark[], config: ExerciseConfig): {
    score: number;
    feedback: FeedbackMessage[];
    repCount: number;
    isInPosition: boolean;
    angles: { knee: number; hip: number; shoulder: number };
  } {
    const keyLandmarks = getKeyLandmarks(landmarks);
    const feedback: FeedbackMessage[] = [];
    let score = 100;
    this.frameCount++;

    // Calculate key angles
    const leftKneeAngle = calculateAngle(
      keyLandmarks.leftHip,
      keyLandmarks.leftKnee,
      keyLandmarks.leftAnkle
    );
    
    const rightKneeAngle = calculateAngle(
      keyLandmarks.rightHip,
      keyLandmarks.rightKnee,
      keyLandmarks.rightAnkle
    );

    const kneeAngle = Math.min(leftKneeAngle, rightKneeAngle);

    const hipAngle = calculateAngle(
      keyLandmarks.leftShoulder,
      keyLandmarks.leftHip,
      keyLandmarks.leftKnee
    );

    // Check squat depth
    const isInBottomPosition = kneeAngle < 120;
    const hasGoodDepth = kneeAngle < 90;

    // Knee valgus check (knees caving in)
    const leftKneeX = keyLandmarks.leftKnee.x;
    const leftAnkleX = keyLandmarks.leftAnkle.x;
    const rightKneeX = keyLandmarks.rightKnee.x;
    const rightAnkleX = keyLandmarks.rightAnkle.x;
    
    const leftValgus = leftKneeX < leftAnkleX - 0.02;
    const rightValgus = rightKneeX > rightAnkleX + 0.02;

    // Torso lean check
    const shoulderMidpoint = {
      x: (keyLandmarks.leftShoulder.x + keyLandmarks.rightShoulder.x) / 2,
      y: (keyLandmarks.leftShoulder.y + keyLandmarks.rightShoulder.y) / 2,
      z: (keyLandmarks.leftShoulder.z + keyLandmarks.rightShoulder.z) / 2
    };
    
    const hipMidpoint = {
      x: (keyLandmarks.leftHip.x + keyLandmarks.rightHip.x) / 2,
      y: (keyLandmarks.leftHip.y + keyLandmarks.rightHip.y) / 2,
      z: (keyLandmarks.leftHip.z + keyLandmarks.rightHip.z) / 2
    };

    const torsoLean = Math.abs(shoulderMidpoint.x - hipMidpoint.x);
    const excessiveLean = torsoLean > 0.05;

    // Rep counting
    if (isInBottomPosition && this.lastPosition === 'up') {
      this.lastPosition = 'down';
    } else if (!isInBottomPosition && this.lastPosition === 'down') {
      this.repCount++;
      this.lastPosition = 'up';
      
      // Store rep data
      const rep: RepData = {
        repIndex: this.repCount,
        angles: { knee: kneeAngle, hip: hipAngle, shoulder: 0 },
        flags: [],
        score: this.currentScore,
        timestamp: Date.now()
      };
      
      if (!hasGoodDepth) rep.flags.push('shallow_squat');
      if (leftValgus || rightValgus) rep.flags.push('knee_valgus');
      if (excessiveLean) rep.flags.push('excessive_lean');
      
      this.repData.push(rep);
    }

    // Generate feedback
    if (isInBottomPosition) {
      if (!hasGoodDepth) {
        feedback.push({
          type: 'warning',
          message: 'Go a bit deeper - aim for thighs parallel to floor',
          priority: 3
        });
        score -= 15;
      } else {
        feedback.push({
          type: 'success',
          message: 'Great depth!',
          priority: 1
        });
      }
    }

    if (leftValgus || rightValgus) {
      feedback.push({
        type: 'error',
        message: 'Push your knees out - don\'t let them cave in',
        priority: 4
      });
      score -= 20;
    }

    if (excessiveLean) {
      feedback.push({
        type: 'warning',
        message: 'Keep your chest up and back straight',
        priority: 2
      });
      score -= 10;
    }

    // Frame rate limiting for feedback
    if (this.frameCount % 30 === 0) { // Every ~1 second at 30fps
      if (feedback.length === 0 && isInBottomPosition) {
        feedback.push({
          type: 'info',
          message: 'Looking good! Keep it controlled',
          priority: 0
        });
      }
    }

    this.currentScore = Math.max(0, score);

    return {
      score: this.currentScore,
      feedback: feedback.sort((a, b) => b.priority - a.priority).slice(0, 2),
      repCount: this.repCount,
      isInPosition: isInBottomPosition,
      angles: { knee: kneeAngle, hip: hipAngle, shoulder: 0 }
    };
  }

  analyzeShoulderAbduction(landmarks: PoseLandmark[], config: ExerciseConfig): {
    score: number;
    feedback: FeedbackMessage[];
    repCount: number;
    isInPosition: boolean;
    angles: { knee: number; hip: number; shoulder: number };
  } {
    const keyLandmarks = getKeyLandmarks(landmarks);
    const feedback: FeedbackMessage[] = [];
    let score = 100;

    // Calculate shoulder angles
    const leftShoulderAngle = calculateAngle(
      keyLandmarks.leftElbow,
      keyLandmarks.leftShoulder,
      keyLandmarks.leftHip
    );
    
    const rightShoulderAngle = calculateAngle(
      keyLandmarks.rightElbow,
      keyLandmarks.rightShoulder,
      keyLandmarks.rightHip
    );

    const avgShoulderAngle = (leftShoulderAngle + rightShoulderAngle) / 2;
    const shoulderSymmetry = Math.abs(leftShoulderAngle - rightShoulderAngle);

    // Target ROM (90 degrees ± 10)
    const targetAngle = 90;
    const angleDeviation = Math.abs(avgShoulderAngle - targetAngle);
    const isInTargetRange = angleDeviation <= 10;
    const isInPosition = avgShoulderAngle > 45;

    // Check for scapular hiking (shoulder shrugging)
    const leftElbowY = keyLandmarks.leftElbow.y;
    const leftShoulderY = keyLandmarks.leftShoulder.y;
    const rightElbowY = keyLandmarks.rightElbow.y;
    const rightShoulderY = keyLandmarks.rightShoulder.y;
    
    const leftHiking = leftElbowY < leftShoulderY;
    const rightHiking = rightElbowY < rightShoulderY;

    // Rep counting for shoulder abduction
    if (isInPosition && avgShoulderAngle > 75 && this.lastPosition === 'down') {
      this.lastPosition = 'up';
    } else if (!isInPosition && avgShoulderAngle < 30 && this.lastPosition === 'up') {
      this.repCount++;
      this.lastPosition = 'down';
    }

    // Generate feedback
    if (angleDeviation > 15) {
      if (avgShoulderAngle < targetAngle - 15) {
        feedback.push({
          type: 'warning',
          message: 'Raise your arms higher - aim for 90 degrees',
          priority: 3
        });
        score -= 15;
      } else if (avgShoulderAngle > targetAngle + 15) {
        feedback.push({
          type: 'warning',
          message: 'Lower your arms slightly - aim for 90 degrees',
          priority: 3
        });
        score -= 10;
      }
    }

    if (shoulderSymmetry > 15) {
      feedback.push({
        type: 'error',
        message: 'Keep both arms at the same level for symmetry',
        priority: 4
      });
      score -= 20;
    }

    if (leftHiking || rightHiking) {
      feedback.push({
        type: 'warning',
        message: 'Relax your shoulders - don\'t shrug them up',
        priority: 2
      });
      score -= 10;
    }

    if (isInTargetRange && shoulderSymmetry <= 10) {
      feedback.push({
        type: 'success',
        message: 'Perfect form! Great ROM and symmetry',
        priority: 1
      });
    }

    this.currentScore = Math.max(0, score);

    return {
      score: this.currentScore,
      feedback: feedback.sort((a, b) => b.priority - a.priority).slice(0, 2),
      repCount: this.repCount,
      isInPosition: isInPosition,
      angles: { knee: 0, hip: 0, shoulder: avgShoulderAngle }
    };
  }

  reset(): void {
    this.repCount = 0;
    this.currentScore = 0;
    this.lastPosition = 'up';
    this.repData = [];
    this.frameCount = 0;
  }

  getRepData(): RepData[] {
    return this.repData;
  }
}

export const EXERCISE_CONFIGS: Record<string, ExerciseConfig> = {
  squat: {
    name: 'Squat',
    targetReps: 10,
    thresholds: {
      depth: 90,
      valgusLimit: 0.02,
      leanLimit: 0.05
    }
  },
  shoulderAbduction: {
    name: 'Shoulder Abduction',
    targetReps: 15,
    thresholds: {
      romMin: 80,
      romMax: 100,
      symmetryLimit: 15
    }
  }
};