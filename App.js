import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Animated } from 'react-native';

export default function App() {
  const headerTranslateY = useRef(new Animated.Value(-100)).current;
  const balanceOpacity = useRef(new Animated.Value(0)).current;
  const balanceScale = useRef(new Animated.Value(0.85)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(balanceOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(balanceScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.94,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <Text style={styles.title}>Expense Tracker</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.balanceCard,
          {
            opacity: balanceOpacity,
            transform: [{ scale: balanceScale }],
          },
        ]}
      >
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balance}>৳ 0.00</Text>
      </Animated.View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => console.log('Add pressed – modal coming soon!')}
          activeOpacity={0.85}
        >
          <Animated.View style={[styles.addButton, { transform: [{ scale: buttonScale }] }]}>
            <Text style={styles.addButtonText}>+ Add Expense</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No expenses yet... Add your first one!</Text>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6f42c1',
    paddingVertical: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  balanceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  balanceLabel: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 8,
  },
  balance: {
    fontSize: 40,
    fontWeight: '700',
    color: '#6f42c1',
  },
  buttonWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#20c997',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#adb5bd',
    textAlign: 'center',
  },
});