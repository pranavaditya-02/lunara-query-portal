import { pool } from "../config/db.js";

const ALLOWED_STATUS = new Set(["pending", "resolved"]);

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseQueryId(id) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function mapQuery(row) {
  return {
    id: row.id,
    name: row.name,
    query: row.query,
    answer: row.answer || "",
    status: row.status,
    timestamp: new Date(row.timestamp).toISOString(),
  };
}

export async function getQueries(req, res) {
  try {
    const isAuthenticated = Boolean(req.user);

    const sql = isAuthenticated
      ? "SELECT id, name, query, answer, status, timestamp FROM queries ORDER BY created_at DESC"
      : "SELECT id, name, query, answer, status, timestamp FROM queries WHERE status = 'resolved' ORDER BY created_at DESC";

    const [rows] = await pool.query(sql);

    return res.json({
      status: "success",
      data: rows.map(mapQuery),
    });
  } catch (_error) {
    return res.status(500).json({ status: "error", message: "Failed to fetch queries" });
  }
}

export async function createQuery(req, res) {
  const { name, query, status, timestamp } = req.body;
  const cleanName = normalizeText(name);
  const cleanQuery = normalizeText(query);

  if (!cleanName || !cleanQuery) {
    return res.status(400).json({
      status: "error",
      message: "Name and query are required",
    });
  }

  if (cleanName.length > 120) {
    return res.status(400).json({ status: "error", message: "Name is too long" });
  }

  if (cleanQuery.length < 10 || cleanQuery.length > 5000) {
    return res.status(400).json({
      status: "error",
      message: "Query must be between 10 and 5000 characters",
    });
  }

  try {
    const finalStatus = req.user && ALLOWED_STATUS.has(status) ? status : "pending";
    const finalTimestamp = timestamp ? new Date(timestamp) : new Date();

    if (Number.isNaN(finalTimestamp.getTime())) {
      return res.status(400).json({ status: "error", message: "Invalid timestamp" });
    }

    const [result] = await pool.query(
      "INSERT INTO queries (name, query, status, timestamp) VALUES (?, ?, ?, ?)",
      [cleanName, cleanQuery, finalStatus, finalTimestamp]
    );

    const [rows] = await pool.query(
      "SELECT id, name, query, answer, status, timestamp FROM queries WHERE id = ? LIMIT 1",
      [result.insertId]
    );

    return res.status(201).json({
      status: "success",
      message: "Query submitted successfully",
      data: mapQuery(rows[0]),
    });
  } catch (_error) {
    return res.status(500).json({ status: "error", message: "Failed to create query" });
  }
}

export async function updateQuery(req, res) {
  const { id } = req.params;
  const { answer, status } = req.body;
  const queryId = parseQueryId(id);

  if (!queryId) {
    return res.status(400).json({ status: "error", message: "Invalid query id" });
  }

  if (!ALLOWED_STATUS.has(status)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid status",
    });
  }

  const cleanAnswer = typeof answer === "string" ? answer.trim() : "";
  if (cleanAnswer.length > 10000) {
    return res.status(400).json({ status: "error", message: "Answer is too long" });
  }

  try {
    await pool.query(
      "UPDATE queries SET answer = ?, status = ? WHERE id = ?",
      [cleanAnswer, status, queryId]
    );

    const [rows] = await pool.query(
      "SELECT id, name, query, answer, status, timestamp FROM queries WHERE id = ? LIMIT 1",
      [queryId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Query not found" });
    }

    return res.json({
      status: "success",
      message: "Query updated successfully",
      data: mapQuery(rows[0]),
    });
  } catch (_error) {
    return res.status(500).json({ status: "error", message: "Failed to update query" });
  }
}

export async function deleteQuery(req, res) {
  const { id } = req.params;
  const queryId = parseQueryId(id);

  if (!queryId) {
    return res.status(400).json({ status: "error", message: "Invalid query id" });
  }

  try {
    const [result] = await pool.query("DELETE FROM queries WHERE id = ?", [queryId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "Query not found" });
    }

    return res.json({ status: "success", message: "Query deleted successfully" });
  } catch (_error) {
    return res.status(500).json({ status: "error", message: "Failed to delete query" });
  }
}
