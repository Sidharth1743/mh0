import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from 'convex/react';
import { AudioModule, useAudioRecorder } from 'expo-audio';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, LogOut, MessageSquare, Mic, Play, Plus, Send, Smile, Square, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';

interface TaskItem {
    id: string;
    text: string;
    addedBy: 'me' | 'partner';
    timestamp: string | number;
}

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'partner';
    type: string;
}

export default function TaskScreen() {
    const { id: matchId } = useLocalSearchParams();
    const router = useRouter();
    const [userId, setUserId] = useState<Id<"users"> | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const id = await AsyncStorage.getItem('convex_user_id');
            if (id) setUserId(id as Id<"users">);
        };
        fetchUser();
    }, []);

    // Convex Queries
    const matchTasks = useQuery(api.tasks.getMatchTasks, { matchId: matchId as Id<"matches"> });
    const convexMessages = useQuery(api.tasks.getMessages, { matchId: matchId as Id<"matches"> });
    const match = useQuery(api.users.getMatch, { matchId: matchId as Id<"matches"> });

    // Convex Mutations
    const addTaskItemMut = useMutation(api.tasks.addTaskItem);
    const sendMessageMut = useMutation(api.tasks.sendMessage);
    const completePhaseMut = useMutation(api.tasks.completePhase);
    const toggleRevealMut = useMutation(api.users.toggleReveal);

    const [inputText, setInputText] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [isDone, setIsDone] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showReveal, setShowReveal] = useState(false);

    // Voice Recording
    const recorder = useAudioRecorder({
        extension: '.m4a',
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        android: {
            extension: '.m4a',
            sampleRate: 44100,
            outputFormat: 'mpeg4' as any,
            audioEncoder: 'aac' as any,
        },
        ios: {
            extension: '.m4a',
            sampleRate: 44100,
            audioQuality: 0,
        },
        web: {}
    });
    const [isRecording, setIsRecording] = useState(false);

    // Derived State
    const taskCount = match?.matchLevel || 1;
    const revealed = match?.revealedUserIds?.length === 2;
    const iHaveRevealed = (userId && match?.revealedUserIds?.includes(userId as Id<"users">)) || false;
    const partnerRevealed = (userId && match?.revealedUserIds?.some(id => id !== (userId as string))) || false;
    const items: TaskItem[] = matchTasks?.[0]?.data?.items?.map((item: any) => ({
        id: item.id,
        text: item.text,
        addedBy: (userId && item.userId === (userId as string)) ? 'me' : 'partner',
        timestamp: item.timestamp
    })) || [];

    const messages: Message[] = convexMessages?.map((msg: any) => ({
        id: msg._id,
        text: msg.text,
        type: msg.type || 'text',
        sender: (userId && msg.senderId === (userId as string)) ? 'me' : 'partner'
    })) || [];

    const chatUnlocked = taskCount >= 2;
    const voiceUnlocked = taskCount >= 4;
    const revealPossible = taskCount >= 6;

    const addItem = async () => {
        if (!inputText.trim() || !userId) return;
        await addTaskItemMut({
            matchId: matchId as Id<"matches">,
            text: inputText,
            userId
        });
        setInputText('');
    };

    const completeTask = async () => {
        if (!userId) return;
        setIsDone(true);
        await completePhaseMut({
            matchId: matchId as Id<"matches">,
            userId
        });
        setIsDone(false);
        if (taskCount + 1 === 6) {
            setShowReveal(true);
        }
    };

    const sendMessage = async () => {
        if (!chatInput.trim() || !userId) return;
        await sendMessageMut({
            matchId: matchId as Id<"matches">,
            senderId: userId,
            text: chatInput,
            type: "text"
        });
        setChatInput('');
    };

    const toggleRecording = async () => {
        if (!userId) return;
        if (isRecording) {
            console.log('Stopping recording...');
            await recorder.stop();
            setIsRecording(false);
            const uri = recorder.uri;
            console.log('Recording stopped, URI:', uri);
            if (uri) {
                console.log('Sending voice message...');
                await sendMessageMut({
                    matchId: matchId as Id<"matches">,
                    senderId: userId,
                    text: uri,
                    type: 'voice'
                });
                console.log('Voice message sent.');
            }
        } else {
            console.log('Requesting audio permissions...');
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (status.granted) {
                console.log('Starting recording...');
                recorder.record();
                setIsRecording(true);
            } else {
                console.warn('Audio permission denied');
            }
        }
    };

    const partnerName = revealed ? 'Alex Chen' : 'Participant #17';

    // Mutation for leaving
    const leaveMatchMut = useMutation(api.users.leaveMatch);

    const handleLeave = async () => {
        if (userId) {
            console.log('Leaving match...');
            await leaveMatchMut({ matchId: matchId as Id<"matches">, userId });
        }
        router.replace('/(tabs)');
    };

    if (!userId) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={BuddyTheme.colors.primary} />
                    <Text style={{ marginTop: 12, color: BuddyTheme.colors.textSecondary }}>Initializing session...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <Stack.Screen options={{ title: `Mission Control #${taskCount}`, headerBackTitle: 'Back' }} />
                <View style={styles.header}>
                    <View>
                        <Text style={styles.taskTitle}>
                            {taskCount === 1 ? 'Architecture Analysis' : taskCount < 4 ? 'Strategic Planning' : 'Problem Solving'}
                        </Text>
                        <Text style={styles.taskSubtitle}>
                            Phase {taskCount} • Session with {partnerName}
                        </Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} style={styles.leaveButton} onPress={handleLeave}>
                        <LogOut size={22} color={BuddyTheme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>
                        {taskCount === 1
                            ? 'Iteratively build a list of core principles for scalable mobile architecture.'
                            : taskCount < 4
                                ? 'Review the proposed strategies and identify the top 3 highest impact items.'
                                : 'Identify the logical architectural flaw in the provided system diagram.'}
                    </Text>
                </View>

                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <Animated.View
                            entering={FadeInRight}
                            style={[
                                styles.itemCard,
                                item.addedBy === 'partner' && styles.partnerItem
                            ]}
                        >
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemAuthor}>
                                    {item.addedBy === 'me' ? 'You' : partnerName}
                                </Text>
                                <Text style={styles.itemTime}>
                                    {typeof item.timestamp === 'number'
                                        ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : item.timestamp}
                                </Text>
                            </View>
                            <Text style={styles.itemText}>{item.text}</Text>
                        </Animated.View>
                    )}
                />

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

                    <View style={styles.footerActions}>
                        <TouchableOpacity
                            style={[styles.chatButton, !chatUnlocked && styles.chatLocked]}
                            onPress={() => chatUnlocked && setShowChat(true)}
                            activeOpacity={0.7}
                        >
                            <MessageSquare size={20} color={chatUnlocked ? BuddyTheme.colors.primary : "#94A3B8"} />
                            <Text style={[styles.chatButtonText, !chatUnlocked && styles.lockedText]}>
                                {chatUnlocked ? 'Quick Chat' : 'Chat Restricted'}
                            </Text>
                        </TouchableOpacity>

                        {voiceUnlocked && (
                            <TouchableOpacity
                                style={[styles.voiceButton, isRecording && styles.recordingActive]}
                                activeOpacity={0.8}
                                onPress={toggleRecording}
                            >
                                {isRecording ? <Square size={20} color="#FFF" /> : <Mic size={20} color="#FFF" />}
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.doneButton, (items.length < 1 && !isDone) && styles.doneDisabled]}
                            onPress={completeTask}
                            disabled={items.length < 1 || isDone}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.doneText}>{isDone ? 'Syncing...' : "Finish Phase"}</Text>
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
                                        {item.type === 'voice' ? (
                                            <TouchableOpacity style={styles.voiceMessageBubble} activeOpacity={0.7}>
                                                <Play size={16} color={item.sender === 'me' ? "#FFF" : BuddyTheme.colors.primary} />
                                                <Text style={[styles.voiceDuration, item.sender === 'partner' && styles.darkText]}>Voice Note</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <Text style={[styles.messageText, item.sender === 'partner' && styles.darkText]}>{item.text}</Text>
                                        )}
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
                    visible={showReveal && !revealed}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setShowReveal(false)}
                >
                    <View style={styles.revealOverlay}>
                        <Animated.View entering={ZoomIn} style={styles.revealContent}>
                            <Text style={styles.revealTitle}>Layer 4 Established</Text>
                            <Text style={styles.revealSubtitle}>
                                {partnerRevealed
                                    ? "Your partner has agreed to reveal their identity! Would you like to share yours?"
                                    : "Sufficient shared history has been recorded. Mutual identity disclosure is now available."}
                            </Text>

                            <View style={styles.revealActions}>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    style={[styles.revealButton, iHaveRevealed && { opacity: 0.7 }]}
                                    onPress={async () => {
                                        if (userId) {
                                            await toggleRevealMut({ matchId: matchId as Id<"matches">, userId });
                                        }
                                    }}
                                >
                                    <User size={20} color="#FFF" />
                                    <Text style={styles.revealButtonText}>
                                        {iHaveRevealed ? 'Sent Reveal Request' : 'Reveal My Identity'}
                                    </Text>
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
        fontSize: 15,
        color: BuddyTheme.colors.textSecondary,
        marginTop: 4,
        fontWeight: '500',
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
        marginBottom: 8,
    },
    itemAuthor: {
        fontSize: 13,
        fontWeight: '800',
        color: BuddyTheme.colors.textSecondary,
        letterSpacing: 0.5,
    },
    itemTime: {
        fontSize: 11,
        color: BuddyTheme.colors.textSecondary,
    },
    itemText: {
        color: BuddyTheme.colors.textPrimary,
        fontSize: 16,
        lineHeight: 24,
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
    recordingActive: {
        backgroundColor: '#FF4B4B',
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
    voiceMessageBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minWidth: 120,
    },
    voiceDuration: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
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
});
