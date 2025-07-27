// backupUtils.js
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';

const BACKUP_DIR = FileSystem.documentDirectory + 'backups/';

/* Assicurati che la cartella backup esista */
export async function ensureBackupDir() {
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
}

export async function backupAndShare() {
    let uri = '';
    try {
        const keys = ['accounts', 'transactions', 'salaries'];
        const [accounts, transactions, salaries] = await Promise.all(
            keys.map(k => AsyncStorage.getItem(k))
        );

        const payload = {
            meta: {
                createdAt: new Date().toISOString(),
                version: 1
            },
            data: {
                accounts: JSON.parse(accounts || '[]'),
                transactions: JSON.parse(transactions || '[]'),
                salaries: JSON.parse(salaries || '[]')
            }
        };

        const filename = `backup_${Date.now()}.json`;
        uri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload), {
            encoding: FileSystem.EncodingType.UTF8
        });

        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) {
            alert('Condivisione non disponibile su questo dispositivo');
        } else {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/json',
                dialogTitle: 'Condividi il backup',
                UTI: 'public.json'
            });
        }

    } catch (err) {
        console.error('Errore durante il backup e la condivisione:', err);
        alert('Si è verificato un errore durante la creazione o la condivisione del backup.');
    }

    return uri; // ✅ adesso viene sempre restituito
}

/* 2️⃣ RIPRISTINO */
export async function restoreFromBackup() {
    const res = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
        multiple: false // facoltativo
    });

    console.log('🟡 DocumentPicker result:', res);

    if (res.canceled || !res.assets || res.assets.length === 0) {
        alert('⚠️ Selezione annullata o nessun file valido selezionato');
        return false;
    }

    const file = res.assets[0];
    const uri = file.uri;

    // Lettura del contenuto
    const raw = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.UTF8
    });

    let payload;
    try {
        payload = JSON.parse(raw);
    } catch (e) {
        throw new Error('❌ File JSON non valido');
    }

    const { accounts = [], transactions = [], salaries = [] } = payload.data || {};
    if (!Array.isArray(accounts) || !Array.isArray(transactions) || !Array.isArray(salaries)) {
        throw new Error('❌ Struttura backup non riconosciuta');
    }

    await Promise.all([
        AsyncStorage.setItem('accounts', JSON.stringify(accounts)),
        AsyncStorage.setItem('transactions', JSON.stringify(transactions)),
        AsyncStorage.setItem('salaries', JSON.stringify(salaries))
    ]);

    return true;
}