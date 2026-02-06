import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function PostCard({ post }) {
  return (
    <View style={styles.card}>
      <Text style={styles.author}>{post.author?.name || 'Anonymous'}</Text>
      <Text style={styles.content}>{post.content}</Text>
      <View style={styles.footer}>
        <Text style={styles.time}>
          {new Date(post.createdAt).toLocaleString()}
        </Text>
        <TouchableOpacity>
          <Text style={styles.like}>❤️ {post.likes?.length || 0}</Text>
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
  like: {
    fontSize: 14,
    color: '#EF4444',
  },
});