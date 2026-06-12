import { useEffect } from 'react';
import { useMazeStore } from '../../../store/useMazeStore';

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
        let intervalId: NodeJS.Timeout;

        if (isPlaying && currentStepIndex < timeline.length - 1) {
            intervalId = setInterval(() => {
                nextStep();
                
                // Play a tiny tick sound for immersion
                try {
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    if (AudioContext) {
                        const ctx = new AudioContext();
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        
                        // Different pitch based on whether it's generation or pathfinding
                        // Generation is usually faster and we can make it a low thud
                        // Pathfinding is higher pitch
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(300, ctx.currentTime);
                        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
                        
                        gain.gain.setValueAtTime(0.02, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                        
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        
                        osc.start();
                        osc.stop(ctx.currentTime + 0.05);
                    }
                } catch (e) {
                    // Ignore audio errors
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
