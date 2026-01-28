const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { query } = require('./db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const toDateString = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
};

const parseJsonField = (value) => {
  if (!value) return undefined;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return undefined;
  }
};

const debtStatusToSettlement = (debt) => {
  const nonNegotiableTypes = ['medical bill', 'medical bills', 'medical', 'utility', 'utilities', 'student loan', 'student loans'];
  const isNonNegotiable = nonNegotiableTypes.some((type) => debt.type.toLowerCase().includes(type));
  if (isNonNegotiable) return debt.originalAmount;
  if (debt.status === 'Settled') return debt.currentBalance;
  if (debt.status === 'In Settlement') return debt.currentBalance * 0.6;
  return debt.currentBalance * 0.55;
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/debts', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM debts ORDER BY created_at DESC');
    const debts = rows.map((row) => ({
      id: String(row.id),
      creditor: row.creditor,
      originalCreditor: row.original_creditor || undefined,
      collectionAgency: row.collection_agency || undefined,
      type: row.type,
      originalAmount: Number(row.original_amount),
      currentBalance: Number(row.current_balance),
      interestAccrued: Number(row.interest_accrued),
      status: row.status,
      lastPayment: toDateString(row.last_payment) || undefined,
      nextDue: toDateString(row.next_due) || undefined,
      legalStatus: row.legal_status || undefined,
      legalDetails: parseJsonField(row.legal_details),
      accountNumber: row.account_number || undefined,
    }));
    res.json(debts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load debts' });
  }
});

app.post('/api/debts', async (req, res) => {
  const {
    creditor,
    originalCreditor,
    collectionAgency,
    type,
    originalAmount,
    currentBalance,
    interestAccrued,
    status,
    lastPayment,
    nextDue,
    legalStatus,
    legalDetails,
    accountNumber,
  } = req.body || {};

  if (!creditor || !type) {
    res.status(400).json({ message: 'Creditor and type are required.' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO debts
        (creditor, original_creditor, collection_agency, type, original_amount, current_balance, interest_accrued, status, last_payment, next_due, legal_status, legal_details, account_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        creditor,
        originalCreditor || null,
        collectionAgency || null,
        type,
        Number(originalAmount || 0),
        Number(currentBalance || 0),
        Number(interestAccrued || 0),
        status || 'Active',
        lastPayment || null,
        nextDue || null,
        legalStatus || null,
        legalDetails ? JSON.stringify(legalDetails) : null,
        accountNumber || null,
      ],
    );

    const [row] = await query('SELECT * FROM debts WHERE id = ?', [result.insertId]);

    res.status(201).json({
      id: String(row.id),
      creditor: row.creditor,
      originalCreditor: row.original_creditor || undefined,
      collectionAgency: row.collection_agency || undefined,
      type: row.type,
      originalAmount: Number(row.original_amount),
      currentBalance: Number(row.current_balance),
      interestAccrued: Number(row.interest_accrued),
      status: row.status,
      lastPayment: toDateString(row.last_payment) || undefined,
      nextDue: toDateString(row.next_due) || undefined,
      legalStatus: row.legal_status || undefined,
      legalDetails: parseJsonField(row.legal_details),
      accountNumber: row.account_number || undefined,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create debt.' });
  }
});

app.delete('/api/debts/:id', async (req, res) => {
  try {
    await query('DELETE FROM debts WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete debt.' });
  }
});

app.get('/api/payment-methods', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM payment_methods ORDER BY created_at DESC');
    const methods = rows.map((row) => ({
      id: String(row.id),
      type: row.type,
      name: row.name,
      last4: row.last4,
      isPrimary: Boolean(row.is_primary),
      holderName: row.holder_name,
      expiryDate: row.expiry_date || undefined,
      bankName: row.bank_name || undefined,
      accountType: row.account_type || undefined,
    }));
    res.json(methods);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load payment methods.' });
  }
});

app.post('/api/payment-methods', async (req, res) => {
  const {
    type,
    name,
    last4,
    isPrimary,
    holderName,
    expiryDate,
    bankName,
    accountType,
  } = req.body || {};

  if (!type || !name || !last4 || !holderName) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }

  try {
    if (isPrimary) {
      await query('UPDATE payment_methods SET is_primary = 0');
    }

    const result = await query(
      `INSERT INTO payment_methods
        (type, name, last4, is_primary, holder_name, expiry_date, bank_name, account_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        type,
        name,
        last4,
        isPrimary ? 1 : 0,
        holderName,
        expiryDate || null,
        bankName || null,
        accountType || null,
      ],
    );

    const [row] = await query('SELECT * FROM payment_methods WHERE id = ?', [result.insertId]);

    res.status(201).json({
      id: String(row.id),
      type: row.type,
      name: row.name,
      last4: row.last4,
      isPrimary: Boolean(row.is_primary),
      holderName: row.holder_name,
      expiryDate: row.expiry_date || undefined,
      bankName: row.bank_name || undefined,
      accountType: row.account_type || undefined,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add payment method.' });
  }
});

app.patch('/api/payment-methods/:id/primary', async (req, res) => {
  try {
    await query('UPDATE payment_methods SET is_primary = 0');
    await query('UPDATE payment_methods SET is_primary = 1 WHERE id = ?', [req.params.id]);
    const [row] = await query('SELECT * FROM payment_methods WHERE id = ?', [req.params.id]);
    if (!row) {
      res.status(404).json({ message: 'Payment method not found.' });
      return;
    }
    res.json({
      id: String(row.id),
      type: row.type,
      name: row.name,
      last4: row.last4,
      isPrimary: Boolean(row.is_primary),
      holderName: row.holder_name,
      expiryDate: row.expiry_date || undefined,
      bankName: row.bank_name || undefined,
      accountType: row.account_type || undefined,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update payment method.' });
  }
});

app.delete('/api/payment-methods/:id', async (req, res) => {
  try {
    await query('DELETE FROM payment_methods WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete payment method.' });
  }
});

app.get('/api/notifications', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM notifications ORDER BY created_at DESC');
    const notifications = rows.map((row) => ({
      id: String(row.id),
      type: row.type,
      title: row.title,
      message: row.message,
      date: toDateString(row.notification_date),
      read: Boolean(row.is_read),
    }));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load notifications.' });
  }
});

app.patch('/api/notifications/:id', async (req, res) => {
  try {
    await query('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    const [row] = await query('SELECT * FROM notifications WHERE id = ?', [req.params.id]);
    if (!row) {
      res.status(404).json({ message: 'Notification not found.' });
      return;
    }
    res.json({
      id: String(row.id),
      type: row.type,
      title: row.title,
      message: row.message,
      date: toDateString(row.notification_date),
      read: Boolean(row.is_read),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notification.' });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notification.' });
  }
});

app.delete('/api/notifications', async (_req, res) => {
  try {
    await query('DELETE FROM notifications');
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear notifications.' });
  }
});

app.get('/api/documents', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM documents ORDER BY created_at DESC');
    const documents = rows.map((row) => ({
      id: String(row.id),
      type: row.type,
      fileName: row.file_name,
      uploadDate: toDateString(row.upload_date),
      creditor: row.creditor,
      notes: row.notes || undefined,
    }));
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load documents.' });
  }
});

app.post('/api/documents', async (req, res) => {
  const { type, fileName, uploadDate, creditor, notes } = req.body || {};
  if (!type || !fileName || !uploadDate || !creditor) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }
  try {
    const result = await query(
      `INSERT INTO documents (type, file_name, upload_date, creditor, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [type, fileName, uploadDate, creditor, notes || null],
    );

    const [row] = await query('SELECT * FROM documents WHERE id = ?', [result.insertId]);

    res.status(201).json({
      id: String(row.id),
      type: row.type,
      fileName: row.file_name,
      uploadDate: toDateString(row.upload_date),
      creditor: row.creditor,
      notes: row.notes || undefined,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload document.' });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    await query('DELETE FROM documents WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete document.' });
  }
});

app.get('/api/creditor-calls', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM creditor_calls ORDER BY created_at DESC');
    const calls = rows.map((row) => ({
      id: String(row.id),
      date: toDateString(row.call_date),
      creditor: row.creditor,
      phoneNumber: row.phone_number,
      extension: row.extension || undefined,
      regarding: row.regarding,
      notes: row.notes || undefined,
    }));
    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load creditor calls.' });
  }
});

app.post('/api/creditor-calls', async (req, res) => {
  const { date, creditor, phoneNumber, extension, regarding, notes } = req.body || {};
  if (!date || !creditor || !phoneNumber || !regarding) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }
  try {
    const result = await query(
      `INSERT INTO creditor_calls (call_date, creditor, phone_number, extension, regarding, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [date, creditor, phoneNumber, extension || null, regarding, notes || null],
    );

    const [row] = await query('SELECT * FROM creditor_calls WHERE id = ?', [result.insertId]);

    res.status(201).json({
      id: String(row.id),
      date: toDateString(row.call_date),
      creditor: row.creditor,
      phoneNumber: row.phone_number,
      extension: row.extension || undefined,
      regarding: row.regarding,
      notes: row.notes || undefined,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log call.' });
  }
});

app.delete('/api/creditor-calls/:id', async (req, res) => {
  try {
    await query('DELETE FROM creditor_calls WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete call log.' });
  }
});

app.post('/api/budget-commitments', async (req, res) => {
  const { amount, availableDate, notes } = req.body || {};
  if (!amount || !availableDate) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO budget_commitments (amount, available_date, notes)
       VALUES (?, ?, ?)`,
      [Number(amount), availableDate, notes || null],
    );

    const [row] = await query('SELECT * FROM budget_commitments WHERE id = ?', [result.insertId]);

    res.status(201).json({
      id: String(row.id),
      amount: Number(row.amount),
      availableDate: toDateString(row.available_date),
      notes: row.notes || undefined,
      createdAt: row.created_at,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to store budget commitment.' });
  }
});

app.get('/api/settlement-commitments', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM settlement_commitments ORDER BY signed_at DESC');
    const commitments = rows.map((row) => ({
      debtId: String(row.debt_id),
      creditor: row.creditor,
      settlementAmount: Number(row.settlement_amount),
      commitmentDate: toDateString(row.commitment_date),
      signedAt: row.signed_at,
      signature: row.signature,
    }));
    res.json(commitments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load commitments.' });
  }
});

app.post('/api/settlement-commitments', async (req, res) => {
  const { debtId, creditor, settlementAmount, commitmentDate, signedAt, signature } = req.body || {};
  if (!debtId || !creditor || !settlementAmount || !commitmentDate || !signedAt || !signature) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO settlement_commitments
        (debt_id, creditor, settlement_amount, commitment_date, signed_at, signature)
       VALUES (?, ?, ?, ?, ?, ?)` ,
      [debtId, creditor, Number(settlementAmount), commitmentDate, signedAt, signature],
    );

    const [row] = await query('SELECT * FROM settlement_commitments WHERE id = ?', [result.insertId]);

    res.status(201).json({
      debtId: String(row.debt_id),
      creditor: row.creditor,
      settlementAmount: Number(row.settlement_amount),
      commitmentDate: toDateString(row.commitment_date),
      signedAt: row.signed_at,
      signature: row.signature,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to store commitment.' });
  }
});

app.get('/api/dashboard', async (_req, res) => {
  try {
    const debtRows = await query('SELECT * FROM debts');
    const debts = debtRows.map((row) => ({
      id: String(row.id),
      type: row.type,
      status: row.status,
      originalAmount: Number(row.original_amount),
      currentBalance: Number(row.current_balance),
    }));

    const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
    const totalOriginal = debts.reduce((sum, debt) => sum + debt.originalAmount, 0);
    const settlementTarget = debts.reduce((sum, debt) => sum + debtStatusToSettlement(debt), 0);

    const activeSettlements = debts.filter((debt) => debt.status === 'In Settlement').length;

    const debtByTypeMap = debts.reduce((acc, debt) => {
      const key = debt.type || 'Other';
      acc[key] = (acc[key] || 0) + debt.currentBalance;
      return acc;
    }, {});

    const debtByType = Object.entries(debtByTypeMap).map(([name, value]) => ({
      name,
      value,
    }));

    const settlementProgress = await query('SELECT * FROM settlement_progress ORDER BY sort_order ASC');
    const settlementData = settlementProgress.map((row) => ({
      month: row.month_label,
      original: Number(row.original_total),
      current: Number(row.current_total),
    }));

    const payments = await query(
      'SELECT * FROM payments WHERE payment_date >= CURDATE() ORDER BY payment_date ASC LIMIT 1',
    );
    const nextPayment = payments[0]
      ? {
          amount: Number(payments[0].amount),
          dueDate: toDateString(payments[0].payment_date),
          creditor: payments[0].creditor,
        }
      : null;

    const activityRows = await query(
      `SELECT 'payment' AS type, payment_date AS activity_date, creditor, amount
       FROM payments
       UNION ALL
       SELECT 'settlement' AS type, commitment_date AS activity_date, creditor, settlement_amount AS amount
       FROM settlement_commitments
       ORDER BY activity_date DESC
       LIMIT 5`,
    );

    const recentActivity = activityRows.map((row) => ({
      type: row.type,
      creditor: row.creditor,
      amount: Number(row.amount),
      date: toDateString(row.activity_date),
    }));

    res.json({
      totalDebt,
      totalOriginal,
      settlementTarget,
      activeSettlements,
      debtByType,
      settlementProgress: settlementData,
      nextPayment,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load dashboard data.' });
  }
});

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
