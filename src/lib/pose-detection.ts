import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResults {
  landmarks: PoseLandmark[][];
  worldLandmarks: PoseLandmark[][];
}

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

export class PoseDetector {
  private poseLandmarker: PoseLandmarker | null = null;
  // Remove drawingUtils as we'll draw manually
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // Initialize without drawingUtils
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize pose detector:', error);
      throw error;
    }
  }

  async detectPose(videoElement: HTMLVideoElement, timestamp: number): Promise<PoseResults | null> {
    if (!this.poseLandmarker || !this.isInitialized) {
      await this.initialize();
    }

    try {
      const results = this.poseLandmarker!.detectForVideo(videoElement, timestamp);
      return {
        landmarks: results.landmarks || [],
        worldLandmarks: results.worldLandmarks || []
      };
    } catch (error) {
      console.error('Pose detection failed:', error);
      return null;
    }
  }

  drawPose(
    canvas: HTMLCanvasElement,
    results: PoseResults,
    drawConnections: boolean = true
  ): void {
    if (!results.landmarks.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const landmarks of results.landmarks) {
      if (drawConnections) {
        // Draw connections manually
        const connections = [
          [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
          [11, 23], [12, 24], [23, 24], // Torso
          [23, 25], [25, 27], [24, 26], [26, 28] // Legs
        ];
        
        for (const [startIdx, endIdx] of connections) {
          const start = landmarks[startIdx];
          const end = landmarks[endIdx];
          if (start && end) {
            ctx.beginPath();
            ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
            ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      }

      // Draw landmarks manually
      for (const landmark of landmarks) {
        ctx.beginPath();
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
      }
    }
  }

  dispose(): void {
    if (this.poseLandmarker) {
      this.poseLandmarker.close();
      this.poseLandmarker = null;
    }
    this.isInitialized = false;
  }
}

export const calculateAngle = (
  point1: PoseLandmark,
  point2: PoseLandmark,
  point3: PoseLandmark
): number => {
  const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
                  Math.atan2(point1.y - point2.y, point1.x - point2.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  
  if (angle > 180) {
    angle = 360 - angle;
  }
  
  return angle;
};

export const getKeyLandmarks = (landmarks: PoseLandmark[]) => ({
  // Core landmarks for exercise analysis
  leftShoulder: landmarks[11],
  rightShoulder: landmarks[12],
  leftElbow: landmarks[13],
  rightElbow: landmarks[14],
  leftWrist: landmarks[15],
  rightWrist: landmarks[16],
  leftHip: landmarks[23],
  rightHip: landmarks[24],
  leftKnee: landmarks[25],
  rightKnee: landmarks[26],
  leftAnkle: landmarks[27],
  rightAnkle: landmarks[28],
  nose: landmarks[0],
  leftEye: landmarks[1],
  rightEye: landmarks[2]
});