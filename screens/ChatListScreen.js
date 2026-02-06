import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://192.168.0.105:5000/api/chats';

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not load chats');
    } finally {
      setLoading(false);
    }
  };

  const renderChat = ({ item }) => {
    const otherUser = item.participants.find(p => p._id !== useContext(AuthContext).user.id);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>

      {loading ? (
        <Text>Loading chats...</Text>
      ) : chats.length === 0 ? (
        <Text>No conversations yet</Text>
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
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  chatItem: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  chatName: { fontSize: 18, fontWeight: '600' },
  lastMessage: { color: '#666', marginTop: 4 },
});