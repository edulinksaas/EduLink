import { AttendanceRecord } from '../models/AttendanceRecord.js';

// GET /api/attendance?student_id=...&month=YYYY-MM
export const getAttendanceByStudent = async (req, res, next) => {
  try {
    const { student_id, month } = req.query;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }

    let fromDate = null;
    let toDate = null;

    if (month) {
      // month = '2025-03' 형태
      const [year, m] = month.split('-').map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 1); // 다음 달 1일
      fromDate = start.toISOString().slice(0, 10);
      toDate = end.toISOString().slice(0, 10);
    }

    const records = await AttendanceRecord.findByStudent(
      student_id,
      fromDate,
      toDate,
    );

    res.json({ records, total: records.length });
  } catch (error) {
    next(error);
  }
};

// POST /api/attendance
export const createAttendance = async (req, res, next) => {
  try {
    const { academy_id, student_id, class_id, enrollment_id, date, status, note } = req.body;

    if (!academy_id || !student_id || !status) {
      return res
        .status(400)
        .json({ error: 'academy_id, student_id, status are required' });
    }

    const today = new Date();
    const dateStr =
      date || today.toISOString().slice(0, 10); // YYYY-MM-DD

    const record = new AttendanceRecord({
      academy_id,
      student_id,
      class_id: class_id || null,
      enrollment_id: enrollment_id || null,
      date: dateStr,
      status,
      note: note || '',
    });

    await record.save();
    res.status(201).json({ record });
  } catch (error) {
    next(error);
  }
};

// PUT /api/attendance/:id
export const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const record = await AttendanceRecord.findById(id);
    if (!record) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    record.status = status;
    record.note = note || '';
    await record.save();

    res.json({ record });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/attendance/:id
export const deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await AttendanceRecord.findById(id);
    if (!record) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    await record.delete();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};


