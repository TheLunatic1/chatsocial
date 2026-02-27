import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

const { height } = Dimensions.get('window');

export default function AddExpenseModal({
  visible,
  onClose,
  onSave,
  initialData = null,
  categories = [],
  onAddCategory,
}) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');

  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setAmount(initialData.amount.toString());
        setDescription(initialData.description);
        setCategory(initialData.category);
      } else {
        setAmount('');
        setDescription('');
        setCategory(categories[0]?.name || 'Food');
      }

      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0.5, duration: 400, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, initialData, categories]);

  const handleSubmit = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Description is required');
      return;
    }
    if (!category) {
      Alert.alert('Required', 'Please select a category');
      return;
    }

    onSave({
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      date: initialData ? initialData.date : new Date().toISOString().split('T')[0],
    });

    onClose();
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) {
      Alert.alert('Invalid', 'Category name cannot be empty');
      return;
    }

    // Safety check
    if (typeof onAddCategory !== 'function') {
      Alert.alert('Error', 'Cannot add category right now. Try again later.');
      console.warn('onAddCategory is not a function in modal');
      return;
    }

    console.log('Adding category from modal:', newCatName.trim());
    onAddCategory(newCatName.trim());
    setNewCatName('');
    setShowAddCatModal(false);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {initialData ? 'Edit Expense' : 'Add New Expense'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Amount (৳)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor="#adb5bd"
              />

              <TextInput
                style={styles.input}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#adb5bd"
              />

              <Text style={styles.sectionLabel}>Category</Text>

              <View style={styles.categoryRow}>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <TouchableOpacity
                      key={cat._id}
                      style={[
                        styles.categoryBtn,
                        cat.name === category && styles.categoryBtnActive,
                      ]}
                      onPress={() => setCategory(cat.name)}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          cat.name === category && styles.categoryTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: '#6c757d', textAlign: 'center', marginBottom: 12 }}>
                    No categories yet — add one below!
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.addCategoryBtn}
                onPress={() => setShowAddCatModal(true)}
              >
                <Text style={styles.addCategoryText}>+ Add New Category</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
                <Text style={styles.saveBtnText}>
                  {initialData ? 'Update Expense' : 'Add Expense'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>

      {/* Sub-modal for new category */}
      <Modal
        visible={showAddCatModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddCatModal(false)}
      >
        <View style={styles.subModalOverlay}>
          <View style={styles.subModal}>
            <Text style={styles.subModalTitle}>Add New Category</Text>

            <TextInput
              style={styles.subInput}
              placeholder="Category name (e.g. Utilities)"
              value={newCatName}
              onChangeText={setNewCatName}
              autoFocus
            />

            <View style={styles.subButtons}>
              <TouchableOpacity
                style={[styles.subBtn, styles.cancelSubBtn]}
                onPress={() => setShowAddCatModal(false)}
              >
                <Text style={styles.subBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subBtn, styles.addSubBtn]}
                onPress={handleAddCategory}
              >
                <Text style={styles.subBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'black' },
  backdropTouch: { flex: 1 },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.8,
  },
  modalContent: { padding: 24, paddingBottom: 40 },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryBtn: {
    backgroundColor: '#e9ecef',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 12,
  },
  categoryBtnActive: { backgroundColor: '#6f42c1' },
  categoryText: { color: '#495057', fontWeight: '500' },
  categoryTextActive: { color: 'white' },
  addCategoryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#e2e6ea',
    borderRadius: 20,
    marginBottom: 24,
  },
  addCategoryText: { color: '#6f42c1', fontWeight: '600' },
  saveBtn: {
    backgroundColor: '#20c997',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveBtnText: { color: 'white', fontSize: 18, fontWeight: '600' },
  cancelText: { color: '#6c757d', textAlign: 'center', fontSize: 16 },
  subModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subModal: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  subModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  subButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  subBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelSubBtn: { backgroundColor: '#6c757d' },
  addSubBtn: { backgroundColor: '#20c997' },
  subBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});