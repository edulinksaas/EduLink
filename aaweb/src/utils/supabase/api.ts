// 환경 변수 타입 안전성 확보
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// 토큰 관리 함수
const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const setToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('academyId');
};

// Academy ID 관리 함수
export const getAcademyId = (): string | null => {
  return localStorage.getItem('academyId');
};

const setAcademyId = (academyId: string): void => {
  localStorage.setItem('academyId', academyId);
};

// API 에러 클래스
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 공통 헤더 생성 함수
const getHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// 응답 처리 함수
const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    // 응답 body 읽기
    let body: any = null;
    try {
      body = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);
    } catch (e) {
      console.error('응답 body 읽기 실패:', e);
      body = null;
    }
    
    // body를 문자열로 변환
    const stringBody = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
    
    // 에러 정보를 콘솔에 출력
    console.error('[API ERROR]', {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      body: body
    });
    
    // body의 상세 에러 정보 추출 및 출력
    const errorDetails: any = {};
    if (body && typeof body === 'object') {
      if (body.error) {
        errorDetails.message = body.error.message || body.error;
        errorDetails.details = body.error.details;
        errorDetails.hint = body.error.hint;
        errorDetails.stack = body.error.stack;
      } else {
        errorDetails.message = body.message;
        errorDetails.details = body.details;
        errorDetails.hint = body.hint;
        errorDetails.stack = body.stack;
      }
    }
    
    // 상세 에러 정보가 있으면 별도로 출력
    if (Object.keys(errorDetails).length > 0) {
      console.error('[API ERROR DETAILS]', JSON.stringify(errorDetails, null, 2));
    }
    
    // 문자열로 변환한 body 출력
    console.error('[API ERROR STRING]', stringBody);
    
    // ApiError 생성 시 message에 stringify한 body 포함
    const errorMessage = `HTTP ${response.status} ${response.url} :: ${stringBody}`;
    
    throw new ApiError(
      response.status,
      errorMessage,
      body
    );
  }

  // 204 No Content 등의 경우 빈 객체 반환
  if (response.status === 204) {
    return {} as T;
  }

  return isJson ? await response.json() : await response.text() as T;
};

export const apiClient = {
  get: async <T = any>(endpoint: string, includeAuth: boolean = true): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(includeAuth),
      });
      return handleResponse<T>(response);
    } catch (error: any) {
      // 네트워크 오류 처리 (Failed to fetch, ERR_INSUFFICIENT_RESOURCES 등)
      if (error instanceof TypeError || 
          error?.message === 'Failed to fetch' || 
          error?.message?.includes('fetch') ||
          error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
          error?.name === 'TypeError') {
        throw new ApiError(0, '네트워크 오류: 백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
      }
      throw error;
    }
  },

  post: async <T = any>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleResponse<T>(response);
    } catch (error: any) {
      // 네트워크 오류 처리 (Failed to fetch, ERR_INSUFFICIENT_RESOURCES 등)
      if (error instanceof TypeError || 
          error?.message === 'Failed to fetch' || 
          error?.message?.includes('fetch') ||
          error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
          error?.name === 'TypeError') {
        throw new ApiError(0, '네트워크 오류: 백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
      }
      throw error;
    }
  },

  put: async <T = any>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleResponse<T>(response);
    } catch (error: any) {
      // 네트워크 오류 처리 (Failed to fetch, ERR_INSUFFICIENT_RESOURCES 등)
      if (error instanceof TypeError || 
          error?.message === 'Failed to fetch' || 
          error?.message?.includes('fetch') ||
          error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
          error?.name === 'TypeError') {
        throw new ApiError(0, '네트워크 오류: 백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
      }
      throw error;
    }
  },

  delete: async <T = any>(endpoint: string, includeAuth: boolean = true): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(includeAuth),
      });
      return handleResponse<T>(response);
    } catch (error: any) {
      // 네트워크 오류 처리 (Failed to fetch, ERR_INSUFFICIENT_RESOURCES 등)
      if (error instanceof TypeError || 
          error?.message === 'Failed to fetch' || 
          error?.message?.includes('fetch') ||
          error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
          error?.name === 'TypeError') {
        throw new ApiError(0, '네트워크 오류: 백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
      }
      throw error;
    }
  },

  patch: async <T = any>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(includeAuth),
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleResponse<T>(response);
    } catch (error: any) {
      // 네트워크 오류 처리 (Failed to fetch, ERR_INSUFFICIENT_RESOURCES 등)
      if (error instanceof TypeError || 
          error?.message === 'Failed to fetch' || 
          error?.message?.includes('fetch') ||
          error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
          error?.name === 'TypeError') {
        throw new ApiError(0, '네트워크 오류: 백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
      }
      throw error;
    }
  },
};

// 인증 관련 API
export const authApi = {
  login: async (schoolCode: string, password: string) => {
    const response = await apiClient.post<{ token: string; user: any }>(
      '/auth/login',
      { academy_code: schoolCode, password },
      false
    );
    if (response.token) {
      setToken(response.token);
    }
    if (response.user?.academy_id) {
      setAcademyId(response.user.academy_id);
    }
    return response;
  },

  register: async (data: {
    password: string;
    academy_name: string;
    name: string;
    email: string;
    phone: string;
    recaptchaToken?: string;
  }) => {
    return apiClient.post('/auth/register', data, false);
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout', {}, true);
    } finally {
      removeToken();
    }
  },
  
  getAcademyId: (): string | null => {
    return getAcademyId();
  },
};

// 학생 관련 API
export const studentApi = {
  getAll: async () => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    const response = await apiClient.get<{ students?: any[]; total?: number }>(`/students?academy_id=${academyId}`);
    // 백엔드가 { students, total } 형태로 반환하는 경우 처리
    return Array.isArray(response) ? response : (response.students || []);
  },
  getById: (id: number) => apiClient.get<any>(`/students/${id}`),
  create: (data: any) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.post('/students', { ...data, academy_id: academyId });
  },
  update: (id: number, data: any) => apiClient.put(`/students/${id}`, data),
  delete: (id: number) => apiClient.delete(`/students/${id}`),
};

// 선생님 관련 API
export const teacherApi = {
  getAll: async () => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    try {
      const response = await apiClient.get<{ teachers?: any[]; total?: number }>(`/teachers?academy_id=${academyId}`);
      // 백엔드가 { teachers, total } 형태로 반환하는 경우 처리
      return Array.isArray(response) ? response : (response.teachers || []);
    } catch (error) {
      console.error('선생님 목록 API 호출 실패:', error);
      // 네트워크 오류인 경우 빈 배열 반환
      if (error instanceof ApiError && error.status === 0) {
        console.warn('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
        return [];
      }
      throw error;
    }
  },
  getById: (id: number) => apiClient.get<any>(`/teachers/${id}`),
  create: (data: any) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.post('/teachers', { ...data, academy_id: academyId });
  },
  update: (id: number, data: any) => apiClient.put(`/teachers/${id}`, data),
  delete: (id: number) => apiClient.delete(`/teachers/${id}`),
};

// 수업 관련 API
export const classApi = {
  getAll: () => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.get<any[]>(`/classes?academy_id=${academyId}`);
  },
  getById: (id: number) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.get<any>(`/classes/${id}?academy_id=${academyId}`);
  },
  create: (data: any) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.post('/classes', { ...data, academy_id: academyId });
  },
  update: (id: number, data: any) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.put(`/classes/${id}`, { ...data, academy_id: academyId });
  },
  delete: (id: number) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.delete(`/classes/${id}?academy_id=${academyId}`);
  },
};

// 출석 관련 API
export const attendanceApi = {
  getAll: () => apiClient.get<any[]>('/attendance'),
  getById: (id: number) => apiClient.get<any>(`/attendance/${id}`),
  create: (data: any) => apiClient.post('/attendance', data),
  update: (id: number, data: any) => apiClient.put(`/attendance/${id}`, data),
};

// 결제 관련 API
export const paymentApi = {
  getDailyRevenue: (date?: string) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    const dateParam = date ? `&date=${date}` : '';
    return apiClient.get<{ revenue: number; revenueFromPayments: number; revenueFromStudents: number; date: string }>(`/payments/daily-revenue?academy_id=${academyId}${dateParam}`);
  },
  getByStudent: (studentId: number) => {
    return apiClient.get<{ payments: any[]; total: number }>(`/payments?student_id=${studentId}`);
  },
  create: (data: any) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.post('/payments', { ...data, academy_id: academyId });
  },
};

// 과목 관련 API
export const subjectApi = {
  getAll: async () => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    try {
      const response = await apiClient.get<{ subjects?: any[]; total?: number }>(`/subjects?academy_id=${academyId}`);
      return response;
    } catch (error) {
      console.error('과목 목록 API 호출 실패:', error);
      // 네트워크 오류인 경우 빈 객체 반환
      if (error instanceof ApiError && error.status === 0) {
        console.warn('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
        return { subjects: [], total: 0 };
      }
      throw error;
    }
  },
  getById: (id: number) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.get<any>(`/subjects/${id}?academy_id=${academyId}`);
  },
  create: (data: any) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.post('/subjects', { ...data, academy_id: academyId });
  },
  update: (id: number, data: any) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.put(`/subjects/${id}`, { ...data, academy_id: academyId });
  },
  delete: (id: number) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.delete(`/subjects/${id}?academy_id=${academyId}`);
  },
};

// 학원 관련 API
export const academyApi = {
  getAll: () => {
    return apiClient.get<{ academies?: any[] }>('/academies');
  },
  getById: (id: string) => {
    return apiClient.get<any>(`/academies/${id}`);
  },
  create: (data: any) => {
    return apiClient.post('/academies', data);
  },
  update: (id: string, data: any) => {
    return apiClient.put(`/academies/${id}`, data);
  },
  delete: (id: string) => {
    return apiClient.delete(`/academies/${id}`);
  },
};

// 강의실 관련 API
export const classroomApi = {
  getAll: () => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.get<{ classrooms?: any[] }>(`/classrooms?academy_id=${academyId}`);
  },
  getById: (id: string) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.get<any>(`/classrooms/${id}?academy_id=${academyId}`);
  },
  create: (data: any) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.post('/classrooms', { ...data, academy_id: academyId });
  },
  update: (id: string, data: any) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.put(`/classrooms/${id}`, { ...data, academy_id: academyId });
  },
  delete: (id: string) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.delete(`/classrooms/${id}?academy_id=${academyId}`);
  },
};

// 시간표 설정 관련 API
export const timetableSettingsApi = {
  get: () => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.get<{ settings?: any }>(`/timetable-settings?academy_id=${academyId}`);
  },
  save: (data: any) => {
    const academyId = getAcademyId();
    if (!academyId) {
      throw new ApiError(400, 'academy_id is required. Please login again.');
    }
    return apiClient.post('/timetable-settings', { ...data, academy_id: academyId });
  },
};