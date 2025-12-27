import { StudentMemo } from '../models/StudentMemo.js';

// GET /api/memos?student_id=...
export const getMemosByStudent = async (req, res, next) => {
  try {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }

    const memos = await StudentMemo.findByStudent(student_id);
    res.json({ memos, total: memos.length });
  } catch (error) {
    next(error);
  }
};

// POST /api/memos
export const createMemo = async (req, res, next) => {
  try {
    const { academy_id, student_id, author_id, text } = req.body;

    if (!academy_id || !student_id || !text) {
      return res
        .status(400)
        .json({ error: 'academy_id, student_id, text are required' });
    }

    const memo = new StudentMemo({
      academy_id,
      student_id,
      author_id: author_id || null,
      text: text.trim(),
    });

    await memo.save();
    res.status(201).json({ memo });
  } catch (error) {
    next(error);
  }
};


