import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_KEY = 'offline_expenses';
const CATEGORIES_KEY = 'offline_categories';
const PENDING_CHANGES_KEY = 'pending_changes'; // queue for sync

export const saveExpenses = async (expenses) => {
  try {
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Save expenses error:', e);
  }
};

export const loadExpenses = async () => {
  try {
    const json = await AsyncStorage.getItem(EXPENSES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Load expenses error:', e);
    return [];
  }
};

export const saveCategories = async (categories) => {
  try {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Save categories error:', e);
  }
};

export const loadCategories = async () => {
  try {
    const json = await AsyncStorage.getItem(CATEGORIES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Load categories error:', e);
    return [];
  }
};

export const addPendingChange = async (change) => {
  try {
    const pending = await getPendingChanges();
    pending.push(change);
    await AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(pending));
  } catch (e) {
    console.error('Add pending error:', e);
  }
};

export const getPendingChanges = async () => {
  try {
    const json = await AsyncStorage.getItem(PENDING_CHANGES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Get pending error:', e);
    return [];
  }
};

export const clearPendingChanges = async () => {
  try {
    await AsyncStorage.removeItem(PENDING_CHANGES_KEY);
  } catch (e) {
    console.error('Clear pending error:', e);
  }
};