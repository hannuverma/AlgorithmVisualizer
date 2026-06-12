import { useEffect, useRef } from 'react';
import { useGraphStore } from '../../../store/useGraphStore';
import { audioEngine } from '../../../utils/AudioEngine';

export const useGraphPlayback = () => {
    const {
        timeline,
        currentStepIndex,
        isPlaying,
        playbackSpeed,
        setIsPlaying,
        nextStep
    } = useGraphStore();

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isPlaying) {
            if (timerRef.current) clearInterval(timerRef.current);

            timerRef.current = setInterval(() => {
                if (currentStepIndex < timeline.length - 1) {
                    const nextStepData = timeline[currentStepIndex + 1];
                    
                    // Simple tone for animation step
                    if (nextStepData && nextStepData.action_description) {
                        const toneDuration = Math.min(0.1, playbackSpeed / 1000);
                        // Play a tone based on number of nodes present
                        audioEngine.playTone(nextStepData.nodes.length, 50, toneDuration);
                    }
                    
                    nextStep();
                } else {
                    setIsPlaying(false);
                    if (timerRef.current) clearInterval(timerRef.current);
                }
            }, playbackSpeed);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, playbackSpeed, currentStepIndex, timeline.length, nextStep, setIsPlaying]);
};
