import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backupAndShare, restoreFromBackup } from './backupUtils';

// Utilities
export const normalizeDecimal = (value) => {
  return value.replace(/[^0-9.,-]/g, '').replace(',', '.');
};

export const groupDataByColor = (data) => {
  const grouped = {};

  data.forEach(item => {
    if (grouped[item.color]) {
      grouped[item.color].amount += item.amount;
      grouped[item.color].accounts = [...(grouped[item.color].accounts || []), item.name];
    } else {
      grouped[item.color] = {
        name: `Conti ${item.color}`,
        amount: item.amount,
        color: item.color,
        accounts: [item.name]
      };
    }
  });

  return Object.values(grouped);
};

// Custom Hook principale che contiene tutta la logica
export const useMoneyManager = () => {
  // States
  const [currentTab, setCurrentTab] = useState('home');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewMode, setViewMode] = useState('total');
  const [editingAccount, setEditingAccount] = useState(null);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [previousSalary, setPreviousSalary] = useState(null);
  const [reallocationAmounts, setReallocationAmounts] = useState({});
  const [reallocationTargets, setReallocationTargets] = useState({});
  const [reallocationData, setReallocationData] = useState({});

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
  const [editAccountName, setEditAccountName] = useState('');

  // Modal states
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showSalaryPickerModal, setShowSalaryPickerModal] = useState(false);
  const [showManageAccountsModal, setShowManageAccountsModal] = useState(false);
  const [showManageSalariesModal, setShowManageSalariesModal] = useState(false);
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [showReallocationModal, setShowReallocationModal] = useState(false);
  const [showReallocationTargetModal, setShowReallocationTargetModal] = useState(false);

  // Storage functions
  const saveData = useCallback(async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Errore nel salvataggio dei dati:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
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
  }, []);

  const handleBackup = useCallback(async () => {
    try {
      const uri = await backupAndShare();
      Alert.alert('Backup riuscito', `File salvato in:\n${uri}`);
    } catch (e) {
      Alert.alert('Errore', e.message);
    }
  }, []);

  const handleRestore = useCallback(async () => {
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
  }, [loadData]);

  // Calculation functions
  const getAccountBalance = useCallback((accountId, filterBySalary = false, specificSalaryId = null) => {
    let accountTransactions = transactions.filter(t => t.accountId === accountId);

    if (filterBySalary && specificSalaryId) {
      accountTransactions = accountTransactions.filter(t => t.salaryId === specificSalaryId);
    } else if (filterBySalary && selectedSalary) {
      accountTransactions = accountTransactions.filter(t => t.salaryId === selectedSalary.id);
    }

    return accountTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, selectedSalary]);

  const getTotalBalance = useCallback((filterBySalary = false) => {
    return accounts.reduce((sum, account) => sum + getAccountBalance(account.id, filterBySalary), 0);
  }, [accounts, getAccountBalance]);

  const getAccountTransactions = useCallback((accountId, filterBySalary = false) => {
    let accountTransactions = transactions.filter(t => t.accountId === accountId);

    if (filterBySalary && selectedSalary) {
      accountTransactions = accountTransactions.filter(t => t.salaryId === selectedSalary.id);
    }

    return accountTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, selectedSalary]);

  // Account functions
  const addAccount = useCallback(() => {
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
  }, [newAccountName, newAccountColor, accounts, saveData]);

  const deleteAccount = useCallback((accountId) => {
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
  }, [accounts, transactions, selectedAccount, saveData]);

  const updateAccountName = useCallback(() => {
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
  }, [editAccountName, editingAccount, accounts, saveData]);

  // Transaction functions
  const addTransaction = useCallback(() => {
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
  }, [newTransactionDescription, newTransactionAmount, newTransactionAccount, newTransactionSalary, editingTransaction, transactions, saveData]);

  const resetTransactionForm = useCallback(() => {
    setNewTransactionDescription('');
    setNewTransactionAmount('');
    setNewTransactionAccount('');
    setNewTransactionSalary('');
    setEditingTransaction(null);
    setShowAddTransactionModal(false);
  }, []);

  const editTransaction = useCallback((transaction) => {
    setEditingTransaction(transaction);
    setNewTransactionDescription(transaction.description);
    setNewTransactionAmount(transaction.amount.toString());
    setNewTransactionAccount(transaction.accountId);
    setNewTransactionSalary(transaction.salaryId || '');
    setShowAddTransactionModal(true);
  }, []);

  const deleteTransaction = useCallback((transactionId) => {
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
  }, [transactions, saveData]);

  // Salary functions
  const addSalary = useCallback(() => {
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

    // Logica di riallocazione
    const lastSalary = salaries.length > 0 ? salaries[salaries.length - 1] : null;
    setPreviousSalary(lastSalary);
    setCurrentSalary(newSalary);

    if (lastSalary) {
      const accountsWithPreviousSalaryBalance = accounts.filter(account =>
        getAccountBalance(account.id, true, lastSalary.id) > 0
      );

      if (accountsWithPreviousSalaryBalance.length > 0) {
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
        setCurrentAllocatingSalary(newSalary);
        setShowAllocationModal(true);
      }
    } else {
      setCurrentAllocatingSalary(newSalary);
      setShowAllocationModal(true);
    }
  }, [newSalaryName, newSalaryAmount, accounts, salaries, saveData, getAccountBalance]);

  const deleteSalary = useCallback((salaryId) => {
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
  }, [salaries, transactions, selectedSalary, saveData]);

  const allocateSalary = useCallback(() => {
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

    Alert.alert(
      'Successo',
      'Stipendio allocato correttamente!',
      [
        {
          text: 'OK',
          onPress: () => {
            setAllocations({});
            setCurrentAllocatingSalary(null);
            setShowAllocationModal(false);
          }
        }
      ],
      { cancelable: false }
    );
  }, [currentAllocatingSalary, allocations, accounts, transactions, saveData]);

  const selectSalaryForView = useCallback((salary) => {
    setSelectedSalary(salary);
    setViewMode('salary');
    setShowSalaryPickerModal(false);
  }, []);

  // Reallocation functions
  const getTotalToReallocate = useCallback(() => {
    return Object.values(reallocationAmounts).reduce((sum, amount) => {
      return sum + (parseFloat(amount) || 0);
    }, 0);
  }, [reallocationAmounts]);

  const getTotalAvailableForReallocation = useCallback(() => {
    return Object.values(reallocationData).reduce((sum, data) => sum + (data.previousSalaryBalance || 0), 0);
  }, [reallocationData]);

  const handleReallocationAmounts = useCallback(() => {
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

    setShowReallocationModal(false);
    setShowReallocationTargetModal(true);
  }, [reallocationAmounts, reallocationData]);

  const handleReallocationTargets = useCallback(() => {
    const reallocationTransactions = [];
    let totalToReallocate = 0;
    let transactionCounter = 0;

    Object.entries(reallocationAmounts).forEach(([sourceAccountId, amount]) => {
      const amountToMove = parseFloat(amount) || 0;
      const targetAccountId = reallocationTargets[sourceAccountId];

      if (amountToMove > 0 && targetAccountId) {
        totalToReallocate += amountToMove;
        const timestamp = Date.now();

        const sourceAccountName = accounts.find(acc => acc.id === sourceAccountId)?.name || 'Categoria sconosciuta';

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
        `Hai riallocato ${totalToReallocate.toFixed(2)} € da ${previousSalary.name} a ${currentSalary.name}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setReallocationData({});
              setReallocationAmounts({});
              setReallocationTargets({});
              setShowReallocationTargetModal(false);
              setShowAllocationModal(true);
            }
          }
        ],
        { cancelable: false }
      );
    }
  }, [reallocationAmounts, reallocationTargets, accounts, previousSalary, currentSalary, transactions, saveData]);

  // Initialize data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Return all states and functions
  return {
    // States
    currentTab, setCurrentTab,
    accounts, setAccounts,
    transactions, setTransactions,
    salaries, setSalaries,
    selectedAccount, setSelectedAccount,
    selectedSalary, setSelectedSalary,
    editingTransaction, setEditingTransaction,
    viewMode, setViewMode,
    editingAccount, setEditingAccount,
    currentSalary, setCurrentSalary,
    previousSalary, setPreviousSalary,
    reallocationAmounts, setReallocationAmounts,
    reallocationTargets, setReallocationTargets,
    reallocationData, setReallocationData,

    // Form states
    newAccountName, setNewAccountName,
    newAccountColor, setNewAccountColor,
    newTransactionDescription, setNewTransactionDescription,
    newTransactionAmount, setNewTransactionAmount,
    newTransactionAccount, setNewTransactionAccount,
    newTransactionSalary, setNewTransactionSalary,
    newSalaryName, setNewSalaryName,
    newSalaryAmount, setNewSalaryAmount,
    allocations, setAllocations,
    currentAllocatingSalary, setCurrentAllocatingSalary,
    editAccountName, setEditAccountName,

    // Modal states
    showAddAccountModal, setShowAddAccountModal,
    showAddTransactionModal, setShowAddTransactionModal,
    showSalaryModal, setShowSalaryModal,
    showAllocationModal, setShowAllocationModal,
    showSalaryPickerModal, setShowSalaryPickerModal,
    showManageAccountsModal, setShowManageAccountsModal,
    showManageSalariesModal, setShowManageSalariesModal,
    showEditAccountModal, setShowEditAccountModal,
    showReallocationModal, setShowReallocationModal,
    showReallocationTargetModal, setShowReallocationTargetModal,

    // Functions
    loadData,
    saveData,
    handleBackup,
    handleRestore,
    getAccountBalance,
    getTotalBalance,
    getAccountTransactions,
    addAccount,
    deleteAccount,
    updateAccountName,
    addTransaction,
    resetTransactionForm,
    editTransaction,
    deleteTransaction,
    addSalary,
    deleteSalary,
    allocateSalary,
    selectSalaryForView,
    getTotalToReallocate,
    getTotalAvailableForReallocation,
    handleReallocationAmounts,
    handleReallocationTargets,
  };
};