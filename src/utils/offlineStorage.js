import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_KEY = '@ExpenseTracker:expenses';
const CATEGORIES_KEY = '@ExpenseTracker:categories';
const PENDING_KEY = '@ExpenseTracker:pending';

export const saveExpenses = async (expenses) => {
  try {
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Save expenses failed', e);
  }
};

export const loadExpenses = async () => {
  try {
    const json = await AsyncStorage.getItem(EXPENSES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Load expenses failed', e);
    return [];
  }
};

export const saveCategories = async (categories) => {
  try {
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Save categories failed', e);
  }
};

export const loadCategories = async () => {
  try {
    const json = await AsyncStorage.getItem(CATEGORIES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Load categories failed', e);
    return [];
  }
};

export const getPendingChanges = async () => {
  try {
    const json = await AsyncStorage.getItem(PENDING_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
};

export const addPendingChange = async (change) => {
  try {
    const pending = await getPendingChanges();
    pending.push(change);
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch (e) {
    console.error('Add pending failed', e);
  }
};

export const clearPendingChanges = async () => {
  try {
    await AsyncStorage.removeItem(PENDING_KEY);
  } catch (e) {}
};