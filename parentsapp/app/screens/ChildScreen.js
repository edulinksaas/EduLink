import { Text, View, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { fetchStudentSchedule, fetchStudentAttendance, transformEnrollmentToAcademyFormat } from '../lib/saasIntegration';
import { fetchStudentDetail, updateStudent } from '../lib/supabaseStudents';
import { createParentAcademy, fetchAcademyById, fetchStudentUnAcademies, linkStudentToAcademy } from '../lib/supabaseParentAcademies';
import { styles } from './ChildScreen.styles';

export default function ChildScreen({ route, navigation }) {
  const { childrenList, refreshChildrenList, personalInfo } = useApp();
  
  // route.params에서 자녀 정보를 가져옴
  const { childName, childId, status } = route.params || {
    childName: '세완',
    status: '연동됨',
  };

  // Context에서 해당 자녀 정보 찾기
  const childData = childrenList.find(child => 
    (childId && child.id === childId) || child.name === childName
  ) || childrenList[0];

  const [loading, setLoading] = useState(false);
  const [studentDetail, setStudentDetail] = useState(null);
  const [studentSchedule, setStudentSchedule] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [registeredAcademies, setRegisteredAcademies] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    birthDate: '',
    grade: '',
    phone: '',
    note: '',
  });
  const [isEditSchoolModalVisible, setIsEditSchoolModalVisible] = useState(false);
  const [editSchoolFormData, setEditSchoolFormData] = useState({
    schoolName: '',
    schoolGrade: '',
    schoolClass: '',
    schoolAddress: '',
    schoolPhone: '',
  });
  const [isAddAcademyModalVisible, setIsAddAcademyModalVisible] = useState(false);
  const [academyFormData, setAcademyFormData] = useState({
    name: '',
    type: '',
    address: '',
    phone: '',
    floor: '',
  });

  // 자녀 정보 (Supabase에서 가져온 데이터 우선 사용)
  const childInfo = studentDetail ? {
    name: studentDetail.name || '-',
    birthDate: studentDetail.birth_date 
      ? new Date(studentDetail.birth_date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')
      : (childData?.birthDate || '-'),
    grade: studentDetail.grade || childData?.grade || '-',
    phone: studentDetail.phone || childData?.phone || '-',
    note: studentDetail.note || '',
  } : childData ? {
    name: childData.name || '-',
    birthDate: childData.birthDate || '-',
    grade: childData.grade || '-',
    phone: childData.phone || '-',
    note: childData.note || '',
  } : {
    name: '-',
    birthDate: '-',
    grade: '-',
    phone: '-',
    note: '',
  };

  // 학교 정보 (Supabase에서 가져온 데이터 사용, 없으면 빈 값)
  const schoolInfo = studentDetail ? {
    name: studentDetail.school_name || '-',
    grade: studentDetail.grade || studentDetail.school_grade || '-', // grade 필드 통일
    class: studentDetail.school_class || '-',
    address: studentDetail.school_address || '-',
    phone: studentDetail.school_phone || '-',
  } : (childData.school || {
    name: '-',
    grade: '-',
    class: '-',
    address: '-',
    phone: '-',
  });

  // 학원 정보 (Supabase에서 가져온 수업 일정을 학원 형식으로 변환 + 등록된 학원 정보 추가)
  const scheduleAcademies = useMemo(() => {
    return studentSchedule.length > 0 
      ? studentSchedule.map(enrollment => transformEnrollmentToAcademyFormat(enrollment)).filter(Boolean)
      : [];
  }, [studentSchedule]);

  // 등록된 학원 정보 추가 (un_academies 테이블에서 가져온 학원 - 학부모 앱에서 등록한 학원)
  // 중요: academies = 웹 프로그램에서 등록한 학원, un_academies = 학부모 앱에서 등록한 학원
  const registeredAcademyItems = useMemo(() => {
    if (!registeredAcademies || registeredAcademies.length === 0) return [];
    return registeredAcademies.map(academy => ({
      id: academy.id,
      name: academy.name,
      subject: academy.type || '등록된 학원',
      logo: '🏫',
      address: academy.address || '',
      phone: academy.phone || '',
      teacher: '',
      level: '',
      schedule: '',
    }));
  }, [registeredAcademies]);

  // 학원 목록 합치기 (등록된 학원을 맨 앞에 추가)
  const academyList = useMemo(() => {
    if (registeredAcademyItems.length > 0) {
      return [...registeredAcademyItems, ...scheduleAcademies];
    }
    if (scheduleAcademies.length > 0) {
      return scheduleAcademies;
    }
    return childData?.academies || [];
  }, [registeredAcademyItems, scheduleAcademies, childData?.academies]);

  const [currentAcademyIndex, setCurrentAcademyIndex] = useState(0);
  const flatListRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;
  const academyCardWidth = screenWidth - 80 - 32; // 화면 너비 - 화살표 버튼(40*2) - 좌우 패딩(16*2)

  // Supabase에서 자녀 정보 로드
  useEffect(() => {
    const loadChildData = async () => {
      if (!childData || !childData.id) return;

      setLoading(true);
      try {
        // 자녀 상세 정보 가져오기
        const detail = await fetchStudentDetail(childData.id);
        if (detail) {
          setStudentDetail(detail);
        }
        
        // 등록된 학원 정보 가져오기 (student_un_academies 테이블을 통해)
        // un_academies 테이블: 학부모 앱에서 등록한 학원만 저장
        const academies = await fetchStudentUnAcademies(childData.id);
        if (academies && academies.length > 0) {
          setRegisteredAcademies(academies);
        } else {
          setRegisteredAcademies([]);
        }

        // 수업 일정 가져오기
        const schedule = await fetchStudentSchedule(childData.id);
        if (schedule && schedule.length > 0) {
          setStudentSchedule(schedule);
        }

        // 출석 정보 가져오기 (최근 30일)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const attendanceData = await fetchStudentAttendance(childData.id, startDate, endDate);
        if (attendanceData && attendanceData.length > 0) {
          setAttendance(attendanceData);
        }
      } catch (error) {
        console.error('자녀 정보 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChildData();
  }, [childData?.id]);

  // 학원 목록이 변경될 때 인덱스 리셋
  useEffect(() => {
    if (academyList.length > 0) {
      setCurrentAcademyIndex(0);
    }
  }, [academyList.length]);

  const handlePreviousAcademy = () => {
    if (currentAcademyIndex > 0 && academyList.length > 0) {
      setCurrentAcademyIndex(currentAcademyIndex - 1);
    }
  };

  const handleNextAcademy = () => {
    if (currentAcademyIndex < academyList.length - 1 && academyList.length > 0) {
      setCurrentAcademyIndex(currentAcademyIndex + 1);
    }
  };

  // YYYY-MM-DD 또는 YYYY.MM.DD 형식을 YYMMDD로 변환
  const formatDateToYYMMDD = (dateString) => {
    if (!dateString || dateString === '-') return '';
    
    // YYYY-MM-DD 또는 YYYY.MM.DD 형식 파싱
    const dateMatch = dateString.match(/(\d{4})[.-](\d{2})[.-](\d{2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1]);
      const month = dateMatch[2];
      const day = dateMatch[3];
      const yy = year % 100;
      return `${String(yy).padStart(2, '0')}${month}${day}`;
    }
    
    // 이미 YYMMDD 형식이면 그대로 반환
    if (dateString.match(/^\d{6}$/)) {
      return dateString;
    }
    
    return '';
  };

  // YYMMDD 형식을 YYYY-MM-DD로 변환
  const formatYYMMDDToDate = (yymmdd) => {
    if (!yymmdd || yymmdd.length !== 6) return null;
    
    const yy = parseInt(yymmdd.substring(0, 2));
    const mm = yymmdd.substring(2, 4);
    const dd = yymmdd.substring(4, 6);
    
    // YY가 00-23이면 2000년대, 24-99면 1900년대
    const yyyy = yy <= 23 ? 2000 + yy : 1900 + yy;
    
    // 유효한 날짜인지 확인
    const date = new Date(yyyy, parseInt(mm) - 1, parseInt(dd));
    if (date.getFullYear() === yyyy && date.getMonth() === parseInt(mm) - 1 && date.getDate() === parseInt(dd)) {
      return `${yyyy}-${mm}-${dd}`;
    }
    
    return null;
  };

  const handleEditChildInfo = () => {
    // 생년월일을 YYMMDD 형식으로 변환
    let birthDateFormatted = '';
    if (childInfo.birthDate && childInfo.birthDate !== '-') {
      birthDateFormatted = formatDateToYYMMDD(childInfo.birthDate);
    }

    setEditFormData({
      name: childInfo.name !== '-' ? childInfo.name : '',
      birthDate: birthDateFormatted,
      grade: childInfo.grade !== '-' ? childInfo.grade : '',
      phone: childInfo.phone !== '-' ? childInfo.phone : '',
      note: childInfo.note || '',
    });
    setIsEditModalVisible(true);
  };

  const handleSaveChildInfo = async () => {
    if (!childData || !childData.id) {
      Alert.alert('오류', '자녀 정보를 찾을 수 없습니다.');
      return;
    }

    if (!editFormData.name.trim()) {
      Alert.alert('알림', '자녀 이름을 입력해주세요.');
      return;
    }

    try {
      // 생년월일을 YYMMDD 형식에서 YYYY-MM-DD로 변환
      let birthDateValue = null;
      const birthDateInput = editFormData.birthDate.trim();
      if (birthDateInput) {
        // 숫자만 추출 (6자리)
        const digitsOnly = birthDateInput.replace(/\D/g, '');
        
        if (digitsOnly.length === 6) {
          birthDateValue = formatYYMMDDToDate(digitsOnly);
          if (!birthDateValue) {
            Alert.alert('알림', '올바른 생년월일을 입력해주세요. (예: 971120)');
            return;
          }
        } else if (digitsOnly.length > 0 && digitsOnly.length < 6) {
          Alert.alert('알림', '생년월일은 6자리 숫자로 입력해주세요. (예: 971120)');
          return;
        } else if (digitsOnly.length > 6) {
          Alert.alert('알림', '생년월일은 6자리 숫자로 입력해주세요.');
          return;
        }
      }

      const updatedStudent = await updateStudent(childData.id, {
        name: editFormData.name.trim(),
        birth_date: birthDateValue,
        grade: editFormData.grade.trim() || null,
        phone: editFormData.phone.trim() || null,
        note: editFormData.note.trim() || null,
        // school_grade도 grade와 동일하게 업데이트 (통일)
        school_grade: editFormData.grade.trim() || null,
      });

      if (updatedStudent) {
        Alert.alert('성공', '자녀 정보가 수정되었습니다.');
        setIsEditModalVisible(false);
        // 자녀 정보 다시 로드
        const detail = await fetchStudentDetail(childData.id);
        if (detail) {
          setStudentDetail(detail);
        }
        // AppContext의 자녀 목록도 새로고침
        if (refreshChildrenList) {
          await refreshChildrenList();
        }
      } else {
        Alert.alert('오류', '자녀 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('자녀 정보 수정 오류:', error);
      Alert.alert('오류', '자녀 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditFormData({
      name: '',
      birthDate: '',
      grade: '',
      phone: '',
      note: '',
    });
  };

  const handleEditSchoolInfo = () => {
    // 학교 학년은 자녀 정보의 grade와 동일하게 설정
    setEditSchoolFormData({
      schoolName: schoolInfo.name !== '-' ? schoolInfo.name : '',
      schoolGrade: childInfo.grade !== '-' ? childInfo.grade : (schoolInfo.grade !== '-' ? schoolInfo.grade : ''),
      schoolClass: schoolInfo.class !== '-' ? schoolInfo.class : '',
      schoolAddress: schoolInfo.address !== '-' ? schoolInfo.address : '',
      schoolPhone: schoolInfo.phone !== '-' ? schoolInfo.phone : '',
    });
    setIsEditSchoolModalVisible(true);
  };

  const handleSaveSchoolInfo = async () => {
    if (!childData || !childData.id) {
      Alert.alert('오류', '자녀 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const updatedStudent = await updateStudent(childData.id, {
        school_name: editSchoolFormData.schoolName.trim() || null,
        school_grade: editSchoolFormData.schoolGrade.trim() || null,
        school_class: editSchoolFormData.schoolClass.trim() || null,
        school_address: editSchoolFormData.schoolAddress.trim() || null,
        school_phone: editSchoolFormData.schoolPhone.trim() || null,
        // grade도 school_grade와 동일하게 업데이트 (통일)
        grade: editSchoolFormData.schoolGrade.trim() || null,
      });

      if (updatedStudent) {
        Alert.alert('성공', '학교 정보가 수정되었습니다.');
        setIsEditSchoolModalVisible(false);
        // 자녀 정보 다시 로드
        const detail = await fetchStudentDetail(childData.id);
        if (detail) {
          setStudentDetail(detail);
        }
        // AppContext의 자녀 목록도 새로고침
        if (refreshChildrenList) {
          await refreshChildrenList();
        }
      } else {
        Alert.alert('오류', '학교 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('학교 정보 수정 오류:', error);
      Alert.alert('오류', '학교 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEditSchool = () => {
    setIsEditSchoolModalVisible(false);
    setEditSchoolFormData({
      schoolName: '',
      schoolGrade: '',
      schoolClass: '',
      schoolAddress: '',
      schoolPhone: '',
    });
  };

  const handleAddAcademy = () => {
    setAcademyFormData({
      name: '',
      type: '',
      address: '',
      phone: '',
      floor: '',
    });
    setIsAddAcademyModalVisible(true);
  };

  const handleSaveAcademy = async () => {
    if (!academyFormData.name || !academyFormData.name.trim()) {
      Alert.alert('알림', '학원명을 입력해주세요.');
      return;
    }

    if (!personalInfo?.phone) {
      Alert.alert('알림', '학부모 연락처가 설정되지 않았습니다.');
      return;
    }

    if (!childData || !childData.id) {
      Alert.alert('오류', '자녀 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      // un_academies 테이블에 학원 정보 생성 (학부모 앱에서 등록한 학원)
      // 중요: academies 테이블은 웹 프로그램에서만 사용, un_academies는 학부모 앱에서만 사용
      const newAcademy = await createParentAcademy({
        parent_phone: personalInfo.phone,
        name: (academyFormData.name || '').trim(),
        type: (academyFormData.type || '').trim() || null,
        address: (academyFormData.address || '').trim() || null,
        phone: (academyFormData.phone || '').trim() || null,
        floor: (academyFormData.floor || '').trim() || null,
        // code는 데이터베이스 트리거에서 자동 생성됨
      });

      if (newAcademy) {
        // 자녀와 학원을 연결 (student_un_academies 테이블에 추가)
        const linkResult = await linkStudentToAcademy(childData.id, newAcademy.id);

        if (linkResult) {
          Alert.alert('성공', '학원 정보가 등록되었습니다.');
          setIsAddAcademyModalVisible(false);
          setAcademyFormData({
            name: '',
            type: '',
            address: '',
            phone: '',
            floor: '',
          });
          
          // 등록된 학원 목록 다시 로드
          const academies = await fetchStudentUnAcademies(childData.id);
          if (academies && academies.length > 0) {
            setRegisteredAcademies(academies);
          }
          
          // AppContext의 자녀 목록도 새로고침
          if (refreshChildrenList) {
            await refreshChildrenList();
          }
        } else {
          Alert.alert('오류', '자녀-학원 연결에 실패했습니다.');
        }
      } else {
        Alert.alert('오류', '학원 정보 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('학원 등록 오류:', error);
      Alert.alert('오류', '학원 등록 중 오류가 발생했습니다.');
    }
  };

  const handleCancelAddAcademy = () => {
    setIsAddAcademyModalVisible(false);
    setAcademyFormData({
      name: '',
      type: '',
      address: '',
      phone: '',
      floor: '',
    });
  };

  const InfoCard = ({ title, icon, children, showEditButton, onEdit }) => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={24} color="#9C27B0" />
        <Text style={styles.cardTitle}>{title}</Text>
        {showEditButton && (
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#9C27B0" />
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.cardContent}>
        {children}
      </View>
    </View>
  );

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const AcademyCard = ({ academy }) => (
    <TouchableOpacity 
      style={styles.academyCard}
      onPress={() => navigation.navigate('Academy', { academy })}
      activeOpacity={0.7}
    >
      <View style={styles.academyLogoContainer}>
        <Text style={styles.academyLogo}>{academy.logo}</Text>
      </View>
      <Text style={styles.academyName}>{academy.name}</Text>
      <Text style={styles.academySubject}>{academy.subject}</Text>
      {academy.phone && (
        <Text style={styles.academyPhone}>{academy.phone}</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{childName}</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
          <Text style={styles.loadingText}>정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{childInfo.name || childName}</Text>
        </View>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.name}>{childName}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {status === '연동됨' ? 'o 연동됨' : 'x 미연동'}
            </Text>
          </View>
        </View>

        {/* 자녀 정보 */}
        <InfoCard 
          title="자녀 정보" 
          icon="person-circle"
          showEditButton={true}
          onEdit={handleEditChildInfo}
        >
          <InfoRow label="이름" value={childInfo.name} />
          <InfoRow label="생년월일" value={childInfo.birthDate} />
          <InfoRow label="학년" value={childInfo.grade} />
          <InfoRow label="휴대폰 번호" value={childInfo.phone} />
          {childInfo.note && (
            <InfoRow label="특이사항" value={childInfo.note} />
          )}
        </InfoCard>

        {/* 학교 정보 */}
        <InfoCard 
          title="학교 정보" 
          icon="business"
          showEditButton={true}
          onEdit={handleEditSchoolInfo}
        >
          <InfoRow label="학교명" value={schoolInfo.name} />
          <InfoRow label="학년" value={schoolInfo.grade} />
          <InfoRow label="반" value={schoolInfo.class} />
          <InfoRow label="주소" value={schoolInfo.address} />
          <InfoRow label="전화번호" value={schoolInfo.phone} />
        </InfoCard>

        {/* 학원 정보 */}
        <View style={styles.academySection}>
          <View style={styles.academyHeader}>
            <Ionicons name="library" size={24} color="#9C27B0" />
            <Text style={styles.academyTitle}>학원 정보</Text>
            <View style={styles.academyHeaderRight}>
              {academyList.length > 1 && (
                <Text style={styles.academyCounter}>
                  {currentAcademyIndex + 1} / {academyList.length}
                </Text>
              )}
              <TouchableOpacity 
                style={styles.addAcademyButton} 
                onPress={handleAddAcademy}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={24} color="#9C27B0" />
                <Text style={styles.addAcademyButtonText}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.academyContainer}>
            {academyList.length > 1 && (
              <TouchableOpacity
                style={[
                  styles.arrowButton,
                  styles.leftArrow,
                  currentAcademyIndex === 0 && styles.arrowButtonDisabled,
                ]}
                onPress={handlePreviousAcademy}
                disabled={currentAcademyIndex === 0}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={currentAcademyIndex === 0 ? '#ccc' : '#9C27B0'}
                />
              </TouchableOpacity>
            )}
            <View style={styles.academyListContainer}>
              {academyList.length > 0 ? (
                <View style={[styles.academyCardWrapper, { width: academyCardWidth }]}>
                  <AcademyCard academy={academyList[currentAcademyIndex]} />
                </View>
              ) : (
                <View style={styles.noAcademyContainer}>
                  <Text style={styles.noAcademyText}>등록된 학원이 없습니다</Text>
                </View>
              )}
            </View>
            {academyList.length > 1 && (
              <TouchableOpacity
                style={[
                  styles.arrowButton,
                  styles.rightArrow,
                  currentAcademyIndex === academyList.length - 1 && styles.arrowButtonDisabled,
                ]}
                onPress={handleNextAcademy}
                disabled={currentAcademyIndex === academyList.length - 1}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={currentAcademyIndex === academyList.length - 1 ? '#ccc' : '#9C27B0'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 자녀 정보 수정 모달 */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>자녀 정보 수정</Text>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>자녀 이름 *</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  placeholder="자녀 이름을 입력하세요"
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>생년월일</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.birthDate}
                  onChangeText={(text) => {
                    // 숫자만 입력받기 (최대 6자리)
                    const digitsOnly = text.replace(/\D/g, '').slice(0, 6);
                    setEditFormData({ ...editFormData, birthDate: digitsOnly });
                  }}
                  placeholder="주민번호 앞자리 (예: 971120)"
                  keyboardType="numeric"
                  maxLength={6}
                />
                {editFormData.birthDate.length === 6 && (
                  <Text style={styles.helperText}>
                    {formatYYMMDDToDate(editFormData.birthDate) 
                      ? `→ ${formatYYMMDDToDate(editFormData.birthDate)}`
                      : '올바른 날짜 형식이 아닙니다'}
                  </Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>학년</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.grade}
                  onChangeText={(text) => setEditFormData({ ...editFormData, grade: text })}
                  placeholder="예: 초등학교 3학년"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>휴대폰 번호</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                  placeholder="예: 010-1234-5678"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>특이사항</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editFormData.note}
                  onChangeText={(text) => setEditFormData({ ...editFormData, note: text })}
                  placeholder="특이사항을 입력하세요 (선택사항)"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color="#666" />
                <Text style={styles.infoBoxText}>
                  수정된 정보는 Supabase에 저장됩니다.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { marginRight: 12 }]} 
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveChildInfo}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 학교 정보 수정 모달 */}
      <Modal
        visible={isEditSchoolModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEditSchool}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>학교 정보 수정</Text>
              <TouchableOpacity onPress={handleCancelEditSchool} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>학교명</Text>
                <TextInput
                  style={styles.input}
                  value={editSchoolFormData.schoolName}
                  onChangeText={(text) => setEditSchoolFormData({ ...editSchoolFormData, schoolName: text })}
                  placeholder="학교명을 입력하세요"
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>학년</Text>
                <TextInput
                  style={styles.input}
                  value={editSchoolFormData.schoolGrade}
                  onChangeText={(text) => setEditSchoolFormData({ ...editSchoolFormData, schoolGrade: text })}
                  placeholder="예: 3학년"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>반</Text>
                <TextInput
                  style={styles.input}
                  value={editSchoolFormData.schoolClass}
                  onChangeText={(text) => setEditSchoolFormData({ ...editSchoolFormData, schoolClass: text })}
                  placeholder="예: 5반"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>학교 주소</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editSchoolFormData.schoolAddress}
                  onChangeText={(text) => setEditSchoolFormData({ ...editSchoolFormData, schoolAddress: text })}
                  placeholder="학교 주소를 입력하세요"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>학교 전화번호</Text>
                <TextInput
                  style={styles.input}
                  value={editSchoolFormData.schoolPhone}
                  onChangeText={(text) => setEditSchoolFormData({ ...editSchoolFormData, schoolPhone: text })}
                  placeholder="예: 02-1234-5678"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color="#666" />
                <Text style={styles.infoBoxText}>
                  수정된 정보는 Supabase에 저장됩니다.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { marginRight: 12 }]} 
                onPress={handleCancelEditSchool}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveSchoolInfo}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 학원 등록 모달 */}
      <Modal
        visible={isAddAcademyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelAddAcademy}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>학원 등록</Text>
              <TouchableOpacity onPress={handleCancelAddAcademy} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>학원명 *</Text>
                <TextInput
                  style={styles.input}
                  value={academyFormData.name}
                  onChangeText={(text) => setAcademyFormData({ ...academyFormData, name: text })}
                  placeholder="학원명을 입력하세요"
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>유형</Text>
                <TextInput
                  style={styles.input}
                  value={academyFormData.type}
                  onChangeText={(text) => setAcademyFormData({ ...academyFormData, type: text })}
                  placeholder="예: 학원, 과외, 온라인 등"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>주소</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={academyFormData.address}
                  onChangeText={(text) => setAcademyFormData({ ...academyFormData, address: text })}
                  placeholder="학원 주소를 입력하세요"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>층수</Text>
                <TextInput
                  style={styles.input}
                  value={academyFormData.floor}
                  onChangeText={(text) => setAcademyFormData({ ...academyFormData, floor: text })}
                  placeholder="예: 3층"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>전화번호</Text>
                <TextInput
                  style={styles.input}
                  value={academyFormData.phone}
                  onChangeText={(text) => setAcademyFormData({ ...academyFormData, phone: text })}
                  placeholder="예: 02-1234-5678"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color="#666" />
                <Text style={styles.infoBoxText}>
                  등록된 학원 정보는 un_academies 테이블에 저장되며, 자녀 정보와 연결됩니다.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { marginRight: 12 }]} 
                onPress={handleCancelAddAcademy}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveAcademy}
              >
                <Text style={styles.saveButtonText}>등록</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
