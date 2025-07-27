import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export const COLORS = {
    PRIMARY: '#2196F3',
    BACKGROUND: '#ebebeb',
    WHITE: '#fff',
    TEXT_PRIMARY: '#333',
    TEXT_SECONDARY: '#666',
    BORDER: '#E0E0E0',
    DANGER: '#F44336',
    SUCCESS: '#4CAF50',
};

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
        paddingBottom: Platform.OS === 'android' ? 20 : 0, // Evita sovrapposizione con navigation bar
    },
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    scrollContent: {
        paddingBottom: Platform.OS === 'android' ? 0 : 0, // Spazio extra per navigation
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
    },
    viewModeToggle: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        padding: 2,
    },
    toggleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
    },
    activeToggle: {
        backgroundColor: COLORS.PRIMARY,
    },
    toggleText: {
        fontSize: 12,
        color: COLORS.TEXT_SECONDARY,
    },
    activeToggleText: {
        color: COLORS.WHITE,
    },
    balanceCard: {
        backgroundColor: COLORS.PRIMARY,
        margin: 20,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    balanceLabel: {
        fontSize: 16,
        color: COLORS.WHITE,
        opacity: 0.9,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginTop: 5,
    },
    centerContent: {
        justifyContent: 'center',
        flex: 1,
    },
    chartCard: {
        backgroundColor: COLORS.WHITE,
        marginHorizontal: 20,
        marginTop: 0,
        marginBottom: 20,
        padding: 20,
        borderRadius: 12,
        width: screenWidth - 40,
        justifyContent: 'center'
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 20,
        textAlign: 'center',
    },
    flatListContent: {
        paddingBottom: Platform.OS === 'android' ? 30 : 20,
    },
    HorizontalBarChart: {
        marginBottom: 20,
    },
    barChartContainer: {
        paddingVertical: 10,
    },
    barChartRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%'
    },
    barChartLabel: {
        fontSize: 14,
        color: COLORS.TEXT_PRIMARY,
        width: 70,
        marginRight: 10,
    },
    barChartRowTrack: {
        flex: 1,
        height: 24,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 10,
    },
    barChartRowBar: {
        height: '100%',
        borderRadius: 12,
    },
    barChartPercentage: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.TEXT_SECONDARY,
        width: 40,
        textAlign: 'right',
    },
    percentageOnly: {
        width: 40,
        alignItems: 'flex-end',
    },
    amountAndPercentage: {
        width: 70,
        alignItems: 'flex-end',
    },
    pieRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    pieBarContainer: {
        flex: 1,
        height: 30,
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        overflow: 'hidden',
        marginRight: 10,
    },
    pieBar: {
        height: '100%',
        borderRadius: 15,
    },
    piePercentage: {
        width: 45,
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
        textAlign: 'right',
    },
    legendContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.BORDER,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 5,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 10,
    },
    legendText: {
        flex: 1,
        fontSize: 14,
        color: COLORS.TEXT_PRIMARY,
    },
    legendAmount: {
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
        fontWeight: 'bold',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: COLORS.BORDER,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.PRIMARY,
    },
    summaryCard: {
        backgroundColor: COLORS.WHITE,
        margin: 20,
        marginTop: 0,
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
        flex: 1,
    },
    summaryLabel: {
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
        marginBottom: 5,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    summaryDivider: {
        width: 1,
        backgroundColor: COLORS.BORDER,
        marginVertical: 5,
    },
    accountsSection: {
        margin: 20,
        marginTop: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    manageButton: {
        padding: 8,
        marginRight: 10,
    },
    addButton: {
        backgroundColor: COLORS.PRIMARY,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    accountCard: {
        backgroundColor: COLORS.WHITE,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    accountColor: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 15,
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
    },
    accountBalance: {
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
        marginTop: 2,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginLeft: 20,
        marginRight: 20,
    },
    backupActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginLeft: 20,
        marginRight: 20,
        marginBottom: Platform.OS === 'android' ? 70 : 50, // Maggiore spazio per Android
    },
    transactionActionButton: { // Rinominato da actionButton
        padding: 5,
        marginLeft: 5,
    },
    // Mantenere actionButton per i bottoni delle azioni principali
    actionButton: {
        backgroundColor: COLORS.WHITE,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        width: '45%',
    },
    actionText: {
        fontSize: 14,
        color: COLORS.TEXT_PRIMARY,
        marginTop: 5,
        textAlign: 'center',
    },
    accountHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.WHITE,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
    },
    backButton: {
        padding: 5,
    },
    accountTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
        flex: 1,
        textAlign: 'center',
    },
    transactionsSection: {
        flex: 1,
        margin: 20,
    },
    transactionsList: {
        flex: 1,
    },
    transactionItem: {
        backgroundColor: COLORS.WHITE,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionDescription: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
    },
    transactionDate: {
        fontSize: 12,
        color: COLORS.TEXT_SECONDARY,
        marginTop: 2,
    },
    transactionActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalWrapper: {
        width: '90%',
        backgroundColor: COLORS.WHITE,
        borderRadius: 12,
        marginVertical: 40,
        padding: 20,
    },
    modalContent: {
        flexGrow: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    labelText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 5,
    },
    labelTextSuggerimento: {
        fontSize: 14,
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 10,
        fontStyle: 'italic',
    },
    colorPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        margin: 5,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    selectedColor: {
        borderColor: COLORS.TEXT_PRIMARY,
    },
    modalButtonsSingle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    modalButtonsDouble: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    button: {
        width: '47%',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.BACKGROUND,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    confirmButton: {
        backgroundColor: COLORS.PRIMARY,
    },
    cancelButtonText: {
        color: COLORS.TEXT_SECONDARY,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    confirmButtonText: {
        color: COLORS.WHITE,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    accountSelector: {
        marginBottom: 20,
    },
    accountOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: COLORS.BACKGROUND,
    },
    selectedAccount: {
        backgroundColor: '#e3f2fd',
        borderWidth: 2,
        borderColor: COLORS.PRIMARY,
    },
    accountOptionText: {
        fontSize: 16,
        color: COLORS.TEXT_PRIMARY,
        marginLeft: 10,
    },
    salarySelector: {
        marginBottom: 20,
    },
    salaryOption: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: COLORS.BACKGROUND,
    },
    selectedSalary: {
        backgroundColor: '#e3f2fd',
        borderWidth: 2,
        borderColor: COLORS.PRIMARY,
    },
    salaryOptionText: {
        fontSize: 16,
        color: COLORS.TEXT_PRIMARY,
    },
    salaryInfo: {
        fontSize: 16,
        color: COLORS.TEXT_SECONDARY,
        textAlign: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 8,
    },
    remainingInfo: {
        fontSize: 14,
        color: COLORS.SUCCESS,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    allocationList: {
        maxHeight: 200,
        marginBottom: 20,
    },
    allocationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    allocationInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    allocationName: {
        fontSize: 16,
        color: COLORS.TEXT_PRIMARY,
        marginLeft: 10,
    },
    allocationInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 8,
        width: 80,
        textAlign: 'center',
        fontSize: 16,
    },
    salaryList: {
        maxHeight: 300,
        marginBottom: 20,
    },
    salaryItem: {
        backgroundColor: COLORS.BACKGROUND,
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedSalaryItem: {
        backgroundColor: '#e3f2fd',
        borderWidth: 2,
        borderColor: COLORS.PRIMARY,
    },
    salaryItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
    },
    salaryItemAmount: {
        fontSize: 16,
        color: COLORS.TEXT_SECONDARY,
    },
    manageList: {
        maxHeight: 300,
        marginBottom: 20,
    },
    manageItem: {
        backgroundColor: COLORS.BACKGROUND,
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    manageItemInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    manageItemText: {
        flex: 1,
    },
    manageItemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.TEXT_PRIMARY,
    },
    manageItemBalance: {
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
        marginTop: 2,
    },
    deleteButton: {
        padding: 8,
        marginLeft: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 20,
    },
    separator: {
        height: 2,
        backgroundColor: '#ccc',
        width: '90%',
        margin: 20,
        alignSelf: 'center',
    },
    manageItemActions: {
        flexDirection: 'row',
        gap: 10,
    },
    editButton: {
        padding: 5,
    },
    modalSubtitle: {
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
        textAlign: 'center',
    },
    reallocationList: {
        maxHeight: 300,
    },
    reallocationItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 10,
    },
    reallocationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    reallocationName: {
        fontSize: 16,
        fontWeight: '500',
    },
    reallocationBalance: {
        fontSize: 12,
        color: COLORS.TEXT_SECONDARY,
        flexShrink: 1,
        flexWrap: 'wrap',
        maxWidth: 150, // o una dimensione adatta
    },
    reallocationHeader: {
        paddingBottom: 10,
        borderBottomColor: COLORS.BORDER,
    },
    reallocationTotal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.PRIMARY,
        textAlign: 'center',
    },
    reallocationSourceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    reallocationSourceText: {
        flex: 1,
        marginLeft: 10,
    },
    reallocationInputSection: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    reallocationInputContainer: {
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    reallocationInputLabel: {
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
        fontWeight: 'bold',
    },
    targetAccountSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    targetAccountOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: COLORS.BACKGROUND,
        marginRight: 8,
        marginBottom: 8,
    },
    selectedTargetAccount: {
        backgroundColor: '#e3f2fd',
        borderColor: COLORS.PRIMARY,
    },
    reallocationSeparator: {
        height: 1,
        backgroundColor: COLORS.BORDER,
        marginTop: 16,
    },
    reallocationTargetContainer: {
        marginTop: 10,
        marginBottom: 10,
    },
    targetAccountText: {
        fontSize: 14,
        marginLeft: 8,
        color: COLORS.TEXT_PRIMARY,
    },
    reallocationTotals: {
        marginTop: 10,
        marginBottom: 10,
        padding: 12,
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: 8,
        justifyContent: 'center',   // centra verticalmente
        alignItems: 'center',       // centra orizzontalmente
    },
    reallocationAccountHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    reallocationAccountInfo: {
        marginLeft: 12,
        flex: 1,
    },
    reallocationAccountName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.TEXT_PRIMARY,
    },
    reallocationAccountBalance: {
        fontSize: 14,
        color: COLORS.TEXT_SECONDARY,
        marginTop: 2,
    },
    reallocationInput: {
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: COLORS.WHITE,
        width: 80,
        textAlign: 'center'
    },
    maxButton: {
        backgroundColor: COLORS.PRIMARY,
        borderRadius: 8,
        fontSize: 16,
        padding: 10,
        width: 60,
    },
    maxButtonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    validationError: {
        color: COLORS.DANGER,
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },
});