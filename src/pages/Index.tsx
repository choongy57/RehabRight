import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Camera, Shield, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: 'Real-time Analysis',
      description: 'Advanced pose detection provides instant feedback on your exercise form'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Progress Tracking',
      description: 'Monitor your rehabilitation progress with detailed metrics and scores'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Clinician Review',
      description: 'Share sessions with healthcare providers for professional guidance'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Privacy First',
      description: 'All analysis happens locally - your data never leaves your device'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-clinical">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge 
            variant="outline" 
            className="mb-6 bg-medical/10 border-medical/30 text-medical"
          >
            🏥 Allied Health Technology
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-medical bg-clip-text text-transparent">
            KineMind Coach
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Advanced pose-feedback platform providing real-time rehabilitation exercise guidance 
            with AI-powered form analysis and clinician review capabilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-medical hover:bg-medical/90 text-medical-foreground shadow-medical"
              onClick={() => navigate('/live')}
            >
              <Activity className="w-5 h-5 mr-2" />
              Start Exercise Session
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-medical/30 text-medical hover:bg-medical/5"
              onClick={() => navigate('/clinician')}
            >
              <Users className="w-5 h-5 mr-2" />
              Clinician Portal
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="h-full text-center hover:shadow-medical transition-shadow duration-300 border-border/50 hover:border-medical/30">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-medical/10 flex items-center justify-center text-medical">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Key Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-medical/20"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose KineMind Coach?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combining cutting-edge computer vision with clinical expertise to revolutionize rehabilitation therapy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-health/20 flex items-center justify-center">
                <Zap className="w-8 h-8 text-health" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Feedback</h3>
              <p className="text-muted-foreground">
                Get real-time corrections and guidance as you exercise, helping you maintain proper form and prevent injury.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-medical/20 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-medical" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Progress Analytics</h3>
              <p className="text-muted-foreground">
                Track your improvement over time with detailed metrics, rep counting, and form quality scores.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/20 flex items-center justify-center">
                <Users className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Clinical Integration</h3>
              <p className="text-muted-foreground">
                Share your sessions with healthcare providers for professional review and personalized treatment plans.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Transform Your Rehabilitation?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of patients and clinicians who trust KineMind Coach for superior rehabilitation outcomes.
          </p>
          
          <Button
            size="lg"
            className="bg-gradient-medical text-white hover:opacity-90 shadow-medical"
            onClick={() => navigate('/live')}
          >
            <Camera className="w-5 h-5 mr-2" />
            Begin Your First Session
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
