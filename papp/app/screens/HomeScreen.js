import { Text, View, ScrollView, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchStudentUnAcademies } from '../lib/supabaseParentAcademies';
import { styles } from './HomeScreen.styles';

export default function HomeScreen() {
  const {
    childrenList,
    selectedChild,
    setSelectedChild,
    getSelectedChildInfo,
    learningInstitution,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackDetailModalVisible, setFeedbackDetailModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [availableAcademies, setAvailableAcademies] = useState([]);
  const [academyDropdownVisible, setAcademyDropdownVisible] = useState(false);

  // 출생년도 기준으로 자녀 목록 정렬 (출생년도가 빠른 순서)
  const sortedChildrenList = [...childrenList].sort((a, b) => {
    // birthDate 형식: "YYYY.MM.DD" 또는 null
    if (!a.birthDate && !b.birthDate) return 0;
    if (!a.birthDate) return 1; // birthDate가 없는 경우 뒤로
    if (!b.birthDate) return -1; // birthDate가 없는 경우 뒤로
    
    // "YYYY.MM.DD" 형식을 파싱하여 비교
    const dateA = a.birthDate.split('.').map(Number);
    const dateB = b.birthDate.split('.').map(Number);
    
    // 연도 비교
    if (dateA[0] !== dateB[0]) return dateA[0] - dateB[0];
    // 월 비교
    if (dateA[1] !== dateB[1]) return dateA[1] - dateB[1];
    // 일 비교
    return dateA[2] - dateB[2];
  });

  // 자녀 이름 배열 생성 (정렬된 순서대로)
  const children = sortedChildrenList.map(child => child.name);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const weekday = weekdays[date.getDay()];
    return `${year}년 ${month}월 ${day}일 ${weekday}`;
  };

  const schedules = [];

  // 출석 정보 예시 데이터
  const attendanceData = [];

  // 피드백 정보 예시 데이터
  const feedbackData = [];

  const handleFeedbackClick = (feedback) => {
    setSelectedFeedback(feedback);
    setFeedbackModalVisible(false); // 첫 번째 모달 닫기
    setFeedbackDetailModalVisible(true); // 두 번째 모달 열기
  };

  const timeSlots = [];

  useEffect(() => {
    // 날짜 초기화
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    setSelectedDate(`${year}년 ${month}월 ${day}일`);
  }, []);

  const openModal = async (type) => {
    setModalType(type);
    setModalVisible(true);
    // 모달 타입에 따라 기본 사유 설정
    setReason('');
    
    // 선택된 자녀의 학원 목록 가져오기
    const selectedChildInfo = getSelectedChildInfo();
    if (selectedChildInfo && selectedChildInfo.id) {
      const academies = [];
      
      // 1. academies 테이블의 학원 (student.academy_id로 연결)
      if (selectedChildInfo.academy && selectedChildInfo.academy.name) {
        academies.push({
          id: selectedChildInfo.academyId,
          name: selectedChildInfo.academy.name,
          type: 'academies',
        });
      }
      
      // 2. un_academies 테이블의 학원들 (student_un_academies를 통해 연결)
      const unAcademies = await fetchStudentUnAcademies(selectedChildInfo.id);
      unAcademies.forEach(academy => {
        academies.push({
          id: academy.id,
          name: academy.name,
          type: 'un_academies',
        });
      });
      
      setAvailableAcademies(academies);
      
      // 첫 번째 학원을 기본 선택
      if (academies.length > 0) {
        setSelectedAcademy(academies[0].name);
      } else {
        setSelectedAcademy('');
      }
    } else {
      setAvailableAcademies([]);
      setSelectedAcademy('');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setReason('');
    setAcademyDropdownVisible(false);
  };

  const handleConfirm = () => {
    // 여기에 확인 버튼 클릭 시 처리 로직 추가
    console.log('확인:', { modalType, selectedAcademy, selectedDate, reason });
    closeModal();
  };

  const getModalTitle = () => {
    return modalType || '요청';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      {/* 자녀 선택 탭 - 고정 */}
      <View style={styles.childTabsFixed}>
        {sortedChildrenList.map((child) => {
          const isSelected = selectedChild === child.id || selectedChild === child.name;
          return (
            <TouchableOpacity
              key={child.id}
              style={[styles.childTab, isSelected && styles.childTabActive]}
              onPress={() => setSelectedChild(child.id)}
            >
              <Text style={[styles.childTabText, isSelected && styles.childTabTextActive]}>
                {child.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 상단 카드 2개 */}
        <View style={styles.topCards}>
          <View style={[styles.topCard, { marginRight: 6 }]}>
            <Text style={styles.topCardTitle}>오늘의 출석률</Text>
            <Text style={styles.attendanceRate}>-</Text>
            <TouchableOpacity 
              style={styles.detailButton}
              onPress={() => setAttendanceModalVisible(true)}
            >
              <Text style={styles.detailButtonText}>상세 보기</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.topCard, { marginRight: 0, marginLeft: 6 }]}>
            <Text style={styles.topCardTitle}>오늘의 피드백</Text>
            <Text style={styles.feedbackText} numberOfLines={3}>
              -
            </Text>
            <TouchableOpacity 
              style={styles.detailButton}
              onPress={() => setFeedbackModalVisible(true)}
            >
              <Text style={styles.detailButtonText}>상세 보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 현재 일정 섹션 */}
        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionTitle}>현재 일정</Text>
            <View style={styles.timeHeader}>
              <Text style={styles.currentTime}>현재 시간: {formatTime(currentTime)}</Text>
              <TouchableOpacity>
                <Text style={styles.refreshIcon}>🔄</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.dateHeader}>
            <View style={{ flex: 1 }} />
            <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
          </View>
          
          <View style={styles.scheduleContainer}>
            <View style={styles.timeColumn}>
              {timeSlots.map((time) => (
                <View key={time} style={styles.timeSlot}>
                  <Text style={styles.timeText}>{time}</Text>
                </View>
              ))}
            </View>
            <View style={styles.scheduleColumn}>
              {schedules.map((schedule, index) => (
                <View key={index} style={styles.scheduleBlock}>
                  <Text style={styles.scheduleTime}>{schedule.time}</Text>
                  <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 빠른 요청 섹션 */}
        <View style={styles.quickRequestSection}>
          <Text style={styles.sectionTitle}>빠른 요청</Text>
          <View style={styles.quickRequestGrid}>
            <TouchableOpacity 
              style={[styles.quickRequestButton, { marginRight: 12, marginBottom: 12 }]}
              onPress={() => openModal('결석 알림')}
            >
              <View style={[styles.quickRequestIcon, styles.absentIcon]}>
                <Text style={styles.quickRequestIconText}>✕</Text>
              </View>
              <Text style={styles.quickRequestText}>결석 알림</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickRequestButton, { marginRight: 0, marginBottom: 12 }]}
              onPress={() => openModal('지각 알림')}
            >
              <View style={[styles.quickRequestIcon, styles.tardyIcon]}>
                <Text style={styles.quickRequestIconText}>!</Text>
              </View>
              <Text style={styles.quickRequestText}>지각 알림</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickRequestButton, { marginRight: 12, marginBottom: 0 }]}
              onPress={() => openModal('질병 알림')}
            >
              <View style={[styles.quickRequestIcon, styles.illnessIcon]}>
                <Text style={styles.quickRequestIconText}>📋</Text>
              </View>
              <Text style={styles.quickRequestText}>질병 알림</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickRequestButton, { marginRight: 0, marginBottom: 0 }]}
              onPress={() => openModal('문의하기')}
            >
              <View style={[styles.quickRequestIcon, styles.inquiryIcon]}>
                <Text style={styles.quickRequestIconText}>✉</Text>
              </View>
              <Text style={styles.quickRequestText}>문의하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                {/* 모달 헤더 */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{getModalTitle()}</Text>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* 학원 선택 */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>학원 선택</Text>
                  <TouchableOpacity 
                    style={styles.modalInput}
                    onPress={() => setAcademyDropdownVisible(!academyDropdownVisible)}
                  >
                    <Text style={[styles.modalInputText, !selectedAcademy && styles.placeholderText]}>
                      {selectedAcademy || '학원을 선택하세요'}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                  {academyDropdownVisible && availableAcademies.length > 0 && (
                    <View style={styles.dropdownContainer}>
                      {availableAcademies.map((academy) => (
                        <TouchableOpacity
                          key={academy.id}
                          style={[
                            styles.dropdownItem,
                            selectedAcademy === academy.name && styles.dropdownItemSelected
                          ]}
                          onPress={() => {
                            setSelectedAcademy(academy.name);
                            setAcademyDropdownVisible(false);
                          }}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            selectedAcademy === academy.name && styles.dropdownItemTextSelected
                          ]}>
                            {academy.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {academyDropdownVisible && availableAcademies.length === 0 && (
                    <View style={styles.dropdownContainer}>
                      <View style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>등록된 학원이 없습니다</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 날짜 선택 */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>날짜 선택</Text>
                  <View style={styles.modalInput}>
                    <Text style={styles.calendarIcon}>📅</Text>
                    <Text style={[styles.modalInputText, { flex: 1 }]}>{selectedDate}</Text>
                  </View>
                </View>

                {/* 사유 입력 */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>사유</Text>
                  <TextInput
                    style={styles.modalTextArea}
                    multiline
                    numberOfLines={4}
                    value={reason}
                    onChangeText={setReason}
                    placeholder="사유를 입력하세요"
                    placeholderTextColor="#999"
                  />
                </View>

                {/* 확인 버튼 */}
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                  <Text style={styles.confirmButtonText}>확인</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 출석률 상세 보기 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={attendanceModalVisible}
        onRequestClose={() => setAttendanceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>출석률 상세</Text>
              <TouchableOpacity 
                onPress={() => setAttendanceModalVisible(false)} 
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 출석률 요약 */}
            <View style={styles.attendanceSummary}>
              <Text style={styles.attendanceSummaryTitle}>오늘의 출석률</Text>
              <Text style={styles.attendanceSummaryRate}>-</Text>
              <Text style={styles.attendanceSummarySubtext}>
                총 {attendanceData.length}개 수업 중 {attendanceData.filter(a => a.status === '출석').length}개 출석
              </Text>
            </View>

            {/* 출석 목록 */}
            <View style={styles.attendanceList}>
              <Text style={styles.attendanceListTitle}>출석 내역</Text>
              {attendanceData.map((item, index) => (
                <View key={index} style={styles.attendanceItem}>
                  <View style={styles.attendanceItemLeft}>
                    <Text style={styles.attendanceAcademy}>{item.academy}</Text>
                    <Text style={styles.attendanceTime}>{item.time}</Text>
                  </View>
                  <View style={[styles.attendanceStatusBadge, { backgroundColor: item.statusColor + '20' }]}>
                    <Text style={[styles.attendanceStatusText, { color: item.statusColor }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* 피드백 상세 보기 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>피드백 상세</Text>
              <TouchableOpacity 
                onPress={() => setFeedbackModalVisible(false)} 
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 피드백 목록 */}
            <View style={styles.feedbackList}>
              <Text style={styles.feedbackListTitle}>오늘의 피드백</Text>
              {feedbackData.map((item, index) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.feedbackItem}
                  onPress={() => handleFeedbackClick(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.feedbackTitle}>{item.academy}</Text>
                  <View style={styles.feedbackContent}>
                    <Text style={styles.feedbackSummary}>{item.summary}</Text>
                  </View>
                  <View style={styles.feedbackFooter}>
                    <Text style={styles.feedbackDateTime}>{item.time} / {item.date}</Text>
                    <Text style={styles.feedbackTeacher}>{item.teacher}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* 피드백 자세히 보기 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={feedbackDetailModalVisible}
        onRequestClose={() => setFeedbackDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>피드백 상세</Text>
              <TouchableOpacity 
                onPress={() => setFeedbackDetailModalVisible(false)} 
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedFeedback && (
              <ScrollView style={styles.feedbackDetailContent} showsVerticalScrollIndicator={false}>
                <View style={styles.feedbackDetailHeader}>
                  <Text style={styles.feedbackDetailTitle}>{selectedFeedback.academy}</Text>
                </View>
                <View style={styles.feedbackDetailInfo}>
                  <View style={styles.feedbackDetailDateTime}>
                    <Text style={styles.feedbackDetailTime}>{selectedFeedback.time}</Text>
                    <Text style={styles.feedbackDetailDate}>{selectedFeedback.date}</Text>
                  </View>
                </View>
                <View style={styles.feedbackDetailTextContainer}>
                  <Text style={styles.feedbackDetailText}>{selectedFeedback.feedback}</Text>
                </View>
                <View style={styles.feedbackDetailFooter}>
                  <TouchableOpacity 
                    style={styles.replyButton}
                    onPress={() => {
                      setReplyText('');
                      setReplyModalVisible(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.replyButtonText}>답글 달기</Text>
                  </TouchableOpacity>
                  <Text style={styles.feedbackDetailTeacher}>작성자: {selectedFeedback.teacher}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 답글 달기 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={replyModalVisible}
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>답글 달기</Text>
              <TouchableOpacity 
                onPress={() => {
                  setReplyModalVisible(false);
                  setReplyText('');
                }} 
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 답글 입력 */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>답글 내용</Text>
              <TextInput
                style={styles.modalTextArea}
                multiline
                numberOfLines={6}
                value={replyText}
                onChangeText={setReplyText}
                placeholder="답글을 입력하세요"
                placeholderTextColor="#999"
              />
            </View>

            {/* 확인 버튼 */}
            <TouchableOpacity 
              style={styles.confirmButton} 
              onPress={() => {
                // 답글 저장 로직 (나중에 API 연동)
                console.log('답글 저장:', replyText);
                setReplyModalVisible(false);
                setReplyText('');
              }}
            >
              <Text style={styles.confirmButtonText}>답글 등록</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
