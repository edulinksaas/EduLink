import { studentService } from '../services/studentService';
import { classService } from '../services/classService';

/**
 * 수업에 학생이 없으면 자동으로 수업을 삭제하는 함수
 * @param {string} classId - 확인할 수업 ID
 * @param {string} academyId - 학원 ID
 * @returns {Promise<boolean>} - 수업이 삭제되었으면 true, 아니면 false
 */
export const checkAndDeleteEmptyClass = async (classId, academyId) => {
  if (!classId || !academyId) {
    return false;
  }

  try {
    // 해당 수업에 등록된 학생 수 확인
    const response = await studentService.getAll(academyId);
    const allStudents = response.data?.students || response.data || [];
    const studentsInClass = allStudents.filter(s => s.class_id === classId);

    // 학생이 없으면 수업 삭제
    if (studentsInClass.length === 0) {
      console.log(`📚 수업에 학생이 없어 자동 삭제: ${classId}`);
      try {
        await classService.delete(classId);
        console.log(`✅ 빈 수업 자동 삭제 완료: ${classId}`);
        return true;
      } catch (deleteError) {
        console.error('❌ 빈 수업 삭제 실패:', deleteError);
        // 삭제 실패해도 에러를 던지지 않음 (학생 삭제/수정은 성공한 것으로 처리)
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ 빈 수업 확인 실패:', error);
    // 확인 실패해도 에러를 던지지 않음
    return false;
  }
};

