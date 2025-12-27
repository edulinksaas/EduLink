import { Parent } from '../models/Parent.js';
import { ParentStudent } from '../models/ParentStudent.js';
import { Student } from '../models/Student.js';

// 학부모별 자녀 목록 조회
export const getChildrenByParentId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'parent_id is required' });
    }

    // 학부모 확인
    const parent = await Parent.findById(id);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // 관계 조회
    const relations = await ParentStudent.findByParentId(id);

    // 학생 정보 조회
    const children = await Promise.all(
      relations.map(async (relation) => {
        const student = await Student.findById(relation.student_id);
        return {
          ...student,
          relationship: relation.relationship,
          is_primary: relation.is_primary,
        };
      })
    );

    res.json({ children, total: children.length });
  } catch (error) {
    next(error);
  }
};

// 학부모 정보 조회
export const getParentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parent = await Parent.findById(id);

    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    res.json({ parent });
  } catch (error) {
    next(error);
  }
};

// 전화번호로 학부모 조회
export const getParentByPhone = async (req, res, next) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'phone is required' });
    }

    const parent = await Parent.findByPhone(phone);

    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    res.json({ parent });
  } catch (error) {
    next(error);
  }
};

// 전화번호로 parentsapp에 가입된 학부모인지 확인
export const checkParentAppRegistration = async (req, res, next) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'phone is required' });
    }

    // 하이픈 제거하여 숫자만 추출
    const phoneNumber = phone.replace(/[^0-9]/g, '');

    // parents 테이블에서 조회
    const parent = await Parent.findByPhone(phoneNumber);

    if (parent) {
      // parentsapp에 가입된 학부모임
      res.json({ 
        registered: true, 
        parent: {
          id: parent.id,
          name: parent.name,
          phone: parent.phone,
          email: parent.email
        }
      });
    } else {
      // parentsapp에 가입되지 않은 학부모
      res.json({ 
        registered: false,
        message: 'parentsapp에 가입되지 않은 학부모입니다.'
      });
    }
  } catch (error) {
    console.error('학부모 조회 실패:', error);
    next(error);
  }
};

// 학부모 생성
export const createParent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      institution_name,
      institution_type,
      institution_address,
      institution_phone,
    } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'phone is required' });
    }

    // 이미 존재하는지 확인
    const existingParent = await Parent.findByPhone(phone);
    if (existingParent) {
      return res.status(400).json({ error: 'Parent with this phone already exists' });
    }

    const parent = new Parent({
      name: name || '',
      email: email || '',
      phone: phone.trim(),
      address: address || '',
      institution_name: institution_name || '',
      institution_type: institution_type || '',
      institution_address: institution_address || '',
      institution_phone: institution_phone || '',
    });

    await parent.save();
    res.status(201).json({ parent });
  } catch (error) {
    next(error);
  }
};

// 학부모-학생 관계 생성
export const createParentStudentRelation = async (req, res, next) => {
  try {
    const { parentId, studentId } = req.params;
    const { relationship, is_primary } = req.body;

    // 학부모 확인
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // 학생 확인
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // 이미 관계가 있는지 확인
    const existingRelation = await ParentStudent.findByParentAndStudent(parentId, studentId);
    if (existingRelation) {
      return res.status(400).json({ error: 'Relation already exists' });
    }

    // 관계 생성
    const relation = new ParentStudent({
      parent_id: parentId,
      student_id: studentId,
      relationship: relationship || 'parent',
      is_primary: is_primary !== undefined ? is_primary : true,
    });

    await relation.save();
    res.status(201).json({ relation });
  } catch (error) {
    next(error);
  }
};

// 학부모-학생 관계 삭제
export const deleteParentStudentRelation = async (req, res, next) => {
  try {
    const { parentId, studentId } = req.params;

    const relation = await ParentStudent.findByParentAndStudent(parentId, studentId);
    if (!relation) {
      return res.status(404).json({ error: 'Relation not found' });
    }

    await relation.delete();
    res.json({ message: 'Relation deleted successfully' });
  } catch (error) {
    next(error);
  }
};


