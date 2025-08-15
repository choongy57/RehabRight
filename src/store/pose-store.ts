import { create } from 'zustand';
import { ExerciseConfig } from '../lib/exercise-rules';

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

export type ExerciseType = 'squat' | 'shoulderAbduction';

interface PoseState {
  // Camera and detection state
  isRecording: boolean;
  isCameraActive: boolean;
  videoElement: HTMLVideoElement | null;
  canvasElement: HTMLCanvasElement | null;
  
  // Exercise state
  currentExercise: ExerciseType | null;
  exerciseConfig: ExerciseConfig | null;
  metrics: ExerciseMetrics;
  
  // Session data
  sessionStartTime: number | null;
  sessionData: {
    repCount: number;
    avgScore: number;
    totalTime: number;
    exercise: ExerciseType;
    flags: string[];
  } | null;
  
  // Recording state
  recordedVideo: Blob | null;
  recordingStartTime: number | null;
  
  // UI state
  showFeedback: boolean;
  feedbackVolume: number;
  
  // Actions
  setRecording: (recording: boolean) => void;
  setCameraActive: (active: boolean) => void;
  setVideoElement: (element: HTMLVideoElement | null) => void;
  setCanvasElement: (element: HTMLCanvasElement | null) => void;
  setCurrentExercise: (exercise: ExerciseType | null) => void;
  setExerciseConfig: (config: ExerciseConfig | null) => void;
  updateMetrics: (metrics: ExerciseMetrics) => void;
  startSession: () => void;
  endSession: () => void;
  setRecordedVideo: (video: Blob | null) => void;
  toggleFeedback: () => void;
  setFeedbackVolume: (volume: number) => void;
  reset: () => void;
}

export const usePoseStore = create<PoseState>((set, get) => ({
  // Initial state
  isRecording: false,
  isCameraActive: false,
  videoElement: null,
  canvasElement: null,
  currentExercise: null,
  exerciseConfig: null,
  metrics: {
    repCount: 0,
    currentScore: 0,
    feedback: [],
    angles: { knee: 0, hip: 0, shoulder: 0 },
    isInPosition: false
  },
  sessionStartTime: null,
  sessionData: null,
  recordedVideo: null,
  recordingStartTime: null,
  showFeedback: true,
  feedbackVolume: 0.7,

  // Actions
  setRecording: (recording) => {
    set({ isRecording: recording });
    if (recording) {
      set({ recordingStartTime: Date.now() });
    } else {
      set({ recordingStartTime: null });
    }
  },

  setCameraActive: (active) => set({ isCameraActive: active }),

  setVideoElement: (element) => set({ videoElement: element }),

  setCanvasElement: (element) => set({ canvasElement: element }),

  setCurrentExercise: (exercise) => set({ currentExercise: exercise }),

  setExerciseConfig: (config) => set({ exerciseConfig: config }),

  updateMetrics: (metrics) => set({ metrics }),

  startSession: () => {
    const { currentExercise } = get();
    set({ 
      sessionStartTime: Date.now(),
      sessionData: {
        repCount: 0,
        avgScore: 0,
        totalTime: 0,
        exercise: currentExercise!,
        flags: []
      }
    });
  },

  endSession: () => {
    const { sessionStartTime, metrics, currentExercise } = get();
    if (sessionStartTime && currentExercise) {
      const totalTime = Date.now() - sessionStartTime;
      set({
        sessionData: {
          repCount: metrics.repCount,
          avgScore: metrics.currentScore,
          totalTime,
          exercise: currentExercise,
          flags: metrics.feedback.map(f => f)
        },
        sessionStartTime: null
      });
    }
  },

  setRecordedVideo: (video) => set({ recordedVideo: video }),

  toggleFeedback: () => set((state) => ({ showFeedback: !state.showFeedback })),

  setFeedbackVolume: (volume) => set({ feedbackVolume: volume }),

  reset: () => set({
    isRecording: false,
    currentExercise: null,
    exerciseConfig: null,
    metrics: {
      repCount: 0,
      currentScore: 0,
      feedback: [],
      angles: { knee: 0, hip: 0, shoulder: 0 },
      isInPosition: false
    },
    sessionStartTime: null,
    sessionData: null,
    recordedVideo: null,
    recordingStartTime: null
  })
}));