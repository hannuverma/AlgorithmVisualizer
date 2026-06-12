import { useEffect } from 'react';
import { useMazeStore } from '../../../store/useMazeStore';
import { audioEngine } from '../../../utils/AudioEngine';

export const useMazePlayback = () => {
    const { 
        isPlaying, 
        currentStepIndex, 
        timeline, 
        playbackSpeed,
        nextStep,
        setIsPlaying
    } = useMazeStore();

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>;

        if (isPlaying && currentStepIndex < timeline.length - 1) {
            intervalId = setInterval(() => {
                nextStep();
                
                const nextStepData = timeline[currentStepIndex + 1] || timeline[currentStepIndex];
                if (nextStepData) {
                    const maxVal = useMazeStore.getState().rows * useMazeStore.getState().cols;
                    let pitchVal = nextStepData.highlighted_cells.length * 2;
                    if (nextStepData.path_cells.length > 0) {
                        pitchVal = nextStepData.path_cells.length * 5;
                    }
                    const toneDuration = Math.min(0.05, playbackSpeed / 1000);
                    audioEngine.playTone(pitchVal, maxVal || 100, toneDuration);
                }
                
            }, playbackSpeed);
        } else if (currentStepIndex >= timeline.length - 1) {
            setIsPlaying(false);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isPlaying, currentStepIndex, timeline.length, playbackSpeed, nextStep, setIsPlaying]);
};
