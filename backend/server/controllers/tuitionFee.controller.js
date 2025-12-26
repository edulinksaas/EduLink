import crypto from 'crypto';
import { TuitionFee } from '../models/TuitionFee.js';

export const getTuitionFees = async (req, res, next) => {
  try {
    const { academy_id } = req.query;
    
    if (!academy_id) {
      return res.status(400).json({ error: 'academy_id is required' });
    }
    
    const fees = await TuitionFee.findAll(academy_id);
    res.json({ fees, total: fees.length });
  } catch (error) {
    next(error);
  }
};

export const createTuitionFee = async (req, res, next) => {
  try {
    const { academy_id, amount, value, class_type, payment_method } = req.body;
    
    if (!academy_id || !amount || value === undefined) {
      return res.status(400).json({ error: 'academy_id, amount, and value are required' });
    }
    
    if (!class_type || !payment_method) {
      return res.status(400).json({ error: 'class_type and payment_method are required' });
    }
    
    const generatedId = crypto.randomUUID();
    console.log('생성할 수강료 ID:', generatedId);
    
    const fee = new TuitionFee({
      id: generatedId,
      academy_id,
      amount: amount.toString(),
      value: parseInt(value),
      class_type,
      payment_method,
    });
    
    await fee.save();
    
    console.log('저장된 수강료 ID:', fee.id);
    console.log('저장된 수강료 데이터:', {
      id: fee.id,
      academy_id: fee.academy_id,
      amount: fee.amount,
      value: fee.value,
      class_type: fee.class_type,
      payment_method: fee.payment_method
    });
    
    res.json({ 
      fee: {
        id: fee.id,
        academy_id: fee.academy_id,
        amount: fee.amount,
        value: fee.value,
        class_type: fee.class_type,
        payment_method: fee.payment_method
      },
      message: '수강료가 추가되었습니다.' 
    });
  } catch (error) {
    console.error('수강료 생성 실패:', error);
    next(error);
  }
};

export const updateTuitionFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, value, class_type, payment_method } = req.body;
    
    console.log('수강료 수정 요청 - ID:', id);
    console.log('수정할 데이터:', { amount, value, class_type, payment_method });
    
    if (!id) {
      return res.status(400).json({ error: 'Tuition fee ID is required' });
    }
    
    const fee = await TuitionFee.findById(id);
    
    if (!fee) {
      console.error('수강료를 찾을 수 없음:', id);
      return res.status(404).json({ error: 'Tuition fee not found' });
    }
    
    // 수정할 필드 업데이트
    if (amount !== undefined) fee.amount = amount.toString();
    if (value !== undefined) fee.value = parseInt(value);
    if (class_type !== undefined) fee.class_type = class_type;
    if (payment_method !== undefined) fee.payment_method = payment_method;
    
    await fee.save();
    
    console.log('수강료 수정 성공:', fee.id);
    res.json({ 
      fee: {
        id: fee.id,
        academy_id: fee.academy_id,
        amount: fee.amount,
        value: fee.value,
        class_type: fee.class_type,
        payment_method: fee.payment_method
      },
      message: '수강료가 수정되었습니다.' 
    });
  } catch (error) {
    console.error('수강료 수정 실패:', error);
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    next(error);
  }
};

export const deleteTuitionFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('수강료 삭제 요청 - ID:', id);
    
    if (!id) {
      return res.status(400).json({ error: 'Tuition fee ID is required' });
    }
    
    const fee = await TuitionFee.findById(id);
    
    if (!fee) {
      console.error('수강료를 찾을 수 없음:', id);
      // 해당 학원의 모든 수강료 조회해서 디버깅 정보 제공
      try {
        const { academy_id } = req.query;
        if (academy_id) {
          const allFees = await TuitionFee.findAll(academy_id);
          console.log('해당 학원의 모든 수강료:', allFees.map(f => ({ id: f.id, amount: f.amount })));
        }
      } catch (debugError) {
        console.error('디버깅 정보 조회 실패:', debugError);
      }
      return res.status(404).json({ error: 'Tuition fee not found' });
    }
    
    console.log('삭제할 수강료 찾음:', {
      id: fee.id,
      academy_id: fee.academy_id,
      amount: fee.amount
    });
    
    const result = await fee.delete();
    
    if (!result) {
      console.error('삭제 실패: delete() 메서드가 false 반환');
      return res.status(500).json({ error: 'Failed to delete tuition fee' });
    }
    
    console.log('수강료 삭제 성공:', fee.id);
    res.json({ 
      message: '수강료가 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('수강료 삭제 실패:', error);
    console.error('에러 메시지:', error.message);
    console.error('에러 스택:', error.stack);
    next(error);
  }
};

