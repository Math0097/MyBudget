/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { backupAndShare, restoreFromBackup } from './backupUtils';

import styles, { COLORS } from './style3';
import { LinearGradient } from 'expo-linear-gradient';

const HorizontalBarChart = ({ data, total, showLabels = true, showAmounts = false }) => {
  if (!data || data.length === 0 || total === 0) return null;

  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <View style={styles.barChartContainer}>
      {sortedData.map((item, index) => {
        const percentage = (item.amount / total) * 100;
        return (
          <View key={index} style={styles.barChartRow}>
            {showLabels && <Text style={styles.barChartLabel}>{item.name}</Text>}

            <View style={styles.barChartRowTrack}>
              <View
                style={[
                  styles.barChartRowBar,
                  { backgroundColor: item.color, width: `${percentage}%` },
                ]}
              />
            </View>

            <View style={[
              styles.amountAndPercentage,
              !showAmounts && styles.percentageOnly
            ]}>
              {showAmounts && <Text style={styles.barChartAmount}>{item.amount.toFixed(2)} €</Text>}
              <Text style={styles.barChartPercentage}>{percentage.toFixed(1)}%</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};


const groupDataByColor = (data) => {
  const grouped = {};

  data.forEach(item => {
    if (grouped[item.color]) {
      grouped[item.color].amount += item.amount;
      // Aggiungi i nomi dei conti raggruppati
      grouped[item.color].accounts = [...(grouped[item.color].accounts || []), item.name];
    } else {
      grouped[item.color] = {
        name: `Conti ${item.color}`, // nome più descrittivo
        amount: item.amount,
        color: item.color,
        accounts: [item.name]
      };
    }
  });

  return Object.values(grouped);
};

// Componente per la lista delle transazioni
const TransactionItem = ({ transaction, onEdit, onDelete }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionInfo}>
      <Text style={styles.transactionDescription}>{transaction.description}</Text>
      <Text style={styles.transactionDate}>
        {new Date(transaction.date).toLocaleDateString('it-IT')}
      </Text>
    </View>
    <View style={styles.transactionActions}>
      <Text style={[
        styles.transactionAmount,
        { color: transaction.amount >= 0 ? '#00ff08ff' : COLORS.DANGER }
      ]}>
        {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)} €
      </Text>
      <TouchableOpacity onPress={() => onEdit(transaction)} style={styles.transactionActionButton}>
        <Ionicons name="pencil" size={16} color="#2196F3" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(transaction.id)} style={styles.transactionActionButton}>
        <Ionicons name="trash" size={16} color="#F44336" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function MoneyManagerApp() {
  const [currentTab, setCurrentTab] = useState('home');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showSalaryPickerModal, setShowSalaryPickerModal] = useState(false);
  const [showManageAccountsModal, setShowManageAccountsModal] = useState(false);
  const [showManageSalariesModal, setShowManageSalariesModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewMode, setViewMode] = useState('total');
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editAccountName, setEditAccountName] = useState('');
  const [currentSalary, setCurrentSalary] = useState(null);
  const [previousSalary, setPreviousSalary] = useState(null);
  const [reallocationAmounts, setReallocationAmounts] = useState({}); // Quanto spostare da ogni categoria
  const [reallocationTargets, setReallocationTargets] = useState({}); // Verso quale categoria spostare
  const [showReallocationTargetModal, setShowReallocationTargetModal] = useState(false);

  // Form states
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountColor, setNewAccountColor] = useState('#2196F3');
  const [newTransactionDescription, setNewTransactionDescription] = useState('');
  const [newTransactionAmount, setNewTransactionAmount] = useState('');
  const [newTransactionAccount, setNewTransactionAccount] = useState('');
  const [newTransactionSalary, setNewTransactionSalary] = useState('');
  const [newSalaryName, setNewSalaryName] = useState('');
  const [newSalaryAmount, setNewSalaryAmount] = useState('');
  const [allocations, setAllocations] = useState({});
  const [currentAllocatingSalary, setCurrentAllocatingSalary] = useState(null);
  const [showReallocationModal, setShowReallocationModal] = useState(false);
  const [reallocationData, setReallocationData] = useState({});


  const colors = ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#00BCD4', '#795548', '#607D8B'];

  // Carica i dati al mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const accountsData = await AsyncStorage.getItem('accounts');
      const transactionsData = await AsyncStorage.getItem('transactions');
      const salariesData = await AsyncStorage.getItem('salaries');

      console.log('Caricati da AsyncStorage:', {
        accounts: accountsData,
        transactions: transactionsData,
        salaries: salariesData,
      });

      if (accountsData) setAccounts(JSON.parse(accountsData));
      if (transactionsData) setTransactions(JSON.parse(transactionsData));
      if (salariesData) setSalaries(JSON.parse(salariesData));
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    }
  };

  const handleBackup = async () => {
    try {
      const uri = await backupAndShare();
      Alert.alert('Backup riuscito', `File salvato in:\n${uri}`);
    } catch (e) {
      Alert.alert('Errore', e.message);
    }
  };

  const handleRestore = async () => {
    try {
      const ok = await restoreFromBackup();
      if (ok) {
        await loadData();
        Alert.alert('Ripristino riuscito', 'I dati sono stati ripristinati.');
      } else {
        Alert.alert('Operazione annullata', 'Nessun file selezionato o operazione annullata.');
      }
    } catch (e) {
      Alert.alert('Errore', e.message || 'Errore sconosciuto durante il ripristino.');
    }
  };

  const handleReallocationAmounts = () => {
    // Validazione: controlla che gli importi non superino i saldi disponibili
    const errors = [];
    Object.entries(reallocationAmounts).forEach(([accountId, amount]) => {
      const availableAmount = reallocationData[accountId]?.previousSalaryBalance || 0;
      const amountToMove = parseFloat(amount) || 0;

      if (amountToMove > availableAmount) {
        const accountName = reallocationData[accountId]?.name || 'Categoria sconosciuta';
        errors.push(`${accountName}: non puoi spostare ${amountToMove.toFixed(2)} € (disponibili: ${availableAmount.toFixed(2)} €)`);
      }
    });

    if (errors.length > 0) {
      Alert.alert('Errore di validazione', errors.join('\n'));
      return;
    }

    // Vai al secondo modal
    setShowReallocationModal(false);
    setShowReallocationTargetModal(true);
  };

  const handleReallocationTargets = () => {
    // Crea le transazioni per la riallocazione
    const reallocationTransactions = [];
    let totalToReallocate = 0;
    let transactionCounter = 0; // Contatore per garantire ID unici

    // Itera una sola volta e crea entrambe le transazioni (uscita e entrata)
    Object.entries(reallocationAmounts).forEach(([sourceAccountId, amount]) => {
      const amountToMove = parseFloat(amount) || 0;
      const targetAccountId = reallocationTargets[sourceAccountId];

      if (amountToMove > 0 && targetAccountId) {
        totalToReallocate += amountToMove;
        const timestamp = Date.now();

        const sourceAccountName = accounts.find(acc => acc.id === sourceAccountId)?.name || 'Categoria sconosciuta';

        // Transazione di uscita (dalla categoria sorgente)
        reallocationTransactions.push({
          id: `realloc_out_${sourceAccountId}_${timestamp}_${transactionCounter++}`,
          accountId: sourceAccountId,
          description: `Riallocazione da "${sourceAccountName}" (${previousSalary.name} → ${currentSalary.name})`,
          amount: -amountToMove,
          salaryId: previousSalary.id,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });

        const targetAccountName = accounts.find(acc => acc.id === targetAccountId)?.name || 'Categoria sconosciuta';

        // Transazione di entrata (verso la categoria destinazione)
        reallocationTransactions.push({
          id: `realloc_in_${targetAccountId}_${timestamp}_${transactionCounter++}`,
          accountId: targetAccountId,
          description: `Riallocazione verso "${targetAccountName}" (${previousSalary.name} → ${currentSalary.name})`,
          amount: amountToMove,
          salaryId: currentSalary.id,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }
    });

    if (reallocationTransactions.length > 0) {
      const updatedTransactions = [...transactions, ...reallocationTransactions];
      setTransactions(updatedTransactions);
      saveData('transactions', updatedTransactions);

      Alert.alert(
        'Riallocazione completata',
        `Hai riallocato ${totalToReallocate.toFixed(2)} € da ${previousSalary.name} a ${currentSalary.name}`
      );
    }

    // Reset degli stati
    setReallocationData({});
    setReallocationAmounts({});
    setReallocationTargets({});
    setShowReallocationTargetModal(false);

    // Vai all'allocazione normale per il nuovo stipendio
    setShowAllocationModal(true);
  };

  // 4. NUOVA FUNZIONE per calcolare il totale da riallocare
  const getTotalToReallocate = () => {
    return Object.values(reallocationAmounts).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
  };

  const getTotalAvailableForReallocation = () => {
    return Object.values(reallocationData).reduce((sum, data) => sum + (data.previousSalaryBalance || 0), 0);
  };

  const saveData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Errore nel salvataggio dei dati:', error);
    }
  };

  const addAccount = () => {
    if (!newAccountName.trim()) return;

    const newAccount = {
      id: Date.now().toString(),
      name: newAccountName,
      color: newAccountColor,
      createdAt: new Date().toISOString()
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    saveData('accounts', updatedAccounts);

    setNewAccountName('');
    setNewAccountColor('#2196F3');
    setShowAddAccountModal(false);
  };

  const deleteAccount = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    const accountTransactions = transactions.filter(t => t.accountId === accountId);

    Alert.alert(
      'Elimina Categoria',
      `Sei sicuro di voler eliminare la categoria "${account.name}"?\n\nVerranno eliminate anche ${accountTransactions.length} transazioni associate.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            const updatedAccounts = accounts.filter(a => a.id !== accountId);
            setAccounts(updatedAccounts);
            saveData('accounts', updatedAccounts);

            const updatedTransactions = transactions.filter(t => t.accountId !== accountId);
            setTransactions(updatedTransactions);
            saveData('transactions', updatedTransactions);

            if (selectedAccount?.id === accountId) {
              setSelectedAccount(null);
              setCurrentTab('home');
            }
          }
        }
      ]
    );
  };

  const updateAccountName = () => {
    if (!editAccountName.trim()) return;

    const updatedAccounts = accounts.map(account =>
      account.id === editingAccount.id
        ? { ...account, name: editAccountName }
        : account
    );

    setAccounts(updatedAccounts);
    saveData('accounts', updatedAccounts);

    setEditingAccount(null);
    setEditAccountName('');
    setShowEditAccountModal(false);
  };

  const deleteSalary = (salaryId) => {
    const salary = salaries.find(s => s.id === salaryId);
    const salaryTransactions = transactions.filter(t => t.salaryId === salaryId);

    Alert.alert(
      'Elimina Stipendio',
      `Sei sicuro di voler eliminare lo stipendio "${salary.name}"?\n\nCosa vuoi fare con le ${salaryTransactions.length} transazioni associate?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina solo stipendio',
          onPress: () => {
            const updatedSalaries = salaries.filter(s => s.id !== salaryId);
            setSalaries(updatedSalaries);
            saveData('salaries', updatedSalaries);

            const updatedTransactions = transactions.map(t =>
              t.salaryId === salaryId ? { ...t, salaryId: null } : t
            );
            setTransactions(updatedTransactions);
            saveData('transactions', updatedTransactions);

            if (selectedSalary?.id === salaryId) {
              setSelectedSalary(null);
              setViewMode('total');
            }
          }
        },
        {
          text: 'Elimina tutto',
          style: 'destructive',
          onPress: () => {
            const updatedSalaries = salaries.filter(s => s.id !== salaryId);
            setSalaries(updatedSalaries);
            saveData('salaries', updatedSalaries);

            const updatedTransactions = transactions.filter(t => t.salaryId !== salaryId);
            setTransactions(updatedTransactions);
            saveData('transactions', updatedTransactions);

            if (selectedSalary?.id === salaryId) {
              setSelectedSalary(null);
              setViewMode('total');
            }
          }
        }
      ]
    );
  };

  const addTransaction = () => {
    if (!newTransactionDescription.trim() || !newTransactionAmount || !newTransactionAccount) return;

    const transaction = {
      id: Date.now().toString(),
      accountId: newTransactionAccount,
      description: newTransactionDescription,
      amount: parseFloat(newTransactionAmount),
      salaryId: newTransactionSalary || null,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const updatedTransactions = editingTransaction
      ? transactions.map(t => t.id === editingTransaction.id ? { ...transaction, id: editingTransaction.id } : t)
      : [...transactions, transaction];

    setTransactions(updatedTransactions);
    saveData('transactions', updatedTransactions);

    resetTransactionForm();
  };

  const resetTransactionForm = () => {
    setNewTransactionDescription('');
    setNewTransactionAmount('');
    setNewTransactionAccount('');
    setNewTransactionSalary('');
    setEditingTransaction(null);
    setShowAddTransactionModal(false);
  };

  const editTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setNewTransactionDescription(transaction.description);
    setNewTransactionAmount(transaction.amount.toString());
    setNewTransactionAccount(transaction.accountId);
    setNewTransactionSalary(transaction.salaryId || '');
    setShowAddTransactionModal(true);
  };

  const deleteTransaction = (transactionId) => {
    Alert.alert(
      'Elimina Transazione',
      'Sei sicuro di voler eliminare questa transazione?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            const updatedTransactions = transactions.filter(t => t.id !== transactionId);
            setTransactions(updatedTransactions);
            saveData('transactions', updatedTransactions);
          }
        }
      ]
    );
  };

  const addSalary = () => {
    if (!newSalaryName.trim() || !newSalaryAmount) return;

    if (accounts.length === 0) {
      Alert.alert('Errore', 'Devi creare almeno una categoria prima di aggiungere uno stipendio');
      return;
    }

    const newSalary = {
      id: Date.now().toString(),
      name: newSalaryName,
      amount: parseFloat(newSalaryAmount),
      createdAt: new Date().toISOString()
    };

    const updatedSalaries = [...salaries, newSalary];
    setSalaries(updatedSalaries);
    saveData('salaries', updatedSalaries);

    setNewSalaryName('');
    setNewSalaryAmount('');
    setShowSalaryModal(false);

    // Imposta il precedente stipendio come l'ultimo della lista
    const lastSalary = salaries.length > 0 ? salaries[salaries.length - 1] : null;
    setPreviousSalary(lastSalary);
    setCurrentSalary(newSalary);

    // Controlla se ci sono soldi da riallocare dall'ultimo stipendio
    if (lastSalary) {
      const accountsWithPreviousSalaryBalance = accounts.filter(account =>
        getAccountBalance(account.id, true, lastSalary.id) > 0
      );

      if (accountsWithPreviousSalaryBalance.length > 0) {
        // Prepara i dati per la riallocazione
        const reallocationInfo = accountsWithPreviousSalaryBalance.reduce((acc, account) => {
          const previousSalaryBalance = getAccountBalance(account.id, true, lastSalary.id);
          acc[account.id] = {
            name: account.name,
            color: account.color,
            previousSalaryBalance: previousSalaryBalance,
          };
          return acc;
        }, {});

        setReallocationData(reallocationInfo);
        setReallocationAmounts({});
        setReallocationTargets({});
        setCurrentAllocatingSalary(newSalary);
        setShowReallocationModal(true);
      } else {
        // Nessun saldo da riallocare, vai direttamente all'allocazione normale
        setCurrentAllocatingSalary(newSalary);
        setShowAllocationModal(true);
      }
    } else {
      // Primo stipendio, vai direttamente all'allocazione normale
      setCurrentAllocatingSalary(newSalary);
      setShowAllocationModal(true);
    }
  };

  const allocateSalary = () => {
    if (!currentAllocatingSalary) return;

    const totalAllocated = Object.values(allocations).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);

    if (totalAllocated > currentAllocatingSalary.amount) {
      Alert.alert('Errore', 'La somma allocata supera lo stipendio disponibile');
      return;
    }

    const newTransactions = accounts.map(account => {
      const amount = parseFloat(allocations[account.id] || 0);
      if (amount > 0) {
        return {
          id: `salary_${account.id}_${Date.now()}`,
          accountId: account.id,
          description: `Stipendio ${currentAllocatingSalary.name}`,
          amount: amount,
          salaryId: currentAllocatingSalary.id,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
      }
      return null;
    }).filter(Boolean);

    const updatedTransactions = [...transactions, ...newTransactions];
    setTransactions(updatedTransactions);
    saveData('transactions', updatedTransactions);

    setAllocations({});
    setCurrentAllocatingSalary(null);
    setShowAllocationModal(false);
    Alert.alert('Successo', 'Stipendio allocato correttamente!');
  };

  const getAccountBalance = (accountId, filterBySalary = false, specificSalaryId = null) => {
    let accountTransactions = transactions.filter(t => t.accountId === accountId);

    if (filterBySalary && specificSalaryId) {
      accountTransactions = accountTransactions.filter(t => t.salaryId === specificSalaryId);
    } else if (filterBySalary && selectedSalary) {
      accountTransactions = accountTransactions.filter(t => t.salaryId === selectedSalary.id);
    }

    return accountTransactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalBalance = (filterBySalary = false) => {
    return accounts.reduce((sum, account) => sum + getAccountBalance(account.id, filterBySalary), 0);
  };

  const getAccountTransactions = (accountId, filterBySalary = false) => {
    let accountTransactions = transactions.filter(t => t.accountId === accountId);

    if (filterBySalary && selectedSalary) {
      accountTransactions = accountTransactions.filter(t => t.salaryId === selectedSalary.id);
    }

    return accountTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const selectSalaryForView = (salary) => {
    setSelectedSalary(salary);
    setViewMode('salary');
    setShowSalaryPickerModal(false);
  };

  const normalizeDecimal = (value) => {
    return value.replace(/[^0-9.,-]/g, '').replace(',', '.');
  };

  const renderHome = () => {
    const totalBalance = getTotalBalance(viewMode === 'salary');
    const pieData = accounts.map(account => ({
      name: account.name,
      amount: getAccountBalance(account.id, viewMode === 'salary'),
      color: account.color
    })).filter(item => item.amount > 0);

    const groupedPieData = groupDataByColor(pieData);

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>MyBudget</Text>
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'total' && styles.activeToggle]}
              onPress={() => {
                setViewMode('total');
                setSelectedSalary(null);
              }}
            >
              <Text style={[styles.toggleText, viewMode === 'total' && styles.activeToggleText]}>
                Totale
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'salary' && styles.activeToggle]}
              onPress={() => setShowSalaryPickerModal(true)}
            >
              <Text style={[styles.toggleText, viewMode === 'salary' && styles.activeToggleText]}>
                {viewMode === 'salary' && selectedSalary ? selectedSalary.name : 'Stipendio'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>
              {viewMode === 'salary' && selectedSalary ? `${selectedSalary.name}` : 'Totale'}
            </Text>
            <Text style={styles.balanceAmount}>{totalBalance.toFixed(2)} €</Text>
          </View>

          {pieData.length > 0 && totalBalance > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ flexDirection: 'row' }}
            >
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Distribuzione Categorie</Text>
                <HorizontalBarChart data={pieData} total={totalBalance} showLabels={true} />
              </View>
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Distribuzione Conti</Text>
                <HorizontalBarChart data={groupedPieData} total={totalBalance} showLabels={false} showAmounts={true} />
              </View>
            </ScrollView>
          )}

          <View style={styles.accountsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categorie</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.manageButton}
                  onPress={() => setShowManageAccountsModal(true)}
                >
                  <Ionicons name="settings-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowAddAccountModal(true)}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {accounts.length === 0 ? (
              <Text style={styles.emptyText}>Nessuna categoria creata</Text>
            ) : (
              accounts.map(account => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.accountCard}
                  onPress={() => {
                    setSelectedAccount(account);
                    setCurrentTab('account');
                  }}
                >
                  <View style={[styles.accountColor, { backgroundColor: account.color }]} />
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountBalance}>
                      {getAccountBalance(account.id, viewMode === 'salary').toFixed(2)} €
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowSalaryModal(true)}
            >
              <Ionicons name="add-circle" size={24} color="#0033ffb1" />
              <Text style={styles.actionText}>Aggiungi Stipendio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowManageSalariesModal(true)}
            >
              <Ionicons name="list" size={24} color="#00ff08b8" />
              <Text style={styles.actionText}>Gestisci Stipendi</Text>
            </TouchableOpacity>
          </View>

          {/* Linea di separazione */}
          <View style={styles.separator} />

          <View style={styles.backupActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleBackup}>
              <Ionicons name="save-outline" size={24} color="#000000ff" />
              <Text style={styles.actionText}>Backup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleRestore}>
              <Ionicons name="refresh-circle" size={24} color="#ffbb00d7" />
              <Text style={styles.actionText}>Ripristina</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderAccountDetail = () => {
    if (!selectedAccount) return null;

    const balance = getAccountBalance(selectedAccount.id, viewMode === 'salary');
    const accountTransactions = getAccountTransactions(selectedAccount.id, viewMode === 'salary');

    // Calcola entrate e uscite
    const income = accountTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = accountTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return (
      <View style={styles.container}>
        <View style={styles.accountHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentTab('home')}
          >
            <Ionicons name="arrow-back" size={24} color="#0008ffff" />
          </TouchableOpacity>
          <Text style={styles.accountTitle}>{selectedAccount.name}</Text>
          <View style={styles.viewModeToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'total' && styles.activeToggle]}
              onPress={() => {
                setViewMode('total');
                setSelectedSalary(null);
              }}
            >
              <Text style={[styles.toggleText, viewMode === 'total' && styles.activeToggleText]}>
                Totale
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'salary' && styles.activeToggle]}
              onPress={() => setShowSalaryPickerModal(true)}
            >
              <Text style={[styles.toggleText, viewMode === 'salary' && styles.activeToggleText]}>
                {viewMode === 'salary' && selectedSalary ? selectedSalary.name : 'Stipendio'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: selectedAccount.color }]}>
          <Text style={[styles.balanceLabel, { color: '#fff' }]}>
            Saldo {viewMode !== 'salary' ? `totale` : 'stipendio'}
          </Text>
          <Text style={[styles.balanceAmount, { color: '#fff' }]}>
            {balance.toFixed(2)} €
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Entrate</Text>
            <Text style={[styles.summaryValue, { color: '#00ff08ff' }]}>
              +{income.toFixed(2)} €
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Uscite</Text>
            <Text style={[styles.summaryValue, { color: COLORS.DANGER }]}>
              -{expenses.toFixed(2)} €
            </Text>
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transazioni</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setNewTransactionAccount(selectedAccount.id);
                if (viewMode === 'salary' && selectedSalary) {
                  setNewTransactionSalary(selectedSalary.id);
                }
                setShowAddTransactionModal(true);
              }}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {accountTransactions.length === 0 ? (
            <Text style={styles.emptyText}>Nessuna transazione</Text>
          ) : (
            <FlatList
              data={accountTransactions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TransactionItem
                  transaction={item}
                  onEdit={editTransaction}
                  onDelete={deleteTransaction}
                />
              )}
              style={styles.transactionsList}
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#11998e', '#38ef7d']}
      locations={[0, 0.25, 0.75, 1]}
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="light-content"  // Cambiato da "dark-content"
        backgroundColor="transparent"
        translucent={true}
        hidden={false}
      />

      <View style={styles.mainContainer}>
        {currentTab === 'home' ? renderHome() : renderAccountDetail()}
      </View>

      {/* Modal Aggiungi Categoria */}
      <Modal
        visible={showAddAccountModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nuova Categoria</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome della nuova categoria"
                value={newAccountName}
                onChangeText={setNewAccountName}
              />
              <Text style={styles.labelText}>Colore:</Text>
              <Text style={styles.labelTextSuggerimento}>(selezionare il colore in base al conto)</Text>
              <View style={styles.colorPicker}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newAccountColor === color && styles.selectedColor
                    ]}
                    onPress={() => setNewAccountColor(color)}
                  />
                ))}
              </View>
              <View style={styles.modalButtonsDouble}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setNewAccountName('');
                    setNewAccountColor('#2196F3');
                    setShowAddAccountModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={addAccount}
                >
                  <Text style={styles.confirmButtonText}>Aggiungi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Gestisci Categorie */}
      <Modal
        visible={showManageAccountsModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Gestisci Categorie</Text>
              <ScrollView style={styles.manageList}>
                {accounts.map(account => {
                  const balance = getAccountBalance(account.id);
                  return (
                    <View key={account.id} style={styles.manageItem}>
                      <View style={styles.manageItemInfo}>
                        <View style={[styles.accountColor, { backgroundColor: account.color }]} />
                        <View style={styles.manageItemText}>
                          <Text style={styles.manageItemName}>{account.name}</Text>
                          <Text style={styles.manageItemBalance}>{balance.toFixed(2)} €</Text>
                        </View>
                      </View>
                      <View style={styles.manageItemActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => {
                            setEditingAccount(account);
                            setEditAccountName(account.name);
                            setShowEditAccountModal(true);
                          }}
                        >
                          <Ionicons name="pencil" size={20} color="#0055ffff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteAccount(account.id)}
                        >
                          <Ionicons name="trash" size={20} color="rgba(255, 17, 0, 1)ff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
              <View style={styles.modalButtonsSingle}>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => setShowManageAccountsModal(false)}
                >
                  <Text style={styles.confirmButtonText}>Chiudi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Gestisci Stipendi */}
      <Modal
        visible={showManageSalariesModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Gestisci Stipendi</Text>
              <ScrollView style={styles.manageList}>
                {salaries.length === 0 ? (
                  <Text style={styles.emptyText}>Nessuno stipendio aggiunto</Text>
                ) : (
                  salaries.map(salary => (
                    <View key={salary.id} style={styles.manageItem}>
                      <View style={styles.manageItemText}>
                        <Text style={styles.manageItemName}>{salary.name}</Text>
                        <Text style={styles.manageItemBalance}>{salary.amount.toFixed(2)} €</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteSalary(salary.id)}
                      >
                        <Ionicons name="trash" size={20} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
              <View style={styles.modalButtonsSingle}>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => setShowManageSalariesModal(false)}
                >
                  <Text style={styles.confirmButtonText}>Chiudi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Aggiungi Transazione */}
      <Modal
        visible={showAddTransactionModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContent}>
              {/* Titolo fisso */}
              <Text style={styles.modalTitle}>
                {editingTransaction ? 'Modifica Transazione' : 'Nuova Transazione'}
              </Text>

              {/* Contenuto scrollabile */}
              <ScrollView style={{ flexGrow: 0, maxHeight: 400 }}>
                <TextInput
                  style={styles.input}
                  placeholder="Descrizione"
                  value={newTransactionDescription}
                  onChangeText={setNewTransactionDescription}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Importo"
                  value={newTransactionAmount}
                  onChangeText={(value) => {
                    const normalized = normalizeDecimal(value);
                    setNewTransactionAmount(normalized);
                  }}
                  keyboardType="numeric"
                />
                <Text style={styles.labelText}>Categoria:</Text>
                <View style={styles.accountSelector}>
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      style={[
                        styles.accountOption,
                        newTransactionAccount === account.id && styles.selectedAccount,
                      ]}
                      onPress={() => setNewTransactionAccount(account.id)}
                    >
                      <View style={[styles.accountColor, { backgroundColor: account.color }]} />
                      <Text style={styles.accountOptionText}>{account.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.labelText}>Stipendio (opzionale):</Text>
                {!salaries.length ? (
                  <Text style={styles.emptyText}>Nessuno stipendio disponibile</Text>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.salaryOption,
                        !newTransactionSalary && styles.selectedSalary,
                      ]}
                      onPress={() => setNewTransactionSalary('')}
                    >
                      <Text style={styles.salaryOptionText}>Nessuno stipendio</Text>
                    </TouchableOpacity>
                    {salaries.map((salary) => (
                      <TouchableOpacity
                        key={salary.id}
                        style={[
                          styles.salaryOption,
                          newTransactionSalary === salary.id && styles.selectedSalary,
                        ]}
                        onPress={() => setNewTransactionSalary(salary.id)}
                      >
                        <Text style={styles.salaryOptionText}>{salary.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>

              {/* Bottoni fissi */}
              <View style={styles.modalButtonsDouble}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={resetTransactionForm}
                >
                  <Text style={styles.cancelButtonText}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={addTransaction}
                >
                  <Text style={styles.confirmButtonText}>
                    {editingTransaction ? 'Salva' : 'Aggiungi'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Modifica Nome Categoria */}
      <Modal
        visible={showEditAccountModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlayNext}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modifica Nome Categoria</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome della categoria"
                value={editAccountName}
                onChangeText={setEditAccountName}
              />
              <View style={styles.modalButtonsDouble}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setEditingAccount(null);
                    setEditAccountName('');
                    setShowEditAccountModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={updateAccountName}
                >
                  <Text style={styles.confirmButtonText}>Salva</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Aggiungi Stipendio */}
      <Modal
        visible={showSalaryModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nuovo Stipendio</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome stipendio (es. Maggio 25)"
                value={newSalaryName}
                onChangeText={setNewSalaryName}
              />
              <TextInput
                style={styles.input}
                placeholder="Importo stipendio"
                value={newSalaryAmount}
                onChangeText={(text) => {
                  setNewSalaryAmount(normalizeDecimal(text));
                }}
                keyboardType="decimal-pad"
              />
              <View style={styles.modalButtonsDouble}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setNewSalaryName('');
                    setNewSalaryAmount('');
                    setShowSalaryModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!newSalaryName.trim() || !newSalaryAmount.trim()}
                  style={[
                    styles.button,
                    styles.confirmButton,
                    (!newSalaryName.trim() || !newSalaryAmount.trim()) && { opacity: 0.5 }
                  ]}
                  onPress={addSalary}
                >
                  <Text style={styles.confirmButtonText}>Aggiungi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Allocazione Stipendio */}
      <Modal
        visible={showAllocationModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Alloca Stipendio</Text>
              {currentAllocatingSalary && (
                <>
                  <Text style={styles.salaryInfo}>
                    {currentAllocatingSalary.name}: {currentAllocatingSalary.amount.toFixed(2)} €
                  </Text>
                  <Text style={styles.remainingInfo}>
                    Rimanente: {(currentAllocatingSalary.amount -
                      Object.values(allocations).reduce((sum, val) => sum + parseFloat(val || 0), 0)).toFixed(2)} €
                  </Text>
                </>
              )}
              <ScrollView style={styles.allocationList}>
                {accounts.map(account => (
                  <View key={account.id} style={styles.allocationItem}>
                    <View style={styles.allocationInfo}>
                      <View style={[styles.accountColor, { backgroundColor: account.color }]} />
                      <Text style={styles.allocationName}>{account.name}</Text>
                    </View>
                    <TextInput
                      style={styles.allocationInput}
                      placeholder="0"
                      value={allocations[account.id] || ''}
                      onChangeText={(value) => {
                        const clean = normalizeDecimal(value);
                        setAllocations(prev => ({ ...prev, [account.id]: clean }));
                      }}
                      keyboardType="decimal-pad"
                    />
                  </View>
                ))}
              </ScrollView>
              <View style={styles.modalButtonsDouble}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setAllocations({});
                    setCurrentAllocatingSalary(null);
                    setShowAllocationModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={allocateSalary}
                >
                  <Text style={styles.confirmButtonText}>Alloca</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Riallocazione Soldi Rimanenti - Versione Migliorata */}
      <Modal
        visible={showReallocationModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Riallocazione Soldi Rimanenti</Text>

              {previousSalary && currentSalary && (
                <View style={styles.reallocationHeader}>
                  <Text style={styles.modalSubtitle}>
                    Hai dei soldi rimanenti da &quot;{previousSalary.name}&quot;.
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    Vuoi spostarli verso &quot;{currentSalary.name}&quot;?
                  </Text>
                  <View style={styles.reallocationTotals}>
                    <Text style={styles.reallocationTotal}>
                      Totale disponibile: {getTotalAvailableForReallocation().toFixed(2)} €
                    </Text>
                    <Text style={[styles.reallocationTotal, { color: '#2196F3', fontWeight: 'bold' }]}>
                      Totale selezionato: {getTotalToReallocate().toFixed(2)} €
                    </Text>
                  </View>
                </View>
              )}

              <ScrollView style={styles.reallocationList} showsVerticalScrollIndicator={false}>
                {Object.entries(reallocationData).map(([accountId, data]) => (
                  <View key={accountId} style={styles.reallocationItem}>
                    {/* Header della categoria */}
                    <View style={styles.reallocationAccountHeader}>
                      <View style={[styles.accountColor, { backgroundColor: data.color }]} />
                      <View style={styles.reallocationAccountInfo}>
                        <Text style={styles.reallocationAccountName}>{data.name}</Text>
                        <Text style={styles.reallocationAccountBalance}>
                          Disponibili: {data.previousSalaryBalance.toFixed(2)} €
                        </Text>
                      </View>
                    </View>

                    {/* Input per l'importo da spostare */}
                    <View style={styles.reallocationInputSection}>
                      <Text style={styles.reallocationInputLabel}>Quanto spostare:</Text>
                      <View style={styles.reallocationInputContainer}>
                        <TextInput
                          style={styles.reallocationInput}
                          placeholder="0.00"
                          value={reallocationAmounts[accountId]?.toString() || ''}
                          onChangeText={(value) => {
                            const cleanValue = normalizeDecimal(value);
                            const numValue = parseFloat(cleanValue) || 0;

                            if (numValue <= data.previousSalaryBalance) {
                              setReallocationAmounts(prev => ({
                                ...prev,
                                [accountId]: cleanValue
                              }));
                            }
                          }}
                          keyboardType="decimal-pad"
                        />
                        <TouchableOpacity
                          style={styles.maxButton}
                          onPress={() => {
                            setReallocationAmounts(prev => ({
                              ...prev,
                              [accountId]: data.previousSalaryBalance.toString()
                            }));
                          }}
                        >
                          <Text style={styles.maxButtonText}>Max</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Validazione visiva */}
                      {reallocationAmounts[accountId] &&
                        parseFloat(reallocationAmounts[accountId]) > data.previousSalaryBalance && (
                          <Text style={styles.validationError}>
                            Importo superiore al disponibile
                          </Text>
                        )}
                    </View>

                    {/* Separatore solo se non è l'ultimo elemento */}
                    {Object.keys(reallocationData).indexOf(accountId) < Object.keys(reallocationData).length - 1 && (
                      <View style={styles.reallocationSeparator} />
                    )}
                  </View>
                ))}
              </ScrollView>

              {/* Pulsanti di azione */}
              <View style={styles.modalButtonsDouble}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setReallocationData({});
                    setReallocationAmounts({});
                    setReallocationTargets({});
                    setShowReallocationModal(false);
                    setShowAllocationModal(true); // Vai direttamente all'allocazione normale
                  }}
                >
                  <Text style={styles.cancelButtonText}>Salta</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    getTotalToReallocate() === 0 && { opacity: 0.5 }
                  ]}
                  disabled={getTotalToReallocate() === 0}
                  onPress={handleReallocationAmounts}
                >
                  <Text style={styles.confirmButtonText}>
                    Continua ({getTotalToReallocate().toFixed(2)} €)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Selezione Stipendio */}
      <Modal
        visible={showSalaryPickerModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleziona Stipendio</Text>
              <ScrollView style={styles.salaryList}>
                {salaries.length === 0 ? (
                  <Text style={styles.emptyText}>Nessuno stipendio disponibile</Text>
                ) : (
                  salaries.map(salary => (
                    <TouchableOpacity
                      key={salary.id}
                      style={[
                        styles.salaryItem,
                        selectedSalary?.id === salary.id && styles.selectedSalaryItem
                      ]}
                      onPress={() => selectSalaryForView(salary)}
                    >
                      <Text style={styles.salaryItemName}>{salary.name}</Text>
                      <Text style={styles.salaryItemAmount}>{salary.amount.toFixed(2)} €</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
              <View style={styles.modalButtonsSingle}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowSalaryPickerModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Chiudi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Selezione Target Riallocazione */}
      <Modal
        visible={showReallocationTargetModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleziona Destinazione</Text>
              <Text style={styles.modalSubtitle}>
                Totale da riallocare: {getTotalToReallocate().toFixed(2)} €
              </Text>

              <ScrollView style={styles.reallocationList}>
                {Object.entries(reallocationAmounts).map(([accountId, amount]) => {
                  const sourceData = reallocationData[accountId];
                  const amountToMove = parseFloat(amount) || 0;

                  if (amountToMove <= 0) return null;

                  return (
                    <View key={accountId} style={styles.reallocationItem}>
                      <View style={styles.reallocationSourceInfo}>
                        <View style={[styles.accountColor, { backgroundColor: sourceData.color }]} />
                        <Text style={styles.reallocationName}>
                          {sourceData.name}: {amountToMove.toFixed(2)} €
                        </Text>
                      </View>

                      <View style={styles.reallocationTargetContainer}>
                        <Text style={styles.reallocationInputLabel}>Sposta verso:</Text>
                        <View style={styles.targetAccountSelector}>
                          {accounts.map(account => (
                            <TouchableOpacity
                              key={account.id}
                              style={[
                                styles.targetAccountOption,
                                reallocationTargets[accountId] === account.id && styles.selectedTargetAccount
                              ]}
                              onPress={() => setReallocationTargets(prev => ({
                                ...prev,
                                [accountId]: account.id
                              }))}
                            >
                              <View style={[styles.accountColor, { backgroundColor: account.color }]} />
                              <Text style={styles.targetAccountText}>{account.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      <View style={styles.reallocationSeparator} />
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.modalButtonsDouble}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowReallocationTargetModal(false);
                    setShowReallocationModal(true);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Indietro</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleReallocationTargets}
                >
                  <Text style={styles.confirmButtonText}>Conferma Riallocazione</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}