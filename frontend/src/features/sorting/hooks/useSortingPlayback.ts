import { useEffect, useRef } from 'react';
import { useVisualizerStore } from '../../../store/useVisualizerStore';
import { audioEngine } from '../../../utils/AudioEngine';


export const useSortingPlayback = () =>{
    const {
        timeline,
        currentStepIndex,
        isPlaying,
        playbackSpeed,
        setIsPlaying,
        nextStep,
        setCurrentStepIndex,
        setTimeline,
        setCurrentOpsCount
    } = useVisualizerStore();

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const triggerVictorySweep = async(finalArray : number[]) =>{
        setIsPlaying(false);
        const maxVal = Math.max(...finalArray);
        const totalElements = finalArray.length;

        // We want the sweep to feel quick regardless of array size (e.g., total duration of 600ms)
        const sweepDelay = Math.max(15, Math.floor(600 / totalElements));

        // Grab current timeline so we can append to it
        const currentTimeline = useVisualizerStore.getState().timeline;
        const algorithm = useVisualizerStore.getState().algorithm;
        const lastStep = currentTimeline[currentTimeline.length - 1];
        const newSteps = [...currentTimeline];

        // For counting sort, carry the auxiliary arrays through the sweep
        const isCountingSort = algorithm === 'counting-sort';
        const countingSortFields = isCountingSort ? {
            sorted_array: lastStep.sorted_array,
            number_array: lastStep.number_array,
        } : {};

        for(let i = 0; i < totalElements; i++){
            newSteps.push({
                array: isCountingSort ? lastStep.array : finalArray,
                highlighted_indices: Array.from({ length: i + 1 }, (_, index) => index),
                swapped_indices: [i],
                action_description: `Verifying sorted array integrity... Index ${i} verified.`,
                ...countingSortFields
            });

            useVisualizerStore.setState({
                timeline: newSteps,
                currentStepIndex: newSteps.length - 1
            });

            audioEngine.playTone(finalArray[i], maxVal, 0.88);
            await new Promise((resolve) => setTimeout(resolve, sweepDelay));
        }
        
        newSteps.push({
            array: isCountingSort ? lastStep.array : finalArray,
            highlighted_indices: [],
            swapped_indices: [],
            action_description: "Array verified successfully. System operational.",
            ...countingSortFields
        });

        useVisualizerStore.setState({
            timeline: newSteps,
            currentStepIndex: newSteps.length - 1
        });
    };
    
    useEffect(() => {
        if(isPlaying){

            if(timerRef.current) clearInterval(timerRef.current);

            timerRef.current = setInterval(() => {

                // Check if we are at the end of the backend sorting steps and haven't verified yet
                const isEndOfSorting = currentStepIndex === timeline.length - 2;
                const isAlreadyVerified = timeline[timeline.length - 1]?.action_description.includes("Array verified successfully");

                if(isEndOfSorting && !isAlreadyVerified){
                    clearInterval(timerRef.current!);

                    const lastStep = timeline[timeline.length - 1];
                    const algorithm = useVisualizerStore.getState().algorithm;
                    const finalSortedArray = algorithm === 'counting-sort' && lastStep.sorted_array
                        ? lastStep.sorted_array
                        : lastStep.array;

                    triggerVictorySweep(finalSortedArray);
                    return;
                }
                
                if(currentStepIndex < timeline.length - 1){

                    const nextStepData = timeline[currentStepIndex + 1];
                    if(nextStepData && nextStepData.highlighted_indices.length > 0){
                        const maxVal = Math.max(...nextStepData.array);

                        const activeIndex = nextStepData.highlighted_indices[0];
                        const activeValue = nextStepData.array[activeIndex];
                        const toneDuration = Math.min(0.1, playbackSpeed / 1000);
                        if(activeValue){
                            audioEngine.playTone(activeValue, maxVal, toneDuration)
                        }
                    }
                    nextStep();
                    useVisualizerStore.setState({currentOpsCount: currentStepIndex + 1})
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