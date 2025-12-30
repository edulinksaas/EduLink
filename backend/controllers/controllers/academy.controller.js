import crypto from 'crypto';
import { Academy } from '../models/Academy.js';

export const getAcademies = async (req, res, next) => {
  try {
    console.log('학원 목록 조회 요청 받음');
    const academies = await Academy.findAll();
    console.log('조회된 학원 수:', academies.length);
    res.json({ academies, total: academies.length });
  } catch (error) {
    console.error('학원 목록 조회 컨트롤러 에러:', error);
    next(error);
  }
};

export const getAcademyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const academy = await Academy.findById(id);
    
    if (!academy) {
      return res.status(404).json({ error: 'Academy not found' });
    }
    
    res.json({ academy });
  } catch (error) {
    next(error);
  }
};

export const createAcademy = async (req, res, next) => {
  try {
    const { name, logo_url, address, floor, code } = req.body;
    
    console.log('생성 요청 데이터:', { name, logo_url: logo_url ? '있음' : '없음', address, floor, code });
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // 빈 문자열을 null로 변환
    const academyData = {
      id: crypto.randomUUID(),
      name: name.trim(),
      logo_url: logo_url && logo_url.trim() ? logo_url : null,
      address: address && address.trim() ? address : null,
      floor: floor && floor.trim() ? floor : null,
      code: code && code.trim() ? code : null
    };
    
    console.log('생성할 학원 데이터:', academyData);
    
    const academy = new Academy(academyData);
    
    console.log('학원 객체 생성 완료, save() 호출 전...');
    await academy.save();
    console.log('학원 저장 완료! 응답할 데이터:', {
      id: academy.id,
      name: academy.name,
      code: academy.code
    });
    
    res.status(201).json({ academy });
  } catch (error) {
    console.error('학원 생성 에러:', error);
    console.error('에러 타입:', typeof error);
    console.error('에러 스택:', error.stack);
    console.error('에러 전체 객체:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    const errorMessage = error.message || error.details || error.hint || 'Failed to create academy';
    return res.status(400).json({ error: errorMessage });
  }
};

export const updateAcademy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, logo_url, address, floor, code } = req.body;
    
    console.log('업데이트 요청 데이터:', { id, name, logo_url: logo_url ? '있음' : '없음', address, floor, code });
    
    const academy = await Academy.findById(id);
    
    if (!academy) {
      return res.status(404).json({ error: 'Academy not found' });
    }
    
    // 업데이트할 데이터 준비
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (logo_url !== undefined) updateData.logo_url = logo_url || null;
    if (address !== undefined) updateData.address = address || null;
    if (floor !== undefined) updateData.floor = floor || null;
    if (code !== undefined) updateData.code = code || null;
    
    // 빈 문자열을 null로 변환
    Object.keys(updateData).forEach(key => {
      if (key !== 'name' && updateData[key] === '') {
        updateData[key] = null;
      }
    });
    
    console.log('업데이트할 데이터:', updateData);
    
    await academy.update(updateData);
    // update() 메서드가 this를 반환하므로 academy 객체가 이미 업데이트됨
    res.json({ academy });
  } catch (error) {
    console.error('학원 수정 에러:', error);
    console.error('에러 타입:', typeof error);
    console.error('에러 스택:', error.stack);
    console.error('에러 전체 객체:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    const errorMessage = error.message || error.details || error.hint || 'Failed to update academy';
    return res.status(400).json({ error: errorMessage });
  }
};

export const deleteAcademy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const academy = await Academy.findById(id);
    
    if (!academy) {
      return res.status(404).json({ error: 'Academy not found' });
    }
    
    await academy.delete();
    res.json({ message: 'Academy deleted successfully' });
  } catch (error) {
    next(error);
  }
};

