import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Square, Settings, Volume2, VolumeX } from 'lucide-react';
import { usePoseStore } from '@/store/pose-store';
import { PoseDetector } from '@/lib/pose-detection';
import { ExerciseAnalyzer } from '@/lib/exercise-rules';
import { CameraFeed } from '@/components/CameraFeed';
import { PoseOverlay } from '@/components/PoseOverlay';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ExerciseSelector } from '@/components/ExerciseSelector';

export default function LiveSession() {
  const poseDetectorRef = useRef<PoseDetector | null>(null);
  const exerciseAnalyzerRef = useRef<ExerciseAnalyzer | null>(null);
  const animationFrameRef = useRef<number>();
  const [poseResults, setPoseResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    currentExercise,
    exerciseConfig,
    isRecording,
    isCameraActive,
    videoElement,
    metrics,
    showFeedback,
    feedbackVolume,
    setRecording,
    updateMetrics,
    toggleFeedback,
    setFeedbackVolume,
    reset
  } = usePoseStore();

  // Initialize pose detector
  useEffect(() => {
    const initDetector = async () => {
      try {
        poseDetectorRef.current = new PoseDetector();
        exerciseAnalyzerRef.current = new ExerciseAnalyzer();
        await poseDetectorRef.current.initialize();
      } catch (error) {
        console.error('Failed to initialize pose detector:', error);
      }
    };

    initDetector();

    return () => {
      if (poseDetectorRef.current) {
        poseDetectorRef.current.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Main pose detection loop
  useEffect(() => {
    if (!isCameraActive || !videoElement || !poseDetectorRef.current || !exerciseAnalyzerRef.current || !currentExercise || !exerciseConfig) {
      return;
    }

    const detectPose = async () => {
      if (isProcessing) return;
      
      setIsProcessing(true);
      
      try {
        const timestamp = performance.now();
        const results = await poseDetectorRef.current!.detectPose(videoElement, timestamp);
        
        if (results && results.landmarks.length > 0) {
          setPoseResults(results);
          
          // Analyze exercise
          const landmarks = results.landmarks[0];
          let analysis;
          
          if (currentExercise === 'squat') {
            analysis = exerciseAnalyzerRef.current!.analyzeSquat(landmarks, exerciseConfig);
          } else {
            analysis = exerciseAnalyzerRef.current!.analyzeShoulderAbduction(landmarks, exerciseConfig);
          }
          
          updateMetrics({
            repCount: analysis.repCount,
            currentScore: analysis.score,
            feedback: analysis.feedback.map(f => f.message),
            angles: analysis.angles,
            isInPosition: analysis.isInPosition
          });

          // Voice feedback (simplified for demo)
          if (showFeedback && feedbackVolume > 0 && analysis.feedback.length > 0) {
            const feedback = analysis.feedback[0];
            if (feedback.type === 'error' && 'speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(feedback.message);
              utterance.volume = feedbackVolume;
              utterance.rate = 0.9;
              speechSynthesis.speak(utterance);
            }
          }
        }
      } catch (error) {
        console.error('Pose detection error:', error);
      } finally {
        setIsProcessing(false);
      }
      
      animationFrameRef.current = requestAnimationFrame(detectPose);
    };

    animationFrameRef.current = requestAnimationFrame(detectPose);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, videoElement, currentExercise, exerciseConfig, isProcessing, showFeedback, feedbackVolume, updateMetrics]);

  const handleExerciseSelect = (exercise: string) => {
    // Exercise selection handled by ExerciseSelector component
  };

  const handleBackToSelection = () => {
    reset();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const toggleRecording = () => {
    setRecording(!isRecording);
  };

  // Show exercise selector if no exercise is selected
  if (!currentExercise) {
    return <ExerciseSelector onExerciseSelect={handleExerciseSelect} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSelection}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exercises
              </Button>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-medical/10 border-medical/30 text-medical">
                  {exerciseConfig?.name}
                </Badge>
                {isRecording && (
                  <Badge variant="destructive" className="animate-pulse">
                    Recording
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-muted-foreground"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button
                variant={isRecording ? "destructive" : "medical"}
                size="sm"
                onClick={toggleRecording}
                disabled={!isCameraActive}
              >
                {isRecording ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Record Session
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="bg-card border-b border-border/50 py-4"
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between max-w-2xl">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFeedback}
                    className={showFeedback ? "text-health" : "text-muted-foreground"}
                  >
                    {showFeedback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    Feedback
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Voice Volume:</span>
                  <div className="w-32">
                    <Slider
                      value={[feedbackVolume]}
                      onValueChange={(value) => setFeedbackVolume(value[0])}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Camera Feed with Pose Overlay */}
          <div className="lg:col-span-3 relative">
            <Card className="w-full h-full overflow-hidden border-medical/20">
              <div className="relative w-full h-full">
                <CameraFeed />
                <PoseOverlay 
                  poseResults={poseResults} 
                  detector={poseDetectorRef.current} 
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Summary */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Session Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Target Reps</span>
                  <span className="font-medium">{exerciseConfig?.targetReps}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-health">{metrics.repCount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Score</span>
                  <span className="font-medium">{metrics.currentScore}</span>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-2">Progress</div>
                  <div className="w-full bg-clinical-light rounded-full h-2">
                    <div 
                      className="bg-gradient-feedback h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((metrics.repCount / (exerciseConfig?.targetReps || 10)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Exercise Instructions */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Instructions</h3>
              
              {currentExercise === 'squat' && (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Stand with feet shoulder-width apart</p>
                  <p>• Lower your body as if sitting back into a chair</p>
                  <p>• Keep your chest up and knees tracking over toes</p>
                  <p>• Descend until thighs are parallel to floor</p>
                  <p>• Push through heels to return to start</p>
                </div>
              )}
              
              {currentExercise === 'shoulderAbduction' && (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Start with arms at your sides</p>
                  <p>• Raise both arms out to the sides</p>
                  <p>• Lift to shoulder height (90 degrees)</p>
                  <p>• Keep shoulders relaxed, don't shrug</p>
                  <p>• Lower slowly and controlled</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}