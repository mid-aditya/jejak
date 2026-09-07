import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { Avatar } from '../../shared/components/ui';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'other';
  senderName: string;
  timestamp: string;
}

interface ChatRouteParams {
  team?: { title?: string; host?: string };
  threadId?: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', text: 'Hai, sampai basecamp jam berapa rencana nya?', sender: 'other', senderName: 'Fitri Hiker', timestamp: '08:30' },
  { id: '2', text: 'Rencananya jam 8 pagi dari Jakarta, sampai Cibodas sekitar jam 10.', sender: 'me', senderName: 'Saya', timestamp: '08:32' },
  { id: '3', text: 'Siap! Jangan lupa bawa jaket tebal ya, di atas dingin banget.', sender: 'other', senderName: 'Fitri Hiker', timestamp: '08:33' },
  { id: '4', text: 'Oke siap! Carry On ya buat summit attack?', sender: 'me', senderName: 'Saya', timestamp: '08:35' },
  { id: '5', text: 'Iya, summit attack jam 2 pagi. Bawa headlamp dan snack ya!', sender: 'other', senderName: 'Fitri Hiker', timestamp: '08:36' },
];

const ChatScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const params = route.params as ChatRouteParams | undefined;
  const title = params?.team?.title ?? 'Chat';
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      id: `${Date.now()}`,
      text: input.trim(),
      sender: 'me',
      senderName: 'Saya',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate a reply after 1.5s
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `${Date.now()}`,
        text: 'Oke, noted! Sampai ketemu di basecamp ya! 🏔️',
        sender: 'other',
        senderName: params?.team?.host ?? 'Fitri Hiker',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1500);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender === 'me';

    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && <Avatar name={item.senderName} size={28} style={styles.msgAvatar} />}
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
          {!isMe && (
            <Text style={styles.msgSenderName}>{item.senderName}</Text>
          )}
          <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.text}</Text>
          <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Member info banner */}
      {params?.team && (
        <View style={styles.teamBanner}>
          <Icon name="group" size={16} color={Colors.textSecondary} />
          <Text style={styles.teamBannerText}>
            {params.team.host ? `Hosted by ${params.team.host}` : 'Grup Tim Pendakian'}
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
          <Icon name="add-circle-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          placeholderTextColor={Colors.textTertiary}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim()}
          activeOpacity={0.8}
        >
          <Icon name="send" size={20} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  teamBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.xs,
  },
  teamBannerText: { ...Typography.caption, color: Colors.textSecondary },
  listContent: { padding: Spacing.md, paddingBottom: Spacing.xs },
  msgRow: { flexDirection: 'row', marginBottom: Spacing.sm, alignItems: 'flex-end' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgAvatar: { marginRight: Spacing.xs },
  msgBubble: {
    maxWidth: '75%',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  msgBubbleOther: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    ...Shadows.sm,
  },
  msgBubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  msgSenderName: { ...Typography.caption, color: Colors.primary, fontWeight: '700', marginBottom: 2 },
  msgText: { ...Typography.body2, color: Colors.text, lineHeight: 20 },
  msgTextMe: { color: Colors.textInverse },
  msgTime: { ...Typography.caption, color: Colors.textTertiary, marginTop: 4, fontSize: 10 },
  msgTimeMe: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.xs,
  },
  attachBtn: { padding: Spacing.xs, paddingBottom: 4 },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 6,
    fontSize: 14,
    color: Colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.disabled },
});

export default ChatScreen;
