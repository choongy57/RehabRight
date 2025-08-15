import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePoseStore, ExerciseType } from '@/store/pose-store';
import { EXERCISE_CONFIGS } from '@/lib/exercise-rules';

interface ExerciseOption {
  id: ExerciseType;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  benefits: string[];
  icon: React.ReactNode;
}

const exercises: ExerciseOption[] = [
  {
    id: 'squat',
    name: 'Squat Analysis',
    description: 'Perfect your squat form with real-time feedback on depth, knee alignment, and posture.',
    duration: '2-5 min',
    difficulty: 'Beginner',
    benefits: ['Knee tracking', 'Depth analysis', 'Posture feedback'],
    icon: <Activity className="w-8 h-8" />
  },
  {
    id: 'shoulderAbduction',
    name: 'Shoulder Abduction',
    description: 'Improve shoulder mobility and strength with guided range of motion analysis.',
    duration: '3-6 min', 
    difficulty: 'Beginner',
    benefits: ['ROM tracking', 'Symmetry check', 'Scapular control'],
    icon: <Target className="w-8 h-8" />
  }
];

interface ExerciseSelectorProps {
  onExerciseSelect: (exercise: ExerciseType) => void;
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ onExerciseSelect }) => {
  const { setCurrentExercise, setExerciseConfig } = usePoseStore();

  const handleSelectExercise = (exerciseId: ExerciseType) => {
    const config = EXERCISE_CONFIGS[exerciseId];
    setCurrentExercise(exerciseId);
    setExerciseConfig(config);
    onExerciseSelect(exerciseId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'health';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-3 bg-gradient-medical bg-clip-text text-transparent">
          Choose Your Exercise
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select an exercise to begin your guided rehabilitation session with real-time pose analysis and feedback.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-medical transition-shadow duration-300 border-border/50 hover:border-medical/30">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-medical/10 text-medical">
                      {exercise.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{exercise.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-${getDifficultyColor(exercise.difficulty)}-foreground bg-${getDifficultyColor(exercise.difficulty)}/10`}
                        >
                          {exercise.difficulty}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {exercise.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <CardDescription className="text-base mb-4 leading-relaxed">
                  {exercise.description}
                </CardDescription>

                <div className="mb-6">
                  <h4 className="font-medium text-sm text-foreground mb-3">Key Benefits:</h4>
                  <div className="space-y-2">
                    {exercise.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-health" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleSelectExercise(exercise.id)}
                  className="w-full bg-medical hover:bg-medical/90 text-medical-foreground"
                  size="lg"
                >
                  Start {exercise.name}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-6 bg-gradient-clinical rounded-lg border border-medical/20"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-medical/20">
            <CheckCircle className="w-5 h-5 text-medical" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              🔒 Privacy First Design
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All pose analysis happens locally in your browser. Your video never leaves your device unless you 
              explicitly choose to share it with your clinician for review.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};