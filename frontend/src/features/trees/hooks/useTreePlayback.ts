// frontend/src/features/trees/hooks/useTreePlayback.ts
import { useEffect, useRef } from 'react';
import { useTreeStore } from '../../../store/useTreeStore';
import { audioEngine } from '../../../utils/AudioEngine';

export const useTreePlayback = () =>{
    const {
        timeline,
        currentStepIndex,
        isPlaying,
        playbackSpeed,
        setIsPlaying,
        nextStep
    } = useTreeStore();

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    useEffect(() => {
        if(isPlaying){

            if(timerRef.current) clearInterval(timerRef.current);

            timerRef.current = setInterval(() => {
                
                if(currentStepIndex < timeline.length - 1){

                    const nextStepData = timeline[currentStepIndex + 1];
                    if(nextStepData && nextStepData.mutated_nodes.length > 0){
                        // Play a tone based on the first mutated node's value
                        const activeNodeId = nextStepData.mutated_nodes[0];
                        const activeNode = nextStepData.nodes.find(n => n.id === activeNodeId);
                        if (activeNode) {
                            const maxVal = Math.max(...nextStepData.nodes.map(n => n.value), 100);
                            const toneDuration = Math.min(0.1, playbackSpeed / 1000);
                            audioEngine.playTone(activeNode.value, maxVal, toneDuration)
                        }
                    }
                    nextStep();
                }else{
                    setIsPlaying(false);
                    if(timerRef.current) clearInterval(timerRef.current);
                }
            },playbackSpeed);
        }else{
            if(timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if(timerRef.current) clearInterval(timerRef.current);
        };

    }, [isPlaying, playbackSpeed, currentStepIndex, timeline.length, nextStep, setIsPlaying]);
}
