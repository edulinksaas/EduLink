import { body, param, query, validationResult } from 'express-validator';

/**
 * 검증 결과 처리 미들웨어
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '입력값 검증 실패',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * 인증 관련 검증 규칙
 */
export const validateLogin = [
  body('academy_code')
    .trim()
    .notEmpty().withMessage('학원 코드는 필수입니다.')
    .isLength({ min: 2, max: 50 }).withMessage('학원 코드는 2-50자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('학원 코드는 영문, 숫자, _, - 만 사용 가능합니다.'),
  body('password')
    .notEmpty().withMessage('비밀번호는 필수입니다.')
    .isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다.'),
  handleValidationErrors
];

export const validateRegister = [
  body('academy_code')
    .trim()
    .notEmpty().withMessage('학원 코드는 필수입니다.')
    .isLength({ min: 2, max: 50 }).withMessage('학원 코드는 2-50자 사이여야 합니다.')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('학원 코드는 영문, 숫자, _, - 만 사용 가능합니다.'),
  body('password')
    .notEmpty().withMessage('비밀번호는 필수입니다.')
    .isLength({ min: 8 }).withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/).withMessage('비밀번호는 영문자와 숫자를 포함해야 합니다.'),
  body('academy_name')
    .trim()
    .notEmpty().withMessage('학원명은 필수입니다.')
    .isLength({ min: 1, max: 100 }).withMessage('학원명은 1-100자 사이여야 합니다.'),
  body('email')
    .trim()
    .notEmpty().withMessage('이메일은 필수입니다.')
    .isEmail().withMessage('유효한 이메일 주소를 입력해주세요.')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('연락처는 필수입니다.')
    .isLength({ min: 10, max: 20 }).withMessage('연락처는 10-20자 사이여야 합니다.'),
  handleValidationErrors
];

export const validateChangePassword = [
  body('current_password')
    .notEmpty().withMessage('현재 비밀번호는 필수입니다.'),
  body('new_password')
    .notEmpty().withMessage('새 비밀번호는 필수입니다.')
    .isLength({ min: 8 }).withMessage('새 비밀번호는 최소 8자 이상이어야 합니다.')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/).withMessage('새 비밀번호는 영문자와 숫자를 포함해야 합니다.'),
  handleValidationErrors
];

/**
 * ID 파라미터 검증
 */
export const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID는 양의 정수여야 합니다.')
    .toInt(),
  handleValidationErrors
];

/**
 * 페이지네이션 검증
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('페이지는 1 이상이어야 합니다.')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit은 1-100 사이여야 합니다.')
    .toInt(),
  handleValidationErrors
];

