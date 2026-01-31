
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SLIDER_HEIGHT = SCREEN_HEIGHT * 0.5;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface Level3Props {
    type: string;
    onComplete: (score: number) => void;
    options?: any[];
}

export const Level3TaskHandler = ({ type, onComplete, options }: Level3Props) => {
    // Shared state
    const sliderY = useSharedValue(0);
    const partnerY = useSharedValue(0);
    const syncProgress = useSharedValue(0);
    const [isSynced, setIsSynced] = useState(false);

    const puckX = useSharedValue(0);
    const puckY = useSharedValue(0);

    // Mosaic State
    const [mosaicGrid, setMosaicGrid] = useState<string[]>(Array(16).fill('#1E293B'));

    // Negotiate State
    const negotiateX = useSharedValue(0);

    // Echo State
    const [echoStep, setEchoStep] = useState(0);

    if (type === 'sync_haptic') {
        return <HapticHarmonic sliderY={sliderY} partnerY={partnerY} syncProgress={syncProgress} isSynced={isSynced} setIsSynced={setIsSynced} onComplete={onComplete} />;
    }
    if (type === 'pulse_compass') {
        return <PulseCompass puckX={puckX} puckY={puckY} targetX={100} targetY={-100} onComplete={onComplete} />;
    }
    if (type === 'mosaic') {
        return <MosaicGrid grid={mosaicGrid} setGrid={setMosaicGrid} onComplete={onComplete} />;
    }
    if (type === 'negotiate') {
        return <Negotiate negotiateX={negotiateX} onComplete={onComplete} options={options} />;
    }
    if (type === 'echo_sequence') {
        return <EchoSequence onComplete={onComplete} />;
    }

    return null;
};

// --- Sub-Components ---

const HapticHarmonic = ({ sliderY, partnerY, syncProgress, isSynced, setIsSynced, onComplete }: any) => {
    useEffect(() => {
        partnerY.value = withRepeat(withSequence(withTiming(200, { duration: 2000 }), withTiming(-200, { duration: 2000 })), -1, true);
    }, []);

    const panGesture = Gesture.Pan().onUpdate((e) => { sliderY.value = e.translationY; });

    useDerivedValue(() => {
        if (Math.abs(sliderY.value - partnerY.value) < 30) {
            syncProgress.value = withTiming(syncProgress.value + 0.5, { duration: 100 });
            if (syncProgress.value > 100) runOnJS(onComplete)(100);
        }
    });

    const sliderStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sliderY.value }] }));
    const partnerStyle = useAnimatedStyle(() => ({ transform: [{ translateY: partnerY.value }] }));
    const syncStyle = useAnimatedStyle(() => ({ height: `${syncProgress.value}%`, backgroundColor: isSynced ? '#4ADE80' : '#FBBF24' }));

    return (
        <View style={styles.container}>
            <View style={styles.track}>
                <Animated.View style={[styles.cursor, styles.partnerCursor, partnerStyle]} />
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.cursor, styles.myCursor, sliderStyle]} />
                </GestureDetector>
            </View>
            <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, syncStyle]} />
            </View>
            <Text style={styles.instruction}>Align with the ghost cursor</Text>
        </View>
    );
};

const PulseCompass = ({ puckX, puckY, targetX, targetY, onComplete }: any) => {
    const panGesture = Gesture.Pan().onUpdate((e) => {
        puckX.value = e.translationX;
        puckY.value = e.translationY;
        const dist = Math.sqrt(Math.pow(puckX.value - targetX, 2) + Math.pow(puckY.value - targetY, 2));
        if (dist < 50) { runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy); runOnJS(onComplete)(100); }
        else if (dist < 150) runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

    const puckStyle = useAnimatedStyle(() => ({ transform: [{ translateX: puckX.value }, { translateY: puckY.value }] }));

    return (
        <View style={styles.container}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.puck, puckStyle]} />
            </GestureDetector>
            <Text style={styles.instruction}>Find the hidden target</Text>
        </View>
    );
};

const MosaicGrid = ({ grid, setGrid, onComplete }: any) => {
    const handleTap = (index: number) => {
        const newGrid = [...grid];
        const colors = ['#1E293B', '#3B82F6', '#F472B6', '#10B981'];
        const currColorIndex = colors.indexOf(newGrid[index]);
        newGrid[index] = colors[(currColorIndex + 1) % colors.length];
        setGrid(newGrid);
        Haptics.selectionAsync();

        if (newGrid.filter((c) => c !== '#1E293B').length >= 8) {
            onComplete(100);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {grid.map((color: string, i: number) => (
                    <TouchableOpacity key={i} style={[styles.cell, { backgroundColor: color }]} onPress={() => handleTap(i)} />
                ))}
            </View>
            <Text style={styles.instruction}>Build a pattern together</Text>
        </View>
    );
};

const Negotiate = ({ negotiateX, onComplete, options }: any) => {
    const panGesture = Gesture.Pan().onUpdate((e) => {
        if (e.translationX > -150 && e.translationX < 150) negotiateX.value = e.translationX;
        if (Math.abs(e.translationX) < 20) runOnJS(onComplete)(100);
    });

    const dragStyle = useAnimatedStyle(() => ({ transform: [{ translateX: negotiateX.value }] }));

    const labelA = options?.[0]?.label || (typeof options?.[0] === 'string' ? options[0] : "Option A");
    const labelB = options?.[1]?.label || (typeof options?.[1] === 'string' ? options[1] : "Option B");

    return (
        <View style={styles.container}>
            <View style={styles.negLabels}>
                <Text style={styles.negText}>{labelA}</Text>
                <Text style={styles.negText}>{labelB}</Text>
            </View>
            <View style={styles.negTrack}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.negCursor, dragStyle]} />
                </GestureDetector>
            </View>
            <Text style={styles.instruction}>Find the middle ground</Text>
        </View>
    );
};

const EchoSequence = ({ onComplete }: any) => {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {['#EF4444', '#3B82F6', '#10B981', '#F59E0B'].map((c, i) => (
                    <TouchableOpacity key={i} style={[styles.echoBtn, { backgroundColor: c }]} onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        if (i === 3) onComplete(100);
                    }} />
                ))}
            </View>
            <Text style={styles.instruction}>Repeat the sequence</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
    track: { width: 60, height: SLIDER_HEIGHT, backgroundColor: '#334155', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    cursor: { width: 50, height: 50, borderRadius: 25, position: 'absolute' },
    myCursor: { backgroundColor: '#3B82F6', zIndex: 10 },
    partnerCursor: { backgroundColor: '#F472B6', opacity: 0.5 },
    progressBar: { position: 'absolute', right: 40, width: 8, height: SLIDER_HEIGHT, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
    progressFill: { width: '100%', backgroundColor: '#4ADE80', position: 'absolute', bottom: 0 },
    instruction: { color: '#94A3B8', marginTop: 30, fontWeight: '600', fontSize: 16 },
    puck: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3B82F6', shadowColor: '#3B82F6', shadowOpacity: 0.5, shadowRadius: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', width: 200, height: 200, gap: 8 },
    cell: { width: 44, height: 44, borderRadius: 8 },
    negLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginBottom: 20 },
    negText: { color: '#FFF', fontWeight: 'bold' },
    negTrack: { width: '80%', height: 60, backgroundColor: '#334155', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    negCursor: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFD700' },
    echoBtn: { width: 90, height: 90, borderRadius: 12 }
});

export default Level3TaskHandler;
