import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function PostCard({ post, onLikeToggle }) {
  const { token } = useContext(AuthContext);
  const [localLikes, setLocalLikes] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(post.likes.some(like => like.toString() === useContext(AuthContext).user.id));

  const handleLike = async () => {
    try {
      const res = await axios.put(
        `http://192.168.0.105:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedPost = res.data;
      setLocalLikes(updatedPost.likes.length);
      setIsLiked(updatedPost.likes.some(like => like.toString() === useContext(AuthContext).user.id));

      if (onLikeToggle) onLikeToggle(updatedPost);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.author}>{post.author?.name || 'Anonymous'}</Text>
      <Text style={styles.content}>{post.content}</Text>
      <View style={styles.footer}>
        <Text style={styles.time}>
          {new Date(post.createdAt).toLocaleString()}
        </Text>
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Text style={[styles.like, isLiked && styles.liked]}>
            ❤️ {localLikes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  author: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  like: {
    fontSize: 16,
    color: '#6B7280',
  },
  liked: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
});