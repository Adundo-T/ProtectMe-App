import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { protectMePalette, spacing, radii } from '@/theme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', text: 'Hello! How can I help you today?', sender: 'support', timestamp: new Date() },
    { id: '2', text: 'I need assistance with a legal matter.', sender: 'user', timestamp: new Date() },
    { id: '3', text: 'I understand. Can you provide more details about your situation?', sender: 'support', timestamp: new Date() },
  ],
  '2': [
    { id: '1', text: 'Welcome to the legal desk. What documents do you have ready?', sender: 'support', timestamp: new Date() },
    { id: '2', text: 'I have some forms prepared.', sender: 'user', timestamp: new Date() },
  ],
};

const chatTitles: Record<string, string> = {
  '1': 'Advocate team',
  '2': 'Legal desk',
};

export default function ChatConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (id && mockMessages[id]) {
      setMessages(mockMessages[id]);
      setTitle(chatTitles[id] || 'Chat');
    }
  }, [id]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      // Simulate support response after a delay
      setTimeout(() => {
        const supportMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Thank you for your message. Our team will respond shortly.',
          sender: 'support',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, supportMessage]);
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title, headerTintColor: protectMePalette.text }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userMessage : styles.supportMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: Math.max(spacing.md + 50, insets.bottom) }]}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={protectMePalette.muted}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: protectMePalette.background,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.sm,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: protectMePalette.primary,
  },
  supportMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: protectMePalette.muted,
  },
  messageText: {
    fontSize: 16,
    color: protectMePalette.text,
  },
  timestamp: {
    fontSize: 12,
    color: protectMePalette.muted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: protectMePalette.muted,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: protectMePalette.muted,
    borderRadius: radii.md,
    fontSize: 16,
    color: protectMePalette.text,
  },
  sendButton: {
    backgroundColor: protectMePalette.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: protectMePalette.muted,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});