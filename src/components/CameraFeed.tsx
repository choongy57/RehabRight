import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { usePoseStore } from '@/store/pose-store';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CameraFeedProps {
  onStreamReady?: (stream: MediaStream) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onStreamReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const { 
    isCameraActive, 
    setCameraActive, 
    videoElement, 
    setVideoElement 
  } = usePoseStore();

  useEffect(() => {
    if (videoRef.current && !videoElement) {
      setVideoElement(videoRef.current);
    }
  }, [videoElement, setVideoElement]);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setCameraActive(true);
        setStream(mediaStream);
        
        if (onStreamReady) {
          onStreamReady(mediaStream);
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-clinical-light rounded-lg overflow-hidden">
      {/* Video element */}
      <video
        ref={videoRef}
        className={`
          w-full h-full object-cover transform scale-x-[-1]
          ${isCameraActive ? 'block' : 'hidden'}
        `}
        playsInline
        muted
      />

      {/* Camera not active state */}
      {!isCameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-clinical">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center p-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-medical/10 flex items-center justify-center">
              <Camera className="w-12 h-12 text-medical" />
            </div>
            
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Camera Access Required
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              We need access to your camera to analyze your exercise form and provide real-time feedback.
            </p>
            
            <Button
              onClick={startCamera}
              disabled={isLoading}
              className="bg-medical hover:bg-medical/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Camera...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </>
              )}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-20">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Camera controls overlay */}
      {isCameraActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 left-4 z-20"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={stopCamera}
            className="bg-card/90 backdrop-blur-sm"
          >
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Camera
          </Button>
        </motion.div>
      )}

      {/* Privacy indicator */}
      {isCameraActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-4 right-4 z-20"
        >
          <div className="bg-health/20 border border-health/30 rounded-full px-3 py-1 text-xs text-health-foreground backdrop-blur-sm">
            🔒 Local Processing - Your privacy is protected
          </div>
        </motion.div>
      )}
    </div>
  );
};