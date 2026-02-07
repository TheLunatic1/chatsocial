import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function ChatScreen({ route, navigation }) {
  const params = route.params || {};
  const chatId = params.chatId;
  const otherUser = params.otherUser;

  const { token, user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  // Guard against missing chatId
  useEffect(() => {
    if (!chatId) {
      console.log('[ERROR] No chatId in route.params');
      Alert.alert('Error', 'Invalid chat - going back');
      navigation.goBack();
      return;
    }

    console.log('[DEBUG] ChatScreen opened with chatId:', chatId);

    fetchMessages();

    // Refresh on focus
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('[DEBUG] Screen focused - refreshing messages');
      fetchMessages();
    });

    return unsubscribe;
  }, [navigation, chatId]);

  const scrollToEnd = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      console.log('[DEBUG] Fetching messages for chat:', chatId);
      const res = await axios.get(`http://192.168.0.105:5000/api/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const msgList = res.data || []; // safe guard
      console.log('[DEBUG] Messages received:', msgList.length);

      setMessages(msgList.reverse());
      scrollToEnd();
    } catch (err) {
      console.error('Fetch messages error:', err.message);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) {
      console.log('[DEBUG] Send blocked: empty message or no chatId');
      return;
    }

    console.log('[DEBUG] Sending to chatId:', chatId, 'content:', newMessage);

    const tempId = Date.now().toString(); // temp ID for optimistic UI
    const messageObj = {
      _id: tempId,
      sender: { _id: user.id, name: user.name || 'You' },
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI
    setMessages(prev => [...prev, messageObj]);
    setNewMessage('');
    scrollToEnd();

    try {
      const res = await axios.post(
        `http://192.168.0.105:5000/api/chats/${chatId}/message`,
        { content: newMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('[DEBUG] Real message saved:', res.data._id);

      // Replace temp message with real one
      setMessages(prev => prev.map(m => m._id === tempId ? res.data : m));
    } catch (err) {
      console.error('Send message error:', err.response?.data || err.message);

      // Rollback optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== tempId));

      Alert.alert('Error', err.response?.data?.message || 'Failed to send');
    }
  };

  const renderMessage = ({ item }) => {
    // Safety guard: skip invalid items
    if (!item || !item.sender || !item.content) {
      console.log('[WARN] Skipping invalid message item:', item);
      return null;
    }

    const isMe = item.sender._id === user?.id;

    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item._id || item.createdAt || Math.random().toString()}
        inverted
        onContentSizeChange={scrollToEnd}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet</Text>}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 6,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 18,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E90FF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
  },
  messageText: { color: '#fff', fontSize: 16 },
  messageTime: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  sendText: { color: '#1E90FF', fontWeight: '600' },
  empty: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
  },
});