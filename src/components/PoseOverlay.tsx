import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePoseStore } from '@/store/pose-store';
import { PoseDetector, PoseResults } from '@/lib/pose-detection';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PoseOverlayProps {
  poseResults: PoseResults | null;
  detector: PoseDetector | null;
}

export const PoseOverlay: React.FC<PoseOverlayProps> = ({ poseResults, detector }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    canvasElement, 
    setCanvasElement, 
    metrics, 
    showFeedback,
    currentExercise 
  } = usePoseStore();

  useEffect(() => {
    if (canvasRef.current && !canvasElement) {
      setCanvasElement(canvasRef.current);
    }
  }, [canvasElement, setCanvasElement]);

  useEffect(() => {
    if (poseResults && detector && canvasRef.current) {
      detector.drawPose(canvasRef.current, poseResults, true);
    }
  }, [poseResults, detector]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'health';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Pose skeleton overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          mixBlendMode: 'multiply',
          filter: 'brightness(1.2) contrast(1.1)'
        }}
      />
      
      {/* Exercise metrics overlay */}
      <div className="absolute top-4 left-4 z-10 space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3"
        >
          <Card className="px-4 py-2 bg-card/90 backdrop-blur-sm border-medical/20">
            <div className="text-sm font-medium text-medical">
              {currentExercise === 'squat' ? 'Squat' : 'Shoulder Abduction'}
            </div>
          </Card>
          
          <Card className="px-4 py-2 bg-card/90 backdrop-blur-sm border-health/20">
            <div className="text-2xl font-bold text-health">
              {metrics.repCount}
            </div>
            <div className="text-xs text-muted-foreground">reps</div>
          </Card>

          <Card className="px-4 py-2 bg-card/90 backdrop-blur-sm">
            <div className={`text-2xl font-bold text-${getScoreColor(metrics.currentScore)}`}>
              {metrics.currentScore}
            </div>
            <div className="text-xs text-muted-foreground">score</div>
          </Card>
        </motion.div>

        {/* Form indicator */}
        <AnimatePresence>
          {metrics.isInPosition && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Badge 
                variant="outline" 
                className="bg-health/10 border-health text-health-foreground"
              >
                In Position
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Real-time feedback */}
      {showFeedback && (
        <div className="absolute top-4 right-4 z-10 w-80">
          <AnimatePresence mode="popLayout">
            {metrics.feedback.map((feedback, index) => (
              <motion.div
                key={`${feedback}-${index}`}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="mb-3"
              >
                <Card className={`
                  p-4 bg-card/95 backdrop-blur-sm
                  ${feedback.includes('good') || feedback.includes('Great') || feedback.includes('Perfect') 
                    ? 'border-health/50 bg-health/5' 
                    : feedback.includes('Push') || feedback.includes('cave') 
                    ? 'border-destructive/50 bg-destructive/5'
                    : 'border-warning/50 bg-warning/5'
                  }
                `}>
                  <div className="flex items-start gap-3">
                    <div className="text-lg">
                      {getFeedbackIcon(
                        feedback.includes('good') || feedback.includes('Great') || feedback.includes('Perfect') 
                          ? 'success'
                          : feedback.includes('Push') || feedback.includes('cave')
                          ? 'error' 
                          : 'warning'
                      )}
                    </div>
                    <div className="text-sm font-medium text-card-foreground">
                      {feedback}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Angle indicators (for debugging/advanced users) */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="p-3 bg-card/90 backdrop-blur-sm">
          <div className="text-xs text-muted-foreground mb-2">Joint Angles</div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {currentExercise === 'squat' && (
              <>
                <div>
                  <div className="font-medium">Knee</div>
                  <div className="text-medical">{Math.round(metrics.angles.knee)}°</div>
                </div>
                <div>
                  <div className="font-medium">Hip</div>
                  <div className="text-medical">{Math.round(metrics.angles.hip)}°</div>
                </div>
              </>
            )}
            {currentExercise === 'shoulderAbduction' && (
              <div>
                <div className="font-medium">Shoulder</div>
                <div className="text-medical">{Math.round(metrics.angles.shoulder)}°</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};