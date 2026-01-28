import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, LogOut, MessageSquare, Mic, Plus, Send, Smile, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';

interface TaskItem {
    id: string;
    text: string;
    addedBy: 'me' | 'partner';
    timestamp: string;
}

interface Message {
    id: string;
    text: string;
    sender: 'me' | 'partner';
}

export default function TaskScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [items, setItems] = useState<TaskItem[]>([
        { id: '1', text: 'Distributed systems in mobile architecture', addedBy: 'partner', timestamp: '2m ago' }
    ]);
    const [inputText, setInputText] = useState('');

    // Progression State
    const [taskCount, setTaskCount] = useState(1);
    const [isDone, setIsDone] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showReveal, setShowReveal] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [revealed, setRevealed] = useState(false);

    const chatUnlocked = taskCount >= 2;
    const voiceUnlocked = taskCount >= 4;
    const revealPossible = taskCount >= 6;

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
            const nextCount = taskCount + 1;
            setTaskCount(nextCount);
            setIsDone(false);
            setItems([]);
            if (nextCount === 6) {
                setShowReveal(true);
            }
        }, 1200);
    };

    const sendMessage = () => {
        if (!chatInput.trim()) return;
        setMessages([...messages, { id: Date.now().toString(), text: chatInput, sender: 'me' }]);
        setChatInput('');
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
                            {taskCount === 1 ? 'Architecture Analysis' : taskCount < 4 ? 'Strategic Planning' : 'Problem Solving'}
                        </Text>
                        <Text style={styles.taskSubtitle}>
                            Phase {taskCount} • Session with {partnerName}
                        </Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} style={styles.leaveButton} onPress={() => router.back()}>
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
                                <Text style={styles.itemTime}>{item.timestamp}</Text>
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
                            <TouchableOpacity style={styles.voiceButton} activeOpacity={0.8}>
                                <Mic size={20} color="#FFF" />
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
});
