import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, GripVertical, LogOut, MessageSquare, Mic, Plus, Send, Smile, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeInRight, SlideInDown, ZoomIn } from 'react-native-reanimated';
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

    // Sync taskCount from params when they change
    React.useEffect(() => {
        if (count) setTaskCount(parseInt(count as string));
    }, [count]);

    // Reset items and state when ID changes (new task in session)
    React.useEffect(() => {
        if (currentTask) {
            const initialItems: TaskItem[] = currentTask.options?.map((option: any, index: number) => ({
                id: (index + 1).toString(),
                text: option,
                addedBy: 'partner' as const,
                timestamp: `Item ${index + 1}`
            })) || [];
            setItems(initialItems);
            setBinarySelections({});
            setIsDone(false);
        }
    }, [id]);

    const chatUnlocked = currentLevel >= 2;
    const voiceUnlocked = currentLevel >= 3;
    const revealPossible = currentLevel >= 4;

    const isNoTypingTask = ['ranking', 'selection', 'binary', 'sorting', 'puzzle'].includes(currentTask?.type || '');

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
            // Transition to Level 2
            const level2Tasks = taskData.tasks.filter(t => t.level === 2);
            const nextId = level2Tasks[Math.floor(Math.random() * level2Tasks.length)].id;

            router.replace({
                pathname: '/task/[id]',
                params: { id: nextId.toString(), count: '1', level: '2' }
            });
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
        setMessages([...messages, { id: Date.now().toString(), text: chatInput, sender: 'me' }]);
        setChatInput('');
    };

    const [binarySelections, setBinarySelections] = useState<Record<string, string>>({});

    const toggleBinarySelection = (itemId: string, choice: string) => {
        setBinarySelections(prev => ({
            ...prev,
            [itemId]: choice
        }));
    };

    const toggleItemSelection = (itemId: string) => {
        if (!['selection', 'binary', 'vote'].includes(currentTask?.type || '')) return;

        setItems(prev => prev.map(item =>
            item.id === itemId
                ? { ...item, selected: !item.selected }
                : item
        ));
    };

    const partnerName = revealed ? 'Alex Chen' : 'Participant #17';

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.taskTitle}>
                            {currentTask ? currentTask.title : 'Active Collaboration'}
                        </Text>
                        <Text style={styles.taskSubtitle}>
                            {currentTask ? `${currentTask.interest} • ${currentTask.duration}` : `Task ${taskCount}/4 • Level ${currentLevel}`}
                        </Text>
                        <Text style={styles.levelBadge}>Level {currentLevel} • Task {taskCount}/4</Text>
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

                <GestureHandlerRootView style={{ flex: 1 }}>
                    {currentTask?.type === 'ranking' ? (
                        <DraggableFlatList
                            data={items}
                            onDragEnd={({ data }) => setItems(data)}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item, drag, isActive, getIndex }: RenderItemParams<TaskItem>) => (
                                <ScaleDecorator>
                                    <TouchableOpacity
                                        onLongPress={drag}
                                        disabled={isActive}
                                        style={[
                                            styles.itemCard,
                                            item.addedBy === 'partner' && styles.partnerItem,
                                            isActive && { backgroundColor: BuddyTheme.colors.surface, elevation: 10, zIndex: 100 }
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
                                                <Text style={[styles.itemText, isActive && styles.selectedText]}>{item.text}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </ScaleDecorator>
                            )}
                        />
                    ) : currentTask?.type === 'binary' ? (
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => {
                                const parts = item.text.split(/ vs | or | \/ /i);
                                return (
                                    <View style={styles.binaryRow}>
                                        {parts.map((choice, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                style={[
                                                    styles.binaryButton,
                                                    binarySelections[item.id] === choice && styles.binarySelected
                                                ]}
                                                onPress={() => toggleBinarySelection(item.id, choice)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.binaryText,
                                                    binarySelections[item.id] === choice && styles.binarySelectedText
                                                ]}>{choice}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                );
                            }}
                        />
                    ) : (
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => toggleItemSelection(item.id)}
                                >
                                    <Animated.View
                                        entering={FadeInRight}
                                        style={[
                                            styles.itemCard,
                                            item.selected && styles.selectedItem
                                        ]}
                                    >
                                        <View style={styles.itemHeader}>
                                            <Text style={[styles.itemText, item.selected && styles.selectedText]}>{item.text}</Text>
                                            {item.selected && <CheckCircle2 size={18} color={BuddyTheme.colors.secondary} />}
                                        </View>
                                    </Animated.View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </GestureHandlerRootView>

                {!isNoTypingTask && (
                    <View style={styles.inputArea}>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Add your input..."
                                placeholderTextColor={BuddyTheme.colors.textSecondary}
                                value={inputText}
                                onChangeText={setInputText}
                            />
                            <TouchableOpacity style={styles.addButton} onPress={addItem} activeOpacity={0.8}>
                                <Plus size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

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
                            <Text style={styles.doneText}>{isDone ? 'Syncing...' : isNoTypingTask ? "Complete Selection" : "Finish Phase"}</Text>
                            <CheckCircle2 size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

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
                                <Text style={styles.modalTitle}>Session Chat</Text>
                                <TouchableOpacity onPress={() => setShowChat(false)}>
                                    <Text style={styles.closeText}>Hide</Text>
                                </TouchableOpacity>
                            </View>

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
                                    placeholder="Type a message..."
                                    placeholderTextColor={BuddyTheme.colors.textSecondary}
                                    value={chatInput}
                                    onChangeText={setChatInput}
                                />
                                <TouchableOpacity style={styles.sendButton} onPress={sendMessage} activeOpacity={0.8}>
                                    <Send size={18} color="#FFF" />
                                </TouchableOpacity>
                            </View>
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

                            <View style={styles.scoreCircle}>
                                <Text style={styles.scoreValue}>{score}%</Text>
                                <Text style={styles.scoreSubtext}>Sync Rate</Text>
                            </View>

                            <Text style={styles.scoreMessage}>
                                {score > 90
                                    ? "Perfect wavelength! You both think remarkably alike."
                                    : score > 85
                                        ? "Strong alignment detected. Great collaboration!"
                                        : "You're building a unique synergy together."}
                            </Text>

                            <TouchableOpacity
                                style={styles.continueButton}
                                onPress={proceedToNext}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.continueButtonText}>Continue to Phase {taskCount + 1}</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BuddyTheme.colors.background,
    },
    header: {
        padding: 32,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    taskTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: BuddyTheme.colors.primary,
    },
    taskSubtitle: {
        fontSize: 14,
        color: BuddyTheme.colors.textSecondary,
        marginTop: 2,
        fontWeight: '500',
    },
    levelBadge: {
        fontSize: 12,
        fontWeight: '900',
        color: BuddyTheme.colors.secondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 4,
    },
    leaveButton: {
        padding: 8,
    },
    descriptionBox: {
        marginHorizontal: 32,
        marginBottom: 24,
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
        paddingHorizontal: 32,
        gap: 16,
        paddingBottom: 40,
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
});
