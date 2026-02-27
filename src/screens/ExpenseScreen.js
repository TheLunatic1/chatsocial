import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import AddExpenseModal from '../components/AddExpenseModal';
import ChartTab from './ChartTab';
import { AuthContext } from '../context/AuthContext';

export default function ExpenseScreen() {
  const { token, logout } = useContext(AuthContext);

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [dateFilter, setDateFilter] = useState('all');

  const fetchExpenses = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const response = await fetch('http://192.168.0.104:5000/api/expenses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert('Session expired', 'Please login again.');
          logout();
          return;
        }
        throw new Error(data.msg || 'Failed to fetch expenses');
      }

      setExpenses(data);
    } catch (err) {
      console.error('Fetch expenses error:', err.message);
      setError('Could not load expenses. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://192.168.0.104:5000/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to fetch categories');
      }

      setCategories(data);
    } catch (err) {
      console.error('Fetch categories error:', err.message);
      Alert.alert('Error', 'Could not load categories');
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const addCategory = async (name) => {
    if (!name || !name.trim()) {
      Alert.alert('Invalid', 'Category name cannot be empty');
      return;
    }

    try {
      const response = await fetch('http://192.168.0.104:5000/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to add category');
      }

      setCategories((prev) => [...prev, data]);
      Alert.alert('Success', `Category "${name}" added!`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not add category');
    }
  };

  const saveExpense = async (expenseData) => {
    console.log('saveExpense called with data:', expenseData);
    console.log('Is edit mode?', !!editingExpense);

    if (editingExpense) {
      const id = editingExpense._id;
      console.log('Updating expense ID:', id);

      const optimisticExpenses = expenses.map((exp) =>
        exp._id === id ? { ...exp, ...expenseData } : exp
      );
      setExpenses(optimisticExpenses);

      try {
        const response = await fetch(`http://192.168.0.104:5000/api/expenses/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify(expenseData),
        });

        const data = await response.json();
        console.log('Update response status:', response.status);
        console.log('Update response data:', data);

        if (!response.ok) {
          throw new Error(data.msg || 'Failed to update expense');
        }

        setExpenses((prev) =>
          prev.map((exp) => (exp._id === id ? { ...data } : exp))
        );
      } catch (err) {
        console.error('Update failed:', err.message);
        setExpenses((prev) =>
          prev.map((exp) => (exp._id === id ? editingExpense : exp))
        );
        Alert.alert('Error', 'Failed to update expense. Please try again.');
      }

      setEditingExpense(null);
    } else {
      console.log('Adding new expense');

      const optimisticId = Date.now().toString();
      const optimisticExpense = {
        _id: optimisticId,
        ...expenseData,
        user: 'temp',
      };

      setExpenses((prev) => [optimisticExpense, ...prev]);

      try {
        const response = await fetch('http://192.168.0.104:5000/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify(expenseData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.msg || 'Failed to add');
        }

        setExpenses((prev) =>
          prev.map((exp) => (exp._id === optimisticId ? { ...data } : exp))
        );
      } catch (err) {
        console.error('Add failed:', err.message);
        setExpenses((prev) => prev.filter((exp) => exp._id !== optimisticId));
        Alert.alert('Error', 'Failed to add expense.');
      }
    }

    setModalVisible(false);
  };

  const startEdit = (expense) => {
    console.log('Starting edit for expense:', expense);
    setEditingExpense(expense);
    setModalVisible(true);
  };

  const deleteExpense = async (id) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const prevExpenses = [...expenses];
            setExpenses((prev) => prev.filter((exp) => exp._id !== id));

            try {
              const response = await fetch(`http://192.168.0.104:5000/api/expenses/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token },
              });

              if (!response.ok) {
                throw new Error('Delete failed');
              }
            } catch (err) {
              console.error('Delete error:', err);
              setExpenses(prevExpenses);
              Alert.alert('Error', 'Failed to delete expense.');
            }
          },
        },
      ]
    );
  };

  const filteredExpenses = () => {
    if (dateFilter === 'all') return expenses;

    const now = new Date();
    const cutoff = new Date();

    if (dateFilter === '7days') {
      cutoff.setDate(now.getDate() - 7);
    } else if (dateFilter === '30days') {
      cutoff.setDate(now.getDate() - 30);
    }

    return expenses.filter((exp) => new Date(exp.date) >= cutoff);
  };

  const total = filteredExpenses().reduce((sum, item) => sum + (item.amount || 0), 0);

  const renderItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <View style={styles.itemContent}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.category}>
          {item.category} • {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.amount}>৳ {item.amount.toFixed(2)}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(item)}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteExpense(item._id)}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6f42c1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expense Tracker</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchExpenses()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.tabActive]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>
            List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'chart' && styles.tabActive]}
          onPress={() => setActiveTab('chart')}
        >
          <Text style={[styles.tabText, activeTab === 'chart' && styles.tabTextActive]}>
            Chart
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'list' ? (
        <>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Spent</Text>
            <Text style={styles.balanceAmount}>৳ {total.toFixed(2)}</Text>
          </View>

          <FlatList
            data={expenses}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No expenses yet. Add one!</Text>
            }
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchExpenses(true)}
                colors={['#6f42c1']}
              />
            }
          />
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.chartScrollContent}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterBtn, dateFilter === 'all' && styles.filterBtnActive]}
              onPress={() => setDateFilter('all')}
            >
              <Text style={styles.filterText}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, dateFilter === '7days' && styles.filterBtnActive]}
              onPress={() => setDateFilter('7days')}
            >
              <Text style={styles.filterText}>Last 7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, dateFilter === '30days' && styles.filterBtnActive]}
              onPress={() => setDateFilter('30days')}
            >
              <Text style={styles.filterText}>Last 30 Days</Text>
            </TouchableOpacity>
          </View>

          <ChartTab expenses={filteredExpenses()} />
        </ScrollView>
      )}

      {activeTab === 'list' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setEditingExpense(null);
            setModalVisible(true);
          }}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <AddExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={saveExpense}
        initialData={editingExpense}
        categories={categories}
        onAddCategory={addCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#6f42c1', paddingVertical: 16, paddingHorizontal: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  logout: { color: 'white', fontSize: 16, fontWeight: '500' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#dee2e6' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#6f42c1' },
  tabText: { fontSize: 16, color: '#6c757d', fontWeight: '500' },
  tabTextActive: { color: '#6f42c1', fontWeight: 'bold' },
  chartScrollContent: { padding: 20, paddingBottom: 100 },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#e9ecef', borderRadius: 20, marginHorizontal: 6, marginVertical: 6 },
  filterBtnActive: { backgroundColor: '#6f42c1' },
  filterText: { color: '#495057', fontWeight: '500' },
  balanceCard: { backgroundColor: 'white', margin: 20, padding: 24, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  balanceLabel: { fontSize: 18, color: '#6c757d', marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: 'bold', color: '#6f42c1' },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  expenseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  itemContent: { flex: 1 },
  description: { fontSize: 16, fontWeight: '600', color: '#212529' },
  category: { fontSize: 14, color: '#6c757d', marginTop: 4 },
  amount: { fontSize: 18, fontWeight: 'bold', color: '#dc3545' },
  actions: { flexDirection: 'row' },
  editBtn: { padding: 8, backgroundColor: '#fff3cd', borderRadius: 8, marginRight: 8 },
  editIcon: { fontSize: 20, color: '#856404' },
  deleteBtn: { padding: 8, backgroundColor: '#f8d7da', borderRadius: 8 },
  deleteIcon: { fontSize: 20, color: '#721c24' },
  emptyText: { textAlign: 'center', color: '#adb5bd', fontSize: 18, marginTop: 40 },
  fab: { position: 'absolute', right: 24, bottom: 32, backgroundColor: '#20c997', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
  fabText: { fontSize: 32, color: 'white', fontWeight: 'bold' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6c757d' },
  errorContainer: { backgroundColor: '#f8d7da', padding: 16, margin: 20, borderRadius: 12, alignItems: 'center' },
  errorText: { color: '#721c24', fontSize: 16, marginBottom: 8 },
  retryText: { color: '#6f42c1', fontWeight: 'bold' },
});