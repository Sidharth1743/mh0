import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, LogOut, MessageSquare, Mic, Plus, Send, Smile, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, SlideInDown, ZoomIn } from 'react-native-reanimated';

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
        { id: '1', text: 'Stardew Valley but in AR', addedBy: 'partner', timestamp: '2m ago' }
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
        const newItem: TaskItem = {
            id: Date.now().toString(),
            text: inputText,
            addedBy: 'me',
            timestamp: 'Just now'
        };
        setItems([...items, newItem]);
        setInputText('');
    };

    const completeTask = () => {
        setIsDone(true);
        setTimeout(() => {
            const nextCount = taskCount + 1;
            setTaskCount(nextCount);
            setIsDone(false);
            setItems([]);
            if (nextCount === 2) {
                alert("Level 2 Unlocked! Short chat available.");
            } else if (nextCount === 4) {
                alert("Level 3 Unlocked! Voice mode available.");
            } else if (nextCount === 6) {
                setShowReveal(true);
            }
        }, 1500);
    };

    const sendMessage = () => {
        if (!chatInput.trim()) return;
        setMessages([...messages, { id: Date.now().toString(), text: chatInput, sender: 'me' }]);
        setChatInput('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.taskTitle}>
                            {taskCount === 1 ? 'Book-Tech Mashup' : taskCount < 4 ? 'Sci-Fi Gadget Vote' : 'Riddle Solve'}
                        </Text>
                        <Text style={styles.taskSubtitle}>
                            Task {taskCount}/∞ with {revealed ? 'Alex' : 'MysticReader17'}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.leaveButton} onPress={() => router.back()}>
                        <LogOut size={20} color="#94A3B8" />
                    </TouchableOpacity>
                </View>

                <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>
                        {taskCount === 1
                            ? 'Create a list of "books that should become apps or games". Take turns.'
                            : taskCount < 4
                                ? 'Suggest 3 sci-fi gadgets and vote on which is most likely to exist in 10 years.'
                                : 'Solve this riddle: I speak without a mouth and hear without ears...'}
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
                                    {item.addedBy === 'me' ? 'You' : revealed ? 'Alex' : 'MysticReader17'}
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
                            placeholder="Suggest an idea..."
                            placeholderTextColor="#64748B"
                            value={inputText}
                            onChangeText={setInputText}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={addItem}>
                            <Plus size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footerActions}>
                        <TouchableOpacity
                            style={[styles.chatButton, !chatUnlocked && styles.chatLocked]}
                            onPress={() => chatUnlocked && setShowChat(true)}
                        >
                            <MessageSquare size={20} color={chatUnlocked ? "#3B82F6" : "#475569"} />
                            <Text style={[styles.chatButtonText, !chatUnlocked && styles.lockedText]}>
                                {chatUnlocked ? 'Short Chat' : 'Chat locked'}
                            </Text>
                        </TouchableOpacity>

                        {voiceUnlocked && (
                            <TouchableOpacity style={styles.voiceButton}>
                                <Mic size={20} color="#FFF" />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.doneButton, (items.length < 2 && taskCount < 4 && !isDone) && styles.doneDisabled]}
                            onPress={completeTask}
                            disabled={(items.length < 2 && taskCount < 4) || isDone}
                        >
                            <Text style={styles.doneText}>{isDone ? 'Waiting...' : "I'm Done"}</Text>
                            <CheckCircle2 size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Level 2 Chat Modal */}
                <Modal
                    visible={showChat}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowChat(false)}
                >
                    <View style={styles.modalOverlay}>
                        <Animated.View entering={SlideInDown} style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Task Chat</Text>
                                <TouchableOpacity onPress={() => setShowChat(false)}>
                                    <Text style={styles.closeText}>Close</Text>
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
                                        <Text style={styles.messageText}>{item.text}</Text>
                                    </View>
                                )}
                            />

                            <View style={styles.chatInputRow}>
                                <TouchableOpacity style={styles.emojiButton}>
                                    <Smile size={24} color="#64748B" />
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.chatInput}
                                    placeholder="Type a quick reaction..."
                                    placeholderTextColor="#64748B"
                                    value={chatInput}
                                    onChangeText={setChatInput}
                                />
                                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                                    <Send size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>

                {/* Level 4 Reveal Modal */}
                <Modal
                    visible={showReveal}
                    animationType="fade"
                    transparent={true}
                >
                    <View style={styles.revealOverlay}>
                        <Animated.View entering={ZoomIn} style={styles.revealContent}>
                            <Text style={styles.revealTitle}>Level 4 Unlock! 🎯</Text>
                            <Text style={styles.revealSubtitle}>
                                You've built 7 shared moments with MysticReader17. Feeling ready to know each other?
                            </Text>

                            <View style={styles.revealActions}>
                                <TouchableOpacity
                                    style={styles.revealButton}
                                    onPress={() => {
                                        setRevealed(true);
                                        setShowReveal(false);
                                    }}
                                >
                                    <User size={20} color="#FFF" />
                                    <Text style={styles.revealButtonText}>Reveal Identity</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.notReadyButton}
                                    onPress={() => setShowReveal(false)}
                                >
                                    <Text style={styles.notReadyText}>Not yet, stay anonymous</Text>
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
        backgroundColor: '#0F172A',
    },
    header: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    taskTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F8FAFC',
    },
    taskSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    leaveButton: {
        padding: 8,
    },
    descriptionBox: {
        margin: 24,
        marginTop: 0,
        padding: 16,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    descriptionText: {
        color: '#CBD5E1',
        lineHeight: 20,
        fontSize: 14,
    },
    listContent: {
        padding: 24,
        paddingTop: 0,
        gap: 16,
    },
    itemCard: {
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    partnerItem: {
        borderLeftColor: '#A855F7',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemAuthor: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94A3B8',
    },
    itemTime: {
        fontSize: 10,
        color: '#64748B',
    },
    itemText: {
        color: '#F8FAFC',
        fontSize: 16,
        lineHeight: 24,
    },
    inputArea: {
        padding: 24,
        backgroundColor: '#0F172A',
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: '#F8FAFC',
        fontSize: 16,
    },
    addButton: {
        backgroundColor: '#3B82F6',
        width: 48,
        height: 48,
        borderRadius: 12,
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
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: 12,
        borderRadius: 12,
    },
    chatButtonText: {
        color: '#3B82F6',
        fontWeight: '600',
        fontSize: 14,
    },
    chatLocked: {
        backgroundColor: 'transparent',
    },
    lockedText: {
        color: '#475569',
    },
    voiceButton: {
        backgroundColor: '#A855F7',
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneButton: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    doneDisabled: {
        backgroundColor: '#1E293B',
        opacity: 0.5,
    },
    doneText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E293B',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '60%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: '#F8FAFC',
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeText: {
        color: '#3B82F6',
        fontWeight: '500',
    },
    messageList: {
        flex: 1,
        marginBottom: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#3B82F6',
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#334155',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        color: '#FFF',
        fontSize: 16,
    },
    chatInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#0F172A',
        borderRadius: 16,
        padding: 8,
    },
    chatInput: {
        flex: 1,
        color: '#F8FAFC',
        fontSize: 16,
        paddingVertical: 8,
    },
    emojiButton: {
        padding: 4,
    },
    sendButton: {
        backgroundColor: '#3B82F6',
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    revealOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 24,
    },
    revealContent: {
        backgroundColor: '#1E293B',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    revealTitle: {
        color: '#F8FAFC',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    revealSubtitle: {
        color: '#94A3B8',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    revealActions: {
        width: '100%',
        gap: 12,
    },
    revealButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
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
        color: '#64748B',
        fontSize: 14,
    },
});
