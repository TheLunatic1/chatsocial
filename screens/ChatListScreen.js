import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import axios from 'axios';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';

const USERS_SEARCH_URL = 'http://192.168.0.105:5000/api/users/search';

export default function ChatListScreen({ navigation }) {
  const { user, token } = useContext(AuthContext);
  const currentUserId = user?.id;

  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;

    const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUserId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
      setChats(chatList.sort((a, b) => b.updatedAt - a.updatedAt));
      setChatsLoading(false);
    });

    return unsubscribe;
  }, [currentUserId]);

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      setSearchLoading(true);
      const res = await axios.get(`${USERS_SEARCH_URL}?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Search users error:', err);
      Alert.alert('Error', 'Could not search users');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    searchUsers(text);
  };

  const startNewChat = async (recipientId) => {
    try {
      await axios.post(CHATS_URL + '/start', { recipientId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Chat started');
    } catch (err) {
      console.error('Start chat error:', err);
      Alert.alert('Error', 'Could not start chat');
    }
  };

  const renderChat = ({ item }) => {
    const otherUser = item.participants.find(p => p._id !== currentUserId);
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('Chat', { chatId: item._id, otherUser })}
      >
        <Text style={styles.chatName}>{otherUser?.name || 'Unknown'}</Text>
        <Text style={styles.lastMessage}>
          {item.lastMessage?.content || 'No messages yet'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => startNewChat(item._id)}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search users to start chat..."
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {searchLoading ? (
        <Text style={styles.loading}>Searching...</Text>
      ) : users.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>Search Results</Text>
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={item => item._id}
            style={styles.userList}
          />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Conversations</Text>

      {chatsLoading ? (
        <Text style={styles.loading}>Loading chats...</Text>
      ) : chats.length === 0 ? (
        <Text style={styles.empty}>No conversations yet</Text>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={item => item._id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  userList: {
    marginBottom: 24,
  },
  userItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  userEmail: {
    color: '#6B7280',
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  chatName: {
    fontSize: 18,
    fontWeight: '600',
  },
  lastMessage: {
    color: '#6B7280',
    marginTop: 4,
  },
  loading: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 20,
  },
});