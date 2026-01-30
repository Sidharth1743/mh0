import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, GripVertical, LogOut, MessageSquare, Mic, Send, Smile, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView, TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import Animated, { Easing, FadeInDown, FadeInRight, FadeInUp, SlideInDown, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';
import taskData from '../../task.json';

interface TaskItem {
    id: string;
    text: string;
    addedBy: 'me' | 'partner';
    timestamp: string;
    selected?: boolean;
}

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'partner';
}

export default function TaskScreen() {
    const { id, count, level } = useLocalSearchParams();
    const router = useRouter();

    const currentTask = taskData.tasks.find(t => t.id.toString() === id);
    const currentLevel = parseInt(level as string) || 1;

    const [items, setItems] = useState<TaskItem[]>(() => {
        if (!currentTask?.options) {
            return [{ id: '1', text: 'Initial shared thought...', addedBy: 'partner', timestamp: '2m ago' }];
        }

        // For binary tasks, we don't flat map yet, we keep them as pairs for the row-based UI
        return currentTask.options.map((option: any, index: number) => ({
            id: (index + 1).toString(),
            text: option,
            addedBy: 'partner', // Placeholder
            timestamp: `Phase ${index + 1}`
        }));
    });
    const [inputText, setInputText] = useState('');

    // Progression State
    const [taskCount, setTaskCount] = useState(parseInt(count as string) || 1);
    const [isDone, setIsDone] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showReveal, setShowReveal] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [revealed, setRevealed] = useState(false);

    // Score State
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [showUnlock, setShowUnlock] = useState(false);

    // Showdown State
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showdownSelections, setShowdownSelections] = useState<Record<number, string>>({});
    const [showdownRevealed, setShowdownRevealed] = useState(false);
    const [isPartnerWaiting, setIsPartnerWaiting] = useState(false);
    const [showDragonAnim, setShowDragonAnim] = useState(false);

    // Animation values
    const dragonX = useSharedValue(-500);
    const dragonY = useSharedValue(200);
    const dragonScale = useSharedValue(1);
    const friendsX = useSharedValue(-500);
    const friendsY = useSharedValue(800);
    const friendsScale = useSharedValue(0.5);
    const bgOpacity = useSharedValue(0);

    // Sync taskCount from params when they change
    React.useEffect(() => {
        if (count) setTaskCount(parseInt(count as string));
    }, [count]);

    // Reset items and state when ID changes (new task in session)
    React.useEffect(() => {
        if (currentTask) {
            const initialItems: TaskItem[] = currentTask.options?.map((option: any, index: number) => ({
                id: (index + 1).toString(),
                text: typeof option === 'string' ? option : option.text || '',
                addedBy: 'partner' as const,
                timestamp: `Item ${index + 1}`
            })) || [];
            setItems(initialItems);
            setBinarySelections({});
            setIsDone(false);
            setCurrentCardIndex(0);
            setShowdownRevealed(false);
            setShowdownSelections({});
        }
    }, [id]);

    const chatUnlocked = currentLevel >= 2;
    const voiceUnlocked = currentLevel >= 3;
    const revealPossible = currentLevel >= 4;

    const isNoTypingTask = currentLevel === 1 || ['ranking', 'selection', 'binary', 'sorting', 'puzzle', 'showdown', 'vote'].includes(currentTask?.type || '');

    const addItem = () => {
        if (!inputText.trim()) return;
        setItems([...items, {
            id: Date.now().toString(),
            text: inputText,
            addedBy: 'me',
            timestamp: 'Just now'
        }]);
        setInputText('');
    };

    const completeTask = () => {
        setIsDone(true);
        setTimeout(() => {
            const baseScore = 75;
            const randomAdd = Math.floor(Math.random() * 20);
            setScore(baseScore + randomAdd);
            setShowScore(true);
            setIsDone(false);
        }, 1200);
    };

    const startLevel2Transition = () => {
        setShowUnlock(false);
        setShowDragonAnim(true);

        // Dragon flying sequence
        dragonX.value = withSequence(
            withTiming(400, { duration: 5000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
            withDelay(1500, withTiming(1500, { duration: 4000 }))
        );

        dragonY.value = withRepeat(
            withSequence(
                withTiming(180, { duration: 1200 }),
                withTiming(220, { duration: 1200 })
            ),
            4,
            true
        );

        // Background fade
        bgOpacity.value = withTiming(1, { duration: 1000 });

        // Friends slide in and jump
        friendsX.value = withTiming(400, { duration: 5000 });
        friendsY.value = withSequence(
            withTiming(600, { duration: 2500 }), // Slide up
            withTiming(200, { duration: 1500, easing: Easing.bounce }), // Jump onto dragon
            withDelay(800, withTiming(-100, { duration: 3000 })) // Fly off with dragon
        );
        friendsScale.value = withSequence(
            withTiming(1, { duration: 3000 }),
            withTiming(0.8, { duration: 2000 })
        );

        setTimeout(() => {
            router.replace({
                pathname: '/task/[id]',
                params: { id: '6', count: '1', level: '2' }
            });
            setShowDragonAnim(false);
            bgOpacity.value = 0; // Reset for next time
        }, 9000);
    };

    const proceedToNext = () => {
        setShowScore(false);

        if (taskCount < 4) {
            // Pick next Level 1 task
            const level1Tasks = taskData.tasks.filter(t => t.level === 1 && t.id.toString() !== id);
            const nextId = level1Tasks[Math.floor(Math.random() * level1Tasks.length)].id;

            router.replace({
                pathname: '/task/[id]',
                params: { id: nextId.toString(), count: (taskCount + 1).toString(), level: currentLevel.toString() }
            });
        } else if (currentLevel === 1) {
            // Show Level 2 Unlock Moment
            setShowUnlock(true);
        } else {
            // Level 2 sequence or reveal
            setTaskCount(prev => prev + 1);
            if (taskCount >= 4) {
                setShowReveal(true);
            }
        }
    };

    const sendMessage = () => {
        if (!chatInput.trim()) return;
        const finalMessage = currentLevel === 2 ? chatInput.substring(0, 120) : chatInput;
        setMessages([...messages, { id: Date.now().toString(), text: finalMessage, sender: 'me' }]);
        setChatInput('');
    };

    const SENTENCE_STARTERS = [
        "I liked that we agreed on ___",
        "That choice surprised me",
        "This felt easy / tricky",
        "I’d do this again"
    ];

    const useStarter = (starter: string) => {
        setChatInput(starter);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const [binarySelections, setBinarySelections] = useState<Record<string, string>>({});

    const toggleBinarySelection = (itemId: string, choice: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setBinarySelections(prev => ({
            ...prev,
            [itemId]: choice
        }));
    };

    const handleShowdownChoice = (choiceValue: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowdownSelections(prev => ({ ...prev, [currentCardIndex]: choiceValue }));
        setIsPartnerWaiting(true);

        // Simulated partner delay
        setTimeout(() => {
            setIsPartnerWaiting(false);
            if (currentCardIndex < (currentTask?.options?.length || 0) - 1) {
                setCurrentCardIndex(prev => prev + 1);
            } else {
                // Task complete, show result
                setShowdownRevealed(true);
                setTimeout(() => {
                    setIsDone(true);
                }, 500);
            }
        }, 1200);
    };

    const [sortingCategories, setSortingCategories] = useState<Record<string, string>>({});

    const toggleItemSelection = (itemId: string) => {
        if (!['selection', 'binary', 'vote', 'solve', 'build', 'puzzle', 'sorting'].includes(currentTask?.type || '')) return;

        if (currentTask?.type === 'sorting') {
            const categories = ['None', 'Must-have', 'Nice-to-have', 'Skip'];
            const currentCat = sortingCategories[itemId] || 'None';
            const nextIndex = (categories.indexOf(currentCat) + 1) % categories.length;
            const nextCat = categories[nextIndex];

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSortingCategories(prev => ({ ...prev, [itemId]: nextCat }));
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setItems(prev => prev.map(item =>
            item.id === itemId
                ? { ...item, selected: !item.selected }
                : item
        ));
    };

    const partnerName = revealed ? 'Alex Chen' : 'Participant #17';

    const dragonStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: dragonX.value },
            { translateY: dragonY.value },
            { scale: dragonScale.value }
        ],
    }));

    const friendsStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: dragonX.value }, // Follow dragon horizontally
            { translateY: friendsY.value },
            { scale: friendsScale.value }
        ],
    }));

    const dragonBgStyle = useAnimatedStyle(() => ({
        backgroundColor: '#1E1B4B', // Midnight Blue for transition
        opacity: bgOpacity.value,
        ...StyleSheet.absoluteFillObject,
    }));

    const renderTaskHeader = () => (
        <View style={{ width: '100%' }}>
            <View style={styles.header}>
                <View style={{ flex: 1, marginRight: 16 }}>
                    <Text style={[styles.taskTitle, currentLevel === 2 && styles.level2Text]}>
                        {currentTask ? currentTask.title : 'Active Collaboration'}
                    </Text>
                    <Text style={[styles.taskSubtitle, currentLevel === 2 && styles.level2TextSecondary]}>
                        {currentTask ? `${currentTask.interest} • ${currentTask.duration}` : `Task ${taskCount}/4 • Level ${currentLevel}`}
                    </Text>
                    <Text style={[styles.levelBadge, currentLevel === 2 && styles.level2Accent]}>Level {currentLevel} • Task {taskCount}/4</Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.leaveButton}
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
                >
                    <LogOut size={22} color={BuddyTheme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                    {currentTask ? currentTask.description : 'Collaborate with your partner to complete this task and unlock deeper levels of connection.'}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, currentLevel === 2 && styles.level2Container]}>
            <View style={{ flex: 1 }}>
                {!showDragonAnim && (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                    >
                        <GestureHandlerRootView style={{ flex: 1 }}>
                            {currentTask?.type === 'ranking' ? (
                                <DraggableFlatList
                                    data={items}
                                    onDragEnd={({ data }) => {
                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                        setItems(data);
                                    }}
                                    onPlaceholderIndexChange={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={styles.listContent}
                                    ListHeaderComponent={renderTaskHeader}
                                    renderItem={({ item, drag, isActive, getIndex }: RenderItemParams<TaskItem>) => (
                                        <ScaleDecorator>
                                            <TouchableOpacity
                                                onPressIn={drag}
                                                activeOpacity={0.9}
                                                disabled={isActive}
                                            >
                                                <Animated.View
                                                    entering={FadeInDown.delay(getIndex()! * 50).springify()}
                                                    style={[
                                                        styles.itemCard,
                                                        item.addedBy === 'partner' && styles.partnerItem,
                                                        isActive && { backgroundColor: BuddyTheme.colors.surface, elevation: 15, zIndex: 100, transform: [{ scale: 1.02 }] }
                                                    ]}
                                                >
                                                    <View style={styles.itemHeader}>
                                                        <View style={styles.authorRow}>
                                                            <GripVertical size={20} color={BuddyTheme.colors.secondary} style={{ marginRight: 12 }} />
                                                            <View style={styles.rankBadge}>
                                                                <Text style={styles.rankText}>
                                                                    {getIndex() === 0 ? '1st' : getIndex() === 1 ? '2nd' : getIndex() === 2 ? '3rd' : `${getIndex()! + 1}th`}
                                                                </Text>
                                                            </View>
                                                            <Text style={[styles.itemText, isActive && styles.selectedText, { flex: 1 }]}>{item.text}</Text>
                                                        </View>
                                                    </View>
                                                    {currentLevel >= 2 && currentTask?.reflectionChips && (
                                                        <View style={styles.chipRow}>
                                                            {currentTask.reflectionChips.slice(0, 2).map((chip: string, i: number) => (
                                                                <TouchableOpacity
                                                                    key={i}
                                                                    style={styles.reflectionChip}
                                                                    onPress={() => {
                                                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                                        setChatInput(`Reacting to ${item.text}: ${chip}`);
                                                                        setShowChat(true);
                                                                    }}
                                                                >
                                                                    <Text style={styles.chipText}>{chip}</Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                    )}
                                                </Animated.View>
                                            </TouchableOpacity>
                                        </ScaleDecorator>
                                    )}
                                />
                            ) : currentTask?.type === 'showdown' ? (
                                <ScrollView
                                    contentContainerStyle={[styles.showdownContainer, { paddingTop: 0 }]}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {renderTaskHeader()}
                                    {!showdownRevealed ? (
                                        <Animated.View
                                            key={currentCardIndex}
                                            entering={FadeInRight.springify()}
                                            style={[styles.showdownCard, { marginTop: 20 }]}
                                        >
                                            <View style={styles.cardProgress}>
                                                <Text style={styles.cardProgressText}>Card {currentCardIndex + 1} of {currentTask.options?.length}</Text>
                                                <View style={styles.progressBar}>
                                                    <View style={[styles.progressFill, { width: `${((currentCardIndex + 1) / (currentTask.options?.length || 1)) * 100}%` }]} />
                                                </View>
                                            </View>

                                            <Text style={styles.showdownOptionText}>
                                                {currentTask.options?.[currentCardIndex]}
                                            </Text>

                                            <View style={[
                                                styles.showdownActions,
                                                currentTask.options?.[currentCardIndex].includes(' vs ') && { flexDirection: 'row', flexWrap: 'wrap' }
                                            ]}>
                                                {isPartnerWaiting ? (
                                                    <View style={styles.partnerDecisionCard}>
                                                        <ActivityIndicator color={BuddyTheme.colors.secondary} size="large" />
                                                        <Text style={styles.partnerDecisionText}>Partner is deciding...</Text>
                                                    </View>
                                                ) : (
                                                    currentTask.showdownButtons ? (
                                                        currentTask.showdownButtons.map((btn: any, i: number) => (
                                                            <TouchableOpacity
                                                                key={i}
                                                                style={styles.showdownButton}
                                                                onPress={() => handleShowdownChoice(btn.value)}
                                                            >
                                                                <Text style={styles.showdownButtonText}>{btn.label}</Text>
                                                            </TouchableOpacity>
                                                        ))
                                                    ) : currentTask.options?.[currentCardIndex].includes(' vs ') ? (
                                                        currentTask.options[currentCardIndex].split(' vs ').map((choice: string, i: number) => (
                                                            <TouchableOpacity
                                                                key={i}
                                                                style={[styles.showdownButton, { flex: 1, minWidth: '45%' }]}
                                                                onPress={() => handleShowdownChoice(choice)}
                                                            >
                                                                <Text style={styles.showdownButtonText}>{choice.trim()}</Text>
                                                            </TouchableOpacity>
                                                        ))
                                                    ) : (
                                                        ['🔥 Yes', '😐 Maybe', '❌ No'].map((label, i) => (
                                                            <TouchableOpacity
                                                                key={i}
                                                                style={styles.showdownButton}
                                                                onPress={() => handleShowdownChoice(label)}
                                                            >
                                                                <Text style={styles.showdownButtonText}>{label}</Text>
                                                            </TouchableOpacity>
                                                        ))
                                                    )
                                                )}
                                            </View>
                                        </Animated.View>
                                    ) : (
                                        <Animated.View entering={ZoomIn} style={[styles.showdownResultCard, { marginTop: 20 }]}>
                                            <View style={styles.sharedBadge}>
                                                <Text style={styles.sharedBadgeText}>REVEALED</Text>
                                            </View>
                                            <Text style={styles.resultMatchText}>You matched on 4/5 takes</Text>
                                            <View style={styles.resultSummary}>
                                                <View style={styles.summaryItem}>
                                                    <View style={[styles.summaryIndicator, { backgroundColor: '#4ADE80' }]} />
                                                    <Text style={styles.summaryText}>Same instinct (4)</Text>
                                                </View>
                                                <View style={styles.summaryItem}>
                                                    <View style={[styles.summaryIndicator, { backgroundColor: '#F87171' }]} />
                                                    <Text style={styles.summaryText}>Opposite instinct (1)</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.resultTip}>That’s interesting... curiosity unlocked.</Text>

                                            <View style={styles.revealedList}>
                                                {currentTask.options?.map((opt: string, i: number) => (
                                                    <View key={i} style={styles.revealedRow}>
                                                        <Text style={styles.revealedOption}>{opt}</Text>
                                                        <View style={styles.matchTag}>
                                                            <Text style={styles.matchTagText}>{i === 2 ? 'Opposite' : 'Same'}</Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        </Animated.View>
                                    )}
                                </ScrollView>
                            ) : (currentTask?.type === 'binary' || currentTask?.type === 'vote') ? (
                                <FlatList
                                    data={items}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={styles.listContent}
                                    ListHeaderComponent={renderTaskHeader}
                                    renderItem={({ item, index }) => (
                                        <Animated.View
                                            entering={FadeInDown.delay(index * 50).springify()}
                                            style={styles.binaryCard}
                                        >
                                            <Text style={styles.binaryQuestionText}>{item.text}</Text>
                                            <View style={styles.binaryChoiceRow}>
                                                {item.text.includes(' vs ') ? item.text.split(' vs ').map((choice, i) => (
                                                    <TouchableOpacity
                                                        key={i}
                                                        style={[
                                                            styles.binaryOption,
                                                            binarySelections[item.id] === choice.trim() && styles.binaryOptionSelected
                                                        ]}
                                                        onPress={() => toggleBinarySelection(item.id, choice.trim())}
                                                    >
                                                        <Text style={[
                                                            styles.binaryOptionText,
                                                            binarySelections[item.id] === choice.trim() && styles.binaryOptionTextSelected
                                                        ]}>{choice.trim()}</Text>
                                                    </TouchableOpacity>
                                                )) : (
                                                    ['Yes', 'No'].map((choice, i) => (
                                                        <TouchableOpacity
                                                            key={i}
                                                            style={[
                                                                styles.binaryOption,
                                                                binarySelections[item.id] === choice && styles.binaryOptionSelected
                                                            ]}
                                                            onPress={() => toggleBinarySelection(item.id, choice)}
                                                        >
                                                            <Text style={[
                                                                styles.binaryOptionText,
                                                                binarySelections[item.id] === choice && styles.binaryOptionTextSelected
                                                            ]}>{choice}</Text>
                                                        </TouchableOpacity>
                                                    ))
                                                )}
                                            </View>
                                        </Animated.View>
                                    )}
                                />
                            ) : (
                                <FlatList
                                    data={items}
                                    keyExtractor={(item) => item.id}
                                    contentContainerStyle={styles.listContent}
                                    ListHeaderComponent={renderTaskHeader}
                                    renderItem={({ item, index }) => (
                                        <GHTouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() => toggleItemSelection(item.id)}
                                        >
                                            <Animated.View
                                                entering={FadeInDown.delay(index * 50).springify()}
                                                style={[
                                                    styles.itemCard,
                                                    item.selected && styles.selectedItem
                                                ]}
                                            >
                                                <View style={styles.itemHeader}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.itemText, item.selected && styles.selectedText]}>{item.text}</Text>
                                                        {currentTask?.type === 'sorting' && sortingCategories[item.id] && sortingCategories[item.id] !== 'None' && (
                                                            <View style={[
                                                                styles.sortBadge,
                                                                sortingCategories[item.id] === 'Must-have' && styles.mustHave,
                                                                sortingCategories[item.id] === 'Nice-to-have' && styles.niceToHave,
                                                                sortingCategories[item.id] === 'Skip' && styles.skip
                                                            ]}>
                                                                <Text style={[
                                                                    styles.sortBadgeText,
                                                                    sortingCategories[item.id] === 'Must-have' && styles.mustHaveText,
                                                                    sortingCategories[item.id] === 'Nice-to-have' && styles.niceToHaveText,
                                                                    sortingCategories[item.id] === 'Skip' && styles.skipText
                                                                ]}>{sortingCategories[item.id]}</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    {(item.selected || (currentTask?.type === 'sorting' && sortingCategories[item.id] && sortingCategories[item.id] !== 'None')) && (
                                                        <CheckCircle2 size={18} color={BuddyTheme.colors.secondary} />
                                                    )}
                                                </View>
                                            </Animated.View>
                                        </GHTouchableOpacity>
                                    )}
                                />
                            )}
                        </GestureHandlerRootView>

                        {(!isNoTypingTask && currentLevel !== 2) && (
                            <View style={[styles.inputArea]}>
                                <View style={styles.inputRow}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Add your input..."
                                        placeholderTextColor={BuddyTheme.colors.textSecondary}
                                        value={inputText}
                                        onChangeText={setInputText}
                                    />
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={addItem}
                                        activeOpacity={0.8}
                                    >
                                        <Send size={24} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {currentLevel !== 2 && (
                            <View style={styles.bottomBar}>
                                <View style={styles.footerActions}>
                                    {chatUnlocked && (
                                        <TouchableOpacity
                                            style={[styles.chatButton]}
                                            onPress={() => setShowChat(true)}
                                            activeOpacity={0.7}
                                        >
                                            <MessageSquare size={20} color={BuddyTheme.colors.primary} />
                                            <Text style={[styles.chatButtonText]}>Quick Chat</Text>
                                        </TouchableOpacity>
                                    )}

                                    {voiceUnlocked && (
                                        <TouchableOpacity style={styles.voiceButton} activeOpacity={0.8}>
                                            <Mic size={20} color="#FFF" />
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={[
                                            styles.doneButton,
                                            (!isDone && currentTask?.type !== 'ranking' && items.length < 1) && styles.doneDisabled,
                                            !chatUnlocked && { flex: 1, justifyContent: 'center' }
                                        ]}
                                        onPress={completeTask}
                                        disabled={(currentTask?.type !== 'ranking' && items.length < 1) || isDone}
                                        activeOpacity={0.8}
                                    >
                                        <Animated.View
                                            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                                            entering={FadeInRight}
                                        >
                                            <Text style={styles.doneText}>{isDone ? 'Syncing...' : isNoTypingTask ? "Complete Selection" : "Finish Phase"}</Text>
                                            <CheckCircle2 size={18} color="#FFF" />
                                        </Animated.View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {currentLevel === 2 && (
                            <Animated.View
                                entering={FadeInUp.delay(800)}
                                style={styles.floatingDoneContainer}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.floatingDoneButton,
                                        isDone && { opacity: 0.7 }
                                    ]}
                                    onPress={completeTask}
                                    disabled={isDone}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.floatingDoneText}>{isDone ? 'Syncing...' : 'Complete Selection'}</Text>
                                    <CheckCircle2 size={20} color="#FFF" />
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* Chat Modal */}
                        <Modal
                            visible={showChat}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => setShowChat(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <Animated.View entering={SlideInDown} style={styles.modalContent}>
                                    <View style={styles.modalHeader}>
                                        <View>
                                            <Text style={styles.modalTitle}>{currentLevel === 2 ? 'Task Reactions' : 'Session Chat'}</Text>
                                            <Text style={styles.modalSubtitle}>{currentLevel === 2 ? 'Ephemeral • Ephemeral context shared only for this task' : 'Persistent session chat channel'}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setShowChat(false)}>
                                            <Text style={styles.closeText}>Hide</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {currentLevel === 2 && (
                                        <View style={styles.starterContainer}>
                                            <Text style={styles.starterTitle}>Tap to React</Text>
                                            <View style={styles.starterRow}>
                                                {SENTENCE_STARTERS.map((s, i) => (
                                                    <TouchableOpacity key={i} style={styles.starterChip} onPress={() => useStarter(s)}>
                                                        <Text style={styles.starterText}>{s}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    <FlatList
                                        data={messages}
                                        keyExtractor={(item) => item.id}
                                        style={styles.messageList}
                                        renderItem={({ item }) => (
                                            <View style={[
                                                styles.messageBubble,
                                                item.sender === 'me' ? styles.myMessage : styles.theirMessage
                                            ]}>
                                                <Text style={[styles.messageText, item.sender === 'partner' && styles.darkText]}>{item.text}</Text>
                                            </View>
                                        )}
                                    />

                                    <View style={styles.chatInputRow}>
                                        <TouchableOpacity style={styles.emojiButton}>
                                            <Smile size={24} color={BuddyTheme.colors.textSecondary} />
                                        </TouchableOpacity>
                                        <TextInput
                                            style={styles.chatInput}
                                            placeholder={currentLevel === 2 ? "Add a reaction (max 120 chars)..." : "Type a message..."}
                                            placeholderTextColor={BuddyTheme.colors.textSecondary}
                                            value={chatInput}
                                            onChangeText={(t) => setChatInput(currentLevel === 2 ? t.substring(0, 120) : t)}
                                            maxLength={currentLevel === 2 ? 120 : undefined}
                                        />
                                        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} activeOpacity={0.8}>
                                            <Send size={18} color="#FFF" />
                                        </TouchableOpacity>
                                    </View>
                                    {currentLevel === 2 && (
                                        <Text style={styles.charLimitText}>{chatInput.length}/120</Text>
                                    )}
                                </Animated.View>
                            </View>
                        </Modal>

                        {/* Identity Reveal Modal */}
                        <Modal
                            visible={showReveal}
                            animationType="fade"
                            transparent={true}
                        >
                            <View style={styles.revealOverlay}>
                                <Animated.View entering={ZoomIn} style={styles.revealContent}>
                                    <Text style={styles.revealTitle}>Layer 4 Established</Text>
                                    <Text style={styles.revealSubtitle}>
                                        Sufficient shared history has been recorded. Mutual identity disclosure is now available.
                                    </Text>

                                    <View style={styles.revealActions}>
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={styles.revealButton}
                                            onPress={() => {
                                                setRevealed(true);
                                                setShowReveal(false);
                                            }}
                                        >
                                            <User size={20} color="#FFF" />
                                            <Text style={styles.revealButtonText}>Reveal My Identity</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.notReadyButton}
                                            onPress={() => setShowReveal(false)}
                                        >
                                            <Text style={styles.notReadyText}>Continue Anonymously</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </View>
                        </Modal>

                        {/* Compatibility Score Modal */}
                        <Modal
                            visible={showScore}
                            animationType="fade"
                            transparent={true}
                        >
                            <View style={styles.scoreOverlay}>
                                <Animated.View entering={ZoomIn.duration(600)} style={styles.scoreContent}>
                                    <View style={styles.sharedBadge}>
                                        <Text style={styles.sharedBadgeText}>VISIBLE TO BOTH</Text>
                                    </View>

                                    <Text style={styles.scoreLabel}>Phase {taskCount} Compatibility</Text>

                                    <Animated.View entering={ZoomIn.duration(800).delay(400).springify()} style={styles.scoreCircle}>
                                        <Text style={styles.scoreValue}>{score}%</Text>
                                        <Text style={styles.scoreSubtext}>Sync Rate</Text>
                                    </Animated.View>

                                    <Animated.View entering={FadeInDown.delay(800)} style={{ width: '100%', alignItems: 'center' }}>
                                        <Text style={styles.scoreMessage}>
                                            {score > 90
                                                ? "Perfect wavelength! You both think remarkably alike."
                                                : score > 85
                                                    ? "Strong alignment detected. Great collaboration!"
                                                    : "You're building a unique synergy together."}
                                        </Text>

                                        {currentLevel === 2 && (
                                            <View style={styles.reactionInvite}>
                                                <Text style={styles.reactionInviteText}>Safe pattern detected. Add a micro-reflection?</Text>
                                                <TouchableOpacity
                                                    style={styles.reactionInviteButton}
                                                    onPress={() => {
                                                        setShowScore(false);
                                                        setShowChat(true);
                                                    }}
                                                >
                                                    <Smile size={18} color={BuddyTheme.colors.primary} />
                                                    <Text style={styles.reactionInviteButtonText}>React</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        <TouchableOpacity
                                            style={styles.continueButton}
                                            onPress={proceedToNext}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={styles.continueButtonText}>Continue to Task {taskCount + 1}</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                </Animated.View>
                            </View>
                        </Modal>

                        {/* Level 2 Unlock Modal */}
                        <Modal
                            visible={showUnlock}
                            animationType="fade"
                            transparent={true}
                        >
                            <View style={styles.revealOverlay}>
                                <Animated.View entering={ZoomIn} style={styles.unlockContent}>
                                    <View style={styles.sharedBadge}>
                                        <Text style={styles.sharedBadgeText}>LEVEL 2 UNLOCKED</Text>
                                    </View>
                                    <Text style={styles.revealTitle}>Context Unlocked</Text>
                                    <Text style={styles.revealSubtitle}>
                                        You've completed 4 tasks together. Patterns are emerging. You can now add micro-reactions to shared outcomes.
                                    </Text>

                                    <View style={styles.unlockFeatures}>
                                        <View style={styles.featureItem}>
                                            <Smile size={20} color={BuddyTheme.colors.secondary} />
                                            <Text style={styles.featureText}>Tap-to-react chips</Text>
                                        </View>
                                        <View style={styles.featureItem}>
                                            <MessageSquare size={20} color={BuddyTheme.colors.secondary} />
                                            <Text style={styles.featureText}>120-character micro-context</Text>
                                        </View>
                                    </View>

                                    <View style={styles.revealActions}>
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={styles.revealButton}
                                            onPress={startLevel2Transition}
                                        >
                                            <Text style={styles.revealButtonText}>Enter Phase 2</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.notReadyButton}
                                            onPress={() => setShowUnlock(false)}
                                        >
                                            <Text style={styles.notReadyText}>Skip for now</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </View>
                        </Modal>
                    </KeyboardAvoidingView>
                )}

                {showDragonAnim && (
                    <View style={StyleSheet.absoluteFillObject}>
                        <Animated.View style={dragonBgStyle} />
                        <Animated.View style={[styles.dragonContainer, dragonStyle]}>
                            <Image
                                source={require('../../assets/dragon.png')}
                                style={styles.dragonImage}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <Animated.View style={[styles.friendsContainer, friendsStyle]}>
                            <Image
                                source={require('../../assets/friends.png')}
                                style={styles.friendsImage}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BuddyTheme.colors.background,
    },
    header: {
        paddingVertical: 24,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    taskTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: BuddyTheme.colors.primary,
    },
    taskSubtitle: {
        fontSize: 13,
        color: BuddyTheme.colors.textSecondary,
        marginTop: 2,
        fontWeight: '500',
    },
    levelBadge: {
        fontSize: 11,
        fontWeight: '900',
        color: BuddyTheme.colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 4,
    },
    leaveButton: {
        padding: 4,
    },
    descriptionBox: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        backgroundColor: BuddyTheme.colors.surface,
        borderRadius: BuddyTheme.borderRadius.lg,
        borderWidth: 1.5,
        borderColor: BuddyTheme.colors.border,
    },
    descriptionText: {
        color: BuddyTheme.colors.textPrimary,
        lineHeight: 24,
        fontSize: 15,
    },
    listContent: {
        paddingHorizontal: 20,
        gap: 16,
        paddingBottom: 100,
    },
    itemCard: {
        backgroundColor: BuddyTheme.colors.surface,
        padding: 20,
        borderRadius: BuddyTheme.borderRadius.lg,
        borderLeftWidth: 6,
        borderLeftColor: BuddyTheme.colors.primary,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    partnerItem: {
        borderLeftColor: BuddyTheme.colors.secondary,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemText: {
        color: BuddyTheme.colors.textPrimary,
        fontSize: 16,
        lineHeight: 24,
    },
    selectedItem: {
        borderColor: BuddyTheme.colors.secondary,
        backgroundColor: BuddyTheme.colors.secondary + '05',
        borderLeftWidth: 10,
    },
    selectedText: {
        fontWeight: '700',
        color: BuddyTheme.colors.primary,
    },
    rankBadge: {
        backgroundColor: BuddyTheme.colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 10,
        minWidth: 40,
        alignItems: 'center',
    },
    rankText: {
        color: BuddyTheme.colors.primary,
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    binaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    binaryButton: {
        flex: 1,
        backgroundColor: BuddyTheme.colors.surface,
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: BuddyTheme.colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    binarySelected: {
        borderColor: BuddyTheme.colors.secondary,
        backgroundColor: BuddyTheme.colors.secondary + '10',
    },
    binaryText: {
        fontSize: 16,
        fontWeight: '700',
        color: BuddyTheme.colors.textPrimary,
        textAlign: 'center',
    },
    binarySelectedText: {
        color: BuddyTheme.colors.primary,
    },
    inputArea: {
        padding: 32,
        backgroundColor: BuddyTheme.colors.surface,
        borderTopWidth: 1.5,
        borderTopColor: BuddyTheme.colors.border,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    input: {
        flex: 1,
        backgroundColor: BuddyTheme.colors.background,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: BuddyTheme.colors.textPrimary,
        fontSize: 16,
        borderWidth: 1.5,
        borderColor: BuddyTheme.colors.border,
    },
    addButton: {
        backgroundColor: BuddyTheme.colors.primary,
        width: 54,
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bottomBar: {
        padding: 32,
        backgroundColor: BuddyTheme.colors.surface,
        borderTopWidth: 1.5,
        borderTopColor: BuddyTheme.colors.border,
    },
    footerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
        backgroundColor: BuddyTheme.colors.background,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: BuddyTheme.colors.border,
    },
    chatButtonText: {
        color: BuddyTheme.colors.primary,
        fontWeight: '700',
        fontSize: 14,
    },
    chatLocked: {
        opacity: 0.5,
    },
    lockedText: {
        color: BuddyTheme.colors.textSecondary,
    },
    voiceButton: {
        backgroundColor: BuddyTheme.colors.accent,
        width: 54,
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneButton: {
        backgroundColor: BuddyTheme.colors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 14,
    },
    doneDisabled: {
        backgroundColor: BuddyTheme.colors.border,
    },
    doneText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: BuddyTheme.colors.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '75%',
        padding: 32,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: BuddyTheme.colors.primary,
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeText: {
        color: BuddyTheme.colors.secondary,
        fontWeight: '700',
        fontSize: 16,
    },
    messageList: {
        flex: 1,
        marginBottom: 24,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 16,
        borderRadius: 18,
        marginBottom: 12,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: BuddyTheme.colors.primary,
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: BuddyTheme.colors.background,
        borderBottomLeftRadius: 4,
        borderWidth: 1.5,
        borderColor: BuddyTheme.colors.border,
    },
    messageText: {
        color: '#FFF',
        fontSize: 16,
        lineHeight: 22,
    },
    darkText: {
        color: BuddyTheme.colors.textPrimary,
    },
    chatInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: BuddyTheme.colors.background,
        borderRadius: 20,
        padding: 10,
        borderWidth: 1.5,
        borderColor: BuddyTheme.colors.border,
    },
    chatInput: {
        flex: 1,
        color: BuddyTheme.colors.textPrimary,
        fontSize: 16,
        paddingVertical: 10,
    },
    emojiButton: {
        padding: 4,
    },
    sendButton: {
        backgroundColor: BuddyTheme.colors.primary,
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    revealOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        padding: 32,
    },
    revealContent: {
        backgroundColor: BuddyTheme.colors.surface,
        borderRadius: 32,
        padding: 40,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: BuddyTheme.colors.secondary,
    },
    revealTitle: {
        color: BuddyTheme.colors.primary,
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    revealSubtitle: {
        color: BuddyTheme.colors.textSecondary,
        fontSize: 17,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 40,
    },
    revealActions: {
        width: '100%',
        gap: 16,
    },
    revealButton: {
        backgroundColor: BuddyTheme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 20,
        borderRadius: 16,
    },
    revealButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    notReadyButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    notReadyText: {
        color: BuddyTheme.colors.textSecondary,
        fontSize: 15,
        fontWeight: '600',
    },
    scoreOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    scoreContent: {
        backgroundColor: BuddyTheme.colors.surface,
        borderRadius: 40,
        padding: 40,
        width: '100%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: BuddyTheme.colors.accent + '30',
    },
    sharedBadge: {
        backgroundColor: BuddyTheme.colors.secondary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 24,
    },
    sharedBadgeText: {
        color: BuddyTheme.colors.secondary,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    scoreLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: BuddyTheme.colors.textSecondary,
        marginBottom: 32,
    },
    scoreCircle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 8,
        borderColor: BuddyTheme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        backgroundColor: BuddyTheme.colors.accent + '05',
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: '900',
        color: BuddyTheme.colors.primary,
    },
    scoreSubtext: {
        fontSize: 14,
        fontWeight: '700',
        color: BuddyTheme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scoreMessage: {
        fontSize: 17,
        color: BuddyTheme.colors.textPrimary,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    continueButton: {
        backgroundColor: BuddyTheme.colors.primary,
        width: '100%',
        paddingVertical: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    binaryCard: {
        backgroundColor: BuddyTheme.colors.surface,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: BuddyTheme.colors.border,
    },
    binaryQuestionText: {
        fontSize: 14,
        fontWeight: '700',
        color: BuddyTheme.colors.textSecondary,
        marginBottom: 12,
        textAlign: 'center',
    },
    binaryChoiceRow: {
        flexDirection: 'row',
        gap: 10,
    },
    binaryOption: {
        flex: 1,
        backgroundColor: BuddyTheme.colors.background,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: BuddyTheme.colors.border,
    },
    binaryOptionSelected: {
        backgroundColor: BuddyTheme.colors.primary,
        borderColor: BuddyTheme.colors.primary,
    },
    binaryOptionText: {
        fontSize: 15,
        fontWeight: '800',
        color: BuddyTheme.colors.textPrimary,
    },
    binaryOptionTextSelected: {
        color: '#FFF',
    },
    showdownContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 120,
        alignItems: 'center',
        width: '100%',
    },
    showdownCard: {
        width: '100%',
        backgroundColor: BuddyTheme.colors.surface,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        borderWidth: 1,
        borderColor: BuddyTheme.colors.border,
    },
    cardProgress: {
        width: '100%',
        marginBottom: 24,
    },
    cardProgressText: {
        color: BuddyTheme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
    },
    showdownOptionText: {
        fontSize: 24,
        fontWeight: '800',
        color: BuddyTheme.colors.primary,
        textAlign: 'center',
        marginVertical: 40,
        lineHeight: 32,
    },
    showdownActions: {
        width: '100%',
        gap: 12,
    },
    showdownButton: {
        width: '100%',
        backgroundColor: BuddyTheme.colors.background,
        paddingVertical: 18,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: BuddyTheme.colors.border,
        alignItems: 'center',
    },
    showdownButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: BuddyTheme.colors.textPrimary,
    },
    showdownResultCard: {
        backgroundColor: BuddyTheme.colors.surface,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: BuddyTheme.colors.secondary,
        width: '100%',
    },
    resultMatchText: {
        fontSize: 20,
        fontWeight: '900',
        color: BuddyTheme.colors.primary,
        marginTop: 16,
    },
    resultSummary: {
        flexDirection: 'row',
        gap: 16,
        marginVertical: 16,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    summaryIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    summaryText: {
        fontSize: 12,
        color: BuddyTheme.colors.textSecondary,
        fontWeight: '600',
    },
    resultTip: {
        fontSize: 14,
        color: BuddyTheme.colors.secondary,
        fontWeight: '700',
        marginBottom: 24,
    },
    revealedList: {
        width: '100%',
        gap: 12,
    },
    revealedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: BuddyTheme.colors.background,
        borderRadius: 12,
    },
    revealedOption: {
        fontSize: 13,
        color: BuddyTheme.colors.textPrimary,
        flex: 1,
        marginRight: 12,
    },
    matchTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: BuddyTheme.colors.surface,
        borderWidth: 1,
        borderColor: BuddyTheme.colors.border,
    },
    matchTagText: {
        fontSize: 10,
        fontWeight: '800',
        color: BuddyTheme.colors.textSecondary,
    },
    level2Container: {
        backgroundColor: '#0F172A',
    },
    dragonContainer: {
        position: 'absolute',
        top: '20%',
        left: 0,
        zIndex: 50,
        width: 200,
        height: 150,
    },
    dragonImage: {
        width: '100%',
        height: '100%',
    },
    level2InputArea: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingTop: 8,
        paddingBottom: 12,
        maxHeight: 100,
    },
    friendsContainer: {
        position: 'absolute',
        top: '20%',
        left: 0,
        zIndex: 51,
        width: 100,
        height: 80,
    },
    friendsImage: {
        width: '100%',
        height: '100%',
    },
    level2Text: {
        color: '#F8FAFC',
    },
    level2TextSecondary: {
        color: '#94A3B8',
    },
    level2Accent: {
        color: '#F472B6',
    },
    taskReflectionArea: {
        padding: 16,
        backgroundColor: BuddyTheme.colors.background,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: BuddyTheme.colors.border,
    },
    reflectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: BuddyTheme.colors.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 1,
    },
    starterGridHorizontal: {
        gap: 10,
    },
    reflectionChipSmall: {
        backgroundColor: BuddyTheme.colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1.2,
        borderColor: BuddyTheme.colors.border,
    },
    reflectionChipText: {
        color: BuddyTheme.colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    reflectionChip: {
        backgroundColor: BuddyTheme.colors.background,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: BuddyTheme.colors.border,
    },
    chipText: {
        fontSize: 12,
        color: BuddyTheme.colors.textSecondary,
        fontWeight: '600',
    },
    partnerDecisionCard: {
        backgroundColor: BuddyTheme.colors.background,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        gap: 16,
    },
    partnerDecisionText: {
        color: BuddyTheme.colors.textSecondary,
        fontWeight: '600',
    },
    progressBar: {
        height: 6,
        backgroundColor: BuddyTheme.colors.background,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: BuddyTheme.colors.secondary,
        borderRadius: 3,
    },
    sortBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    sortBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    mustHave: {
        backgroundColor: '#4ADE8020',
        borderWidth: 1,
        borderColor: '#22C55E',
    },
    niceToHave: {
        backgroundColor: '#60A5FA20',
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    skip: {
        backgroundColor: '#F8717120',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    mustHaveText: { color: '#166534' },
    niceToHaveText: { color: '#1E40AF' },
    skipText: { color: '#991B1B' },
    unlockContent: {
        backgroundColor: BuddyTheme.colors.surface,
        padding: 40,
        borderRadius: 32,
        width: '85%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    unlockFeatures: {
        width: '100%',
        marginVertical: 32,
        gap: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: BuddyTheme.colors.background,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BuddyTheme.colors.border,
    },
    featureText: {
        color: BuddyTheme.colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    reactionInvite: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
        padding: 16,
        backgroundColor: BuddyTheme.colors.background,
        borderRadius: 16,
        width: '100%',
    },
    reactionInviteText: {
        fontSize: 14,
        color: BuddyTheme.colors.textSecondary,
        marginBottom: 12,
        fontWeight: '600',
    },
    reactionInviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: BuddyTheme.colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BuddyTheme.colors.border,
    },
    reactionInviteButtonText: {
        color: BuddyTheme.colors.primary,
        fontWeight: '700',
    },
    modalSubtitle: {
        fontSize: 14,
        color: BuddyTheme.colors.textSecondary,
    },
    starterContainer: {
        marginTop: 16,
    },
    starterTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: BuddyTheme.colors.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    starterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    starterChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: BuddyTheme.colors.background,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: BuddyTheme.colors.border,
    },
    starterText: {
        fontSize: 12,
        color: BuddyTheme.colors.textPrimary,
    },
    charLimitText: {
        fontSize: 10,
        color: BuddyTheme.colors.textSecondary,
        textAlign: 'right',
        marginTop: 4,
    },
    floatingDoneContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        zIndex: 100,
    },
    floatingDoneButton: {
        backgroundColor: BuddyTheme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    floatingDoneText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    }
});
