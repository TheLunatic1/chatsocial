import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';

const API_URL = 'http://192.168.0.105:5000/api/posts'; // adjust for your device

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    fetchPosts();
  }, []);

const fetchPosts = async () => {
  try {
    setLoading(true);
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setPosts(res.data);
  } catch (err) {
    console.error('Failed to fetch posts:', err.response?.data || err.message);
    Alert.alert('Error', 'Could not load feed');
  } finally {
    setLoading(false);
  }
};

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Post cannot be empty');
      return;
    }

    try {
      const res = await axios.post(
        API_URL,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPosts([res.data, ...posts]); // add new post to top
      setContent('');
      Alert.alert('Success', 'Post created!');
    } catch (err) {
      console.error('Create post error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to post');
    }
  };

  const renderPost = ({ item }) => <PostCard post={item} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Feed</Text>

      {/* Post creation input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor="#9CA3AF"
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.postButton, !content.trim() && styles.disabledButton]}
          onPress={handleCreatePost}
          disabled={!content.trim()}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      {loading ? (
        <Text style={styles.loading}>Loading feed...</Text>
      ) : posts.length === 0 ? (
        <Text style={styles.empty}>No posts yet. Be the first!</Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    fontSize: 16,
    color: '#111827',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#93C5FD',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  loading: {
    textAlign: 'center',
    fontSize: 18,
    color: '#6B7280',
    marginTop: 40,
  },
  empty: {
    textAlign: 'center',
    fontSize: 18,
    color: '#9CA3AF',
    marginTop: 100,
  },
});