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

const getClientId = (req) => {
  const raw = req.query.clientId || req.body?.clientId || 1;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? 1 : parsed;
};

const ensureClientExists = async (clientId) => {
  const rows = await query('SELECT id FROM clients WHERE id = ?', [clientId]);
  if (rows.length > 0) {
    return;
  }

  await query(
    `INSERT INTO clients (id, name, email, status, join_date)
     VALUES (?, ?, ?, ?, ?)`,
    [
      clientId,
      `Client ${clientId}`,
      `client${clientId}@example.com`,
      'Active',
      toDateString(new Date()),
    ],
  );
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

app.get('/api/admin/clients', async (_req, res) => {
  try {
    const clients = await query('SELECT * FROM clients ORDER BY name ASC');
    const debtRows = await query('SELECT client_id, status, current_balance FROM debts');
    const settlementRows = await query('SELECT client_id, settlement_amount FROM settlement_commitments');
    const budgetRows = await query(
      'SELECT client_id, amount, available_date, created_at FROM budget_commitments',
    );

    const debtTotals = debtRows.reduce((acc, row) => {
      const key = String(row.client_id);
      if (!acc[key]) {
        acc[key] = { totalDebt: 0, activeSettlements: 0 };
      }
      acc[key].totalDebt += Number(row.current_balance);
      if (row.status === 'In Settlement') {
        acc[key].activeSettlements += 1;
      }
      return acc;
    }, {});

    const settledTotals = settlementRows.reduce((acc, row) => {
      const key = String(row.client_id);
      acc[key] = (acc[key] || 0) + Number(row.settlement_amount);
      return acc;
    }, {});

    const budgetByClient = budgetRows.reduce((acc, row) => {
      const key = String(row.client_id);
      const createdAt = new Date(row.created_at);
      if (!acc[key] || createdAt > acc[key].createdAt) {
        acc[key] = {
          amount: Number(row.amount),
          availableDate: toDateString(row.available_date),
          createdAt,
        };
      }
      return acc;
    }, {});

    const response = clients.map((client) => ({
      id: String(client.id),
      name: client.name,
      email: client.email,
      phone: client.phone || undefined,
      totalDebt: debtTotals[String(client.id)]?.totalDebt || 0,
      settledAmount: settledTotals[String(client.id)] || 0,
      status: client.status,
      joinDate: toDateString(client.join_date),
      activeSettlements: debtTotals[String(client.id)]?.activeSettlements || 0,
      monthlyBudget: budgetByClient[String(client.id)]?.amount ?? (client.monthly_budget ? Number(client.monthly_budget) : undefined),
      budgetLastUpdated: budgetByClient[String(client.id)]?.availableDate || toDateString(client.budget_last_updated) || undefined,
      lastLogin: client.last_login || undefined,
      lastMessageClick: client.last_message_click || undefined,
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load clients.' });
  }
});

app.post('/api/admin/clients', async (req, res) => {
  const { name, email, phone, status, joinDate } = req.body || {};

  if (!name || !email) {
    res.status(400).json({ message: 'Name and email are required.' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO clients (name, email, phone, status, join_date)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, status || 'Pending', joinDate || toDateString(new Date())],
    );

    const [client] = await query('SELECT * FROM clients WHERE id = ?', [result.insertId]);

    res.status(201).json({
      id: String(client.id),
      name: client.name,
      email: client.email,
      phone: client.phone || undefined,
      totalDebt: 0,
      settledAmount: 0,
      status: client.status,
      joinDate: toDateString(client.join_date),
      activeSettlements: 0,
      monthlyBudget: client.monthly_budget ? Number(client.monthly_budget) : undefined,
      budgetLastUpdated: toDateString(client.budget_last_updated) || undefined,
      lastLogin: client.last_login || undefined,
      lastMessageClick: client.last_message_click || undefined,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create client.' });
  }
});

app.get('/api/admin/debts', async (_req, res) => {
  try {
    const rows = await query(
      `SELECT debts.*, clients.name AS client_name
       FROM debts
       LEFT JOIN clients ON clients.id = debts.client_id
       ORDER BY debts.created_at DESC`,
    );

    const debts = rows.map((row) => ({
      id: String(row.id),
      clientId: String(row.client_id),
      clientName: row.client_name || `Client ${row.client_id}`,
      creditor: row.creditor,
      originalCreditor: row.original_creditor || undefined,
      collectionAgency: row.collection_agency || undefined,
      type: row.type,
      originalAmount: Number(row.original_amount),
      currentBalance: Number(row.current_balance),
      interestAccrued: Number(row.interest_accrued),
      status: row.status,
      legalStatus: row.legal_status || undefined,
      internalNotes: parseJsonField(row.internal_notes),
      settlementOffers: parseJsonField(row.settlement_offers),
    }));

    res.json(debts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load debts.' });
  }
});

app.patch('/api/admin/debts/:id', async (req, res) => {
  const { internalNotes, settlementOffers } = req.body || {};
  try {
    await query(
      'UPDATE debts SET internal_notes = ?, settlement_offers = ? WHERE id = ?',
      [
        internalNotes ? JSON.stringify(internalNotes) : null,
        settlementOffers ? JSON.stringify(settlementOffers) : null,
        req.params.id,
      ],
    );
    const [row] = await query('SELECT * FROM debts WHERE id = ?', [req.params.id]);
    res.json({
      id: String(row.id),
      clientId: String(row.client_id),
      creditor: row.creditor,
      originalCreditor: row.original_creditor || undefined,
      collectionAgency: row.collection_agency || undefined,
      type: row.type,
      originalAmount: Number(row.original_amount),
      currentBalance: Number(row.current_balance),
      interestAccrued: Number(row.interest_accrued),
      status: row.status,
      legalStatus: row.legal_status || undefined,
      internalNotes: parseJsonField(row.internal_notes),
      settlementOffers: parseJsonField(row.settlement_offers),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update debt.' });
  }
});

app.get('/api/debts', async (req, res) => {
  const clientId = getClientId(req);
  try {
    const rows = await query('SELECT * FROM debts WHERE client_id = ? ORDER BY created_at DESC', [clientId]);
    const debts = rows.map((row) => ({
      id: String(row.id),
      clientId: String(row.client_id),
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
      internalNotes: parseJsonField(row.internal_notes),
      settlementOffers: parseJsonField(row.settlement_offers),
      accountNumber: row.account_number || undefined,
    }));
    res.json(debts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load debts' });
  }
});

app.post('/api/debts', async (req, res) => {
  const {
    clientId,
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
    const resolvedClientId = Number(clientId || getClientId(req));
    await ensureClientExists(resolvedClientId);
    await ensureClientExists(resolvedClientId);
    const result = await query(
      `INSERT INTO debts
        (client_id, creditor, original_creditor, collection_agency, type, original_amount, current_balance, interest_accrued, status, last_payment, next_due, legal_status, legal_details, account_number, internal_notes, settlement_offers)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        resolvedClientId,
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
        null,
        null,
      ],
    );

    const [row] = await query('SELECT * FROM debts WHERE id = ?', [result.insertId]);

    res.status(201).json({
      id: String(row.id),
      clientId: String(row.client_id),
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
      internalNotes: parseJsonField(row.internal_notes),
      settlementOffers: parseJsonField(row.settlement_offers),
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

app.get('/api/payment-methods', async (req, res) => {
  const clientId = getClientId(req);
  try {
    const rows = await query('SELECT * FROM payment_methods WHERE client_id = ? ORDER BY created_at DESC', [clientId]);
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
    clientId,
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
    const resolvedClientId = Number(clientId || getClientId(req));
    if (isPrimary) {
      await query('UPDATE payment_methods SET is_primary = 0 WHERE client_id = ?', [resolvedClientId]);
    }

    const result = await query(
      `INSERT INTO payment_methods
        (client_id, type, name, last4, is_primary, holder_name, expiry_date, bank_name, account_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        resolvedClientId,
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
  const clientId = getClientId(req);
  try {
    await query('UPDATE payment_methods SET is_primary = 0 WHERE client_id = ?', [clientId]);
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

app.get('/api/notifications', async (req, res) => {
  const clientId = getClientId(req);
  try {
    const rows = await query('SELECT * FROM notifications WHERE client_id = ? ORDER BY created_at DESC', [clientId]);
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

app.delete('/api/notifications', async (req, res) => {
  const clientId = getClientId(req);
  try {
    await query('DELETE FROM notifications WHERE client_id = ?', [clientId]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear notifications.' });
  }
});

app.get('/api/documents', async (req, res) => {
  const clientId = getClientId(req);
  try {
    const rows = await query('SELECT * FROM documents WHERE client_id = ? ORDER BY created_at DESC', [clientId]);
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
  const { clientId, type, fileName, uploadDate, creditor, notes } = req.body || {};
  if (!type || !fileName || !uploadDate || !creditor) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }
  try {
    const resolvedClientId = Number(clientId || getClientId(req));
    await ensureClientExists(resolvedClientId);
    const result = await query(
      `INSERT INTO documents (client_id, type, file_name, upload_date, creditor, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [resolvedClientId, type, fileName, uploadDate, creditor, notes || null],
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

app.get('/api/creditor-calls', async (req, res) => {
  const clientId = getClientId(req);
  try {
    const rows = await query('SELECT * FROM creditor_calls WHERE client_id = ? ORDER BY created_at DESC', [clientId]);
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
  const { clientId, date, creditor, phoneNumber, extension, regarding, notes } = req.body || {};
  if (!date || !creditor || !phoneNumber || !regarding) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }
  try {
    const resolvedClientId = Number(clientId || getClientId(req));
    await ensureClientExists(resolvedClientId);
    const result = await query(
      `INSERT INTO creditor_calls (client_id, call_date, creditor, phone_number, extension, regarding, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [resolvedClientId, date, creditor, phoneNumber, extension || null, regarding, notes || null],
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
  const { clientId, amount, availableDate, notes } = req.body || {};
  if (!amount || !availableDate) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }

  try {
    const resolvedClientId = Number(clientId || getClientId(req));
    await ensureClientExists(resolvedClientId);
    const result = await query(
      `INSERT INTO budget_commitments (client_id, amount, available_date, notes)
       VALUES (?, ?, ?, ?)`,
      [resolvedClientId, Number(amount), availableDate, notes || null],
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

app.get('/api/settlement-commitments', async (req, res) => {
  const clientId = getClientId(req);
  try {
    const rows = await query(
      'SELECT * FROM settlement_commitments WHERE client_id = ? ORDER BY signed_at DESC',
      [clientId],
    );
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
  const { clientId, debtId, creditor, settlementAmount, commitmentDate, signedAt, signature } = req.body || {};
  if (!debtId || !creditor || !settlementAmount || !commitmentDate || !signedAt || !signature) {
    res.status(400).json({ message: 'Missing required fields.' });
    return;
  }

  try {
    const resolvedClientId = Number(clientId || getClientId(req));
    await ensureClientExists(resolvedClientId);
    const result = await query(
      `INSERT INTO settlement_commitments
        (debt_id, client_id, creditor, settlement_amount, commitment_date, signed_at, signature)
       VALUES (?, ?, ?, ?, ?, ?, ?)` ,
      [debtId, resolvedClientId, creditor, Number(settlementAmount), commitmentDate, signedAt, signature],
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

app.get('/api/dashboard', async (req, res) => {
  const clientId = getClientId(req);
  try {
    const debtRows = await query('SELECT * FROM debts WHERE client_id = ?', [clientId]);
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

    const settlementProgress = await query(
      'SELECT * FROM settlement_progress WHERE client_id = ? ORDER BY sort_order ASC',
      [clientId],
    );
    const settlementData = settlementProgress.map((row) => ({
      month: row.month_label,
      original: Number(row.original_total),
      current: Number(row.current_total),
    }));

    const payments = await query(
      'SELECT * FROM payments WHERE client_id = ? AND payment_date >= CURDATE() ORDER BY payment_date ASC LIMIT 1',
      [clientId],
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
       WHERE client_id = ?
       UNION ALL
       SELECT 'settlement' AS type, commitment_date AS activity_date, creditor, settlement_amount AS amount
       FROM settlement_commitments
       WHERE client_id = ?
       ORDER BY activity_date DESC
       LIMIT 5`,
      [clientId, clientId],
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
