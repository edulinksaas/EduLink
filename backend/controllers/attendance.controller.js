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

    console.log('📝 출석 기록 생성 요청:', {
      academy_id,
      student_id,
      class_id,
      enrollment_id,
      date,
      status,
      note,
    });

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

    console.log('💾 저장할 출석 기록:', {
      academy_id: record.academy_id,
      student_id: record.student_id,
      class_id: record.class_id,
      enrollment_id: record.enrollment_id,
      date: record.date,
      status: record.status,
      note: record.note,
    });

    await record.save();
    console.log('✅ 출석 기록 저장 성공');
    res.status(201).json({ record });
  } catch (error) {
    console.error('❌ 출석 기록 저장 실패:', error);
    console.error('에러 상세:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    next(error);
  }
};

// DELETE /api/attendance/:id
export const deleteAttendance = async (req, res, next) => {
  try {
    console.log('\n🎯 deleteAttendance 컨트롤러 호출됨!');
    console.log('   req.method:', req.method);
    console.log('   req.originalUrl:', req.originalUrl);
    console.log('   req.path:', req.path);
    console.log('   req.params:', req.params);
    
    const { id } = req.params;
    
    console.log('   요청된 ID:', id);

    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    const record = await AttendanceRecord.findById(id);
    
    console.log('찾은 기록:', record);
    
    if (!record) {
      console.log('기록을 찾을 수 없음');
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    await record.delete();
    console.log('기록 삭제 완료');
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('출석 기록 삭제 중 오류:', error);
    next(error);
  }
};


