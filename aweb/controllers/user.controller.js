export const getUsers = async (req, res, next) => {
  try {
    // TODO: 실제 사용자 목록 조회 로직 구현
    res.json({
      users: [],
      total: 0
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // User 모델 import
    const { User } = await import('../models/User.js');
    
    // 사용자 조회
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        academy_code: user.academy_code,
        academy_id: user.academy_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('사용자 조회 실패:', error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // User 모델 import
    const { User } = await import('../models/User.js');
    
    // 사용자 조회
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    // 업데이트할 필드만 설정 (name, email, phone)
    if (updateData.name !== undefined) {
      user.name = updateData.name;
    }
    if (updateData.email !== undefined) {
      // 이메일은 null이거나 빈 문자열일 수 있음
      user.email = updateData.email === null || updateData.email === '' ? null : updateData.email.trim();
    }
    if (updateData.phone !== undefined) {
      // 전화번호는 null이거나 빈 문자열일 수 있음
      user.phone = updateData.phone === null || updateData.phone === '' ? null : updateData.phone.trim();
    }
    
    // DB에 저장 (Supabase users 테이블에 직접 업데이트)
    await user.save();
    
    console.log('✅ 사용자 정보 업데이트 완료:', {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    });
    
    // 업데이트된 사용자 정보 반환
    res.json({
      message: '사용자 정보가 업데이트되었습니다.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        academy_code: user.academy_code,
        academy_id: user.academy_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('사용자 업데이트 실패:', error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // TODO: 실제 사용자 삭제 로직 구현
    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

