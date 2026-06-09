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

                    const currentStepData = timeline[currentStepIndex];
                    const nextStepData = timeline[currentStepIndex + 1];
                    
                    if(nextStepData){
                        const actionDesc = nextStepData.action_description || "";
                        const maxVal = Math.max(...nextStepData.nodes.map(n => n.value), 100);

                        if (actionDesc.includes("Success!") || actionDesc.includes("Found target")) {
                            // High-pitched success chime
                            audioEngine.playTone(maxVal * 1.5, maxVal, 0.4);
                        } else if (actionDesc.includes("not found")) {
                            // Low-pitched error buzz
                            audioEngine.playTone(-maxVal * 0.2, maxVal, 0.5);
                        } else {
                            const isProcessing = actionDesc.includes("Added to output");
                            
                            let currentActiveId = null;
                            if (currentStepData) {
                                if (currentStepData.mutated_nodes.length > 0) currentActiveId = currentStepData.mutated_nodes[0];
                                else if (currentStepData.highlighted_nodes.length > 0) currentActiveId = currentStepData.highlighted_nodes[currentStepData.highlighted_nodes.length - 1];
                            }

                            let nextActiveId = null;
                            if (nextStepData.mutated_nodes.length > 0) {
                                nextActiveId = nextStepData.mutated_nodes[0];
                            } else if (nextStepData.highlighted_nodes.length > 0) {
                                nextActiveId = nextStepData.highlighted_nodes[nextStepData.highlighted_nodes.length - 1];
                            }

                            if (isProcessing || (nextActiveId && nextActiveId !== currentActiveId)) {
                                const activeNode = nextStepData.nodes.find(n => n.id === nextActiveId);
                                if (activeNode) {
                                    // Play a longer, distinct tone when adding to output sequence, otherwise short blip
                                    const toneDuration = isProcessing ? 0.15 : Math.min(0.05, playbackSpeed / 1000);
                                    audioEngine.playTone(activeNode.value, maxVal, toneDuration);
                                }
                            }
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
