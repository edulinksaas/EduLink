import { useState, useEffect } from 'react';
import './Form.css';

const Form = ({ fields, onSubmit, onCancel, submitLabel = '저장', initialData = {}, onChange }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    // initialData가 변경되면 폼 데이터 업데이트
    // 하지만 사용자가 입력한 값은 유지 (초기화 방지)
    const updatedData = { ...initialData };
    // 기존 formData의 값 중 initialData에 없는 것은 유지
    Object.keys(formData).forEach(key => {
      if (!(key in updatedData) && formData[key]) {
        updatedData[key] = formData[key];
      }
    });
    setFormData(updatedData);
  }, [initialData]);

  const handleChange = (name, value) => {
    // 이전 상태를 기반으로 업데이트하여 동기화 문제 해결
    setFormData(prevData => {
      const newData = { ...prevData, [name]: value };
      // onChange 콜백 호출 (newData를 수정할 수 있도록 참조 전달)
      if (onChange) {
        onChange(name, value, newData);
        // onChange에서 newData를 수정했을 수 있으므로 수정된 newData 반환
        return newData;
      }
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      {fields.map((field) => (
        <div key={field.name} className="form-group">
          <label 
            htmlFor={field.type === 'custom' ? undefined : field.name} 
            className="form-label"
          >
            {field.label}
            {field.required && <span className="required">*</span>}
            {field.maxLength && (
              <span className={`form-char-count ${((formData[field.name] || '').length / field.maxLength) > 0.9 ? 'text-warning' : ''}`}>
                ({(formData[field.name] || '').length} / {field.maxLength})
              </span>
            )}
          </label>
          {field.type === 'custom' && field.render ? (
            field.render({
              value: formData[field.name],
              formData,
              onChange: (val) => handleChange(field.name, val),
              setField: (name, val) => handleChange(name, val),
              setMultipleFields: (fieldsObj) => {
                // 여러 필드를 한 번에 업데이트
                setFormData(prevData => {
                  const newData = { ...prevData, ...fieldsObj };
                  // onChange 콜백 호출 (첫 번째 필드 기준)
                  if (onChange) {
                    const firstField = Object.keys(fieldsObj)[0];
                    onChange(firstField, fieldsObj[firstField], newData);
                  }
                  return newData;
                });
              },
            })
          ) : field.type === 'textarea' ? (
            <textarea
              id={field.name}
              name={field.name}
              className="form-control"
              required={field.required}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              rows={field.rows || 3}
            />
          ) : field.type === 'select' ? (
            <select
              id={field.name}
              name={field.name}
              className="form-control"
              required={field.required}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              <option value="">선택하세요</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || 'text'}
              id={field.name}
              name={field.name}
              className="form-control"
              required={field.required}
              readOnly={field.readOnly}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
            />
          )}
        </div>
      ))}
      <div className="form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            취소
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default Form;

