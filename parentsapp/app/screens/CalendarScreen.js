import { Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { fetchAcademySchedules, fetchStudentSchedule } from '../lib/saasIntegration';
import { fetchEvents, createEvent, deleteEvent } from '../lib/supabaseEvents';
import { styles } from './CalendarScreen.styles';

export default function CalendarScreen() {
  const { getSelectedChildInfo } = useApp();
  const selectedChild = getSelectedChildInfo();

  const [viewMode, setViewMode] = useState('month'); // 'month' or 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [dateDetailModalVisible, setDateDetailModalVisible] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);
  const [eventDetailModalVisible, setEventDetailModalVisible] = useState(false);
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);
  const [upcomingEventsModalVisible, setUpcomingEventsModalVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventMemo, setEventMemo] = useState('');
  const [eventIdCounter, setEventIdCounter] = useState(1000);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerType, setTimePickerType] = useState('start'); // 'start' or 'end'
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedAmPm, setSelectedAmPm] = useState('오전');
  const [loading, setLoading] = useState(false);
  
  // 시간 선택 휠 참조
  const amPmScrollRef = useRef(null);
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  // 이벤트가 있는 날짜 (state로 관리)
  const [eventsByDate, setEventsByDate] = useState({});

  // 일별 일정 (state로 관리)
  const [dailyEvents, setDailyEvents] = useState({});

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 학원 일정 및 자녀 수업 일정 로드
  useEffect(() => {
    const loadSchedules = async () => {
      if (!selectedChild) return;

      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        // 1. Supabase events 테이블에서 일정 가져오기
        const supabaseEvents = await fetchEvents(startDate, endDate);
        
        // 2. 자녀의 수업 일정 가져오기
        let studentSchedules = [];
        if (selectedChild.id) {
          studentSchedules = await fetchStudentSchedule(selectedChild.id);
        }

        // 3. 학원 일정 가져오기 (자녀의 학원 ID가 있는 경우)
        let academySchedules = [];
        if (selectedChild.academyId) {
          academySchedules = await fetchAcademySchedules(selectedChild.academyId, startDate, endDate);
        }

        // 4. 데이터 통합
        const mergedEventsByDate = {};
        const mergedDailyEvents = {};

        // Supabase events 추가
        supabaseEvents.forEach(event => {
          const dateKey = formatDateKey(new Date(event.event_date));
          const timeFormatted = formatTimeToAMPM(event.start_time);
          
          if (!mergedEventsByDate[dateKey]) {
            mergedEventsByDate[dateKey] = [];
          }
          mergedEventsByDate[dateKey].push({
            id: event.id,
            title: event.title,
            time: timeFormatted,
            location: event.location || '',
          });

          if (!mergedDailyEvents[dateKey]) {
            mergedDailyEvents[dateKey] = [];
          }
          mergedDailyEvents[dateKey].push({
            id: event.id,
            title: event.title,
            time: event.start_time,
            endTime: event.end_time,
            location: event.location || '',
            type: 'custom',
          });
        });

        // 자녀의 수업 일정 추가
        studentSchedules.forEach(enrollment => {
          if (!enrollment.classes) return;
          
          const classData = enrollment.classes;
          const subject = classData.subjects;
          const teacher = classData.teachers;
          const classroom = classData.classrooms;

          // schedule 필드에서 요일과 시간 파싱 (예: "월,수 14:00-15:30")
          if (classData.schedule) {
            const scheduleParts = classData.schedule.split(' ');
            if (scheduleParts.length >= 2) {
              const days = scheduleParts[0].split(',');
              const timeRange = scheduleParts[1];
              const [startTime, endTime] = timeRange.split('-');

              // 현재 월의 해당 요일들 찾기
              days.forEach(dayName => {
                const dayMap = { '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6, '일': 0 };
                const targetDay = dayMap[dayName];
                
                if (targetDay !== undefined) {
                  // 현재 월의 해당 요일 찾기
                  for (let d = 1; d <= endDate.getDate(); d++) {
                    const checkDate = new Date(year, month, d);
                    if (checkDate.getDay() === targetDay) {
                      const dateKey = formatDateKey(checkDate);
                      const timeFormatted = formatTimeToAMPM(startTime);
                      
                      if (!mergedEventsByDate[dateKey]) {
                        mergedEventsByDate[dateKey] = [];
                      }
                      mergedEventsByDate[dateKey].push({
                        id: `class-${classData.id}-${dateKey}`,
                        title: `${subject?.name || '수업'} (${teacher?.name || ''})`,
                        time: timeFormatted,
                        location: classroom?.name || '',
                      });

                      if (!mergedDailyEvents[dateKey]) {
                        mergedDailyEvents[dateKey] = [];
                      }
                      mergedDailyEvents[dateKey].push({
                        id: `class-${classData.id}-${dateKey}`,
                        title: `${subject?.name || '수업'} (${teacher?.name || ''})`,
                        time: startTime,
                        endTime: endTime,
                        location: classroom?.name || '',
                        type: 'academy',
                      });
                    }
                  }
                }
              });
            }
          }
        });

        // 학원 일정 추가
        academySchedules.forEach(schedule => {
          const startDateObj = new Date(schedule.start_date);
          const endDateObj = new Date(schedule.end_date);
          const dateKey = formatDateKey(startDateObj);
          
          if (!mergedEventsByDate[dateKey]) {
            mergedEventsByDate[dateKey] = [];
          }
          mergedEventsByDate[dateKey].push({
            id: schedule.id,
            title: schedule.title,
            time: schedule.is_all_day ? '하루 종일' : formatTimeToAMPM(startDateObj.toTimeString().slice(0, 5)),
            location: '',
          });
        });

        // 각 날짜의 일정을 시간 순으로 정렬
        const sortedEventsByDate = {};
        Object.keys(mergedEventsByDate).forEach(dateKey => {
          sortedEventsByDate[dateKey] = sortEventsByTime(mergedEventsByDate[dateKey]);
        });
        
        const sortedDailyEvents = {};
        Object.keys(mergedDailyEvents).forEach(dateKey => {
          sortedDailyEvents[dateKey] = sortEventsByTime(mergedDailyEvents[dateKey]);
        });
        
        setEventsByDate(sortedEventsByDate);
        setDailyEvents(sortedDailyEvents);
      } catch (error) {
        console.error('일정 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedules();
  }, [currentDate, selectedChild]);

  // 시간을 오전/오후 형식으로 변환
  const formatTimeToAMPM = (timeStr) => {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? '오후' : '오전';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${ampm} ${displayHour}:${minute || '00'}`;
  };

  // 일정을 시간 순으로 정렬하는 함수 (월간 보기용 - "오전 8:00" 형식)
  const sortEventsByTime = (events) => {
    return [...events].sort((a, b) => {
      const parseTime = (timeStr) => {
        if (!timeStr) return 9999; // 시간이 없으면 맨 뒤로
        if (timeStr === '하루 종일') return 0; // 하루 종일은 맨 앞
        
        // "오전 8:00" 또는 "오후 2:30" 형식 파싱
        if (timeStr.includes('오전') || timeStr.includes('오후')) {
          const parts = timeStr.split(' ');
          if (parts.length < 2) return 9999;
          
          const ampm = parts[0];
          const timePart = parts[1];
          const [hour, minute] = timePart.split(':');
          let hourNum = parseInt(hour);
          
          if (ampm === '오후' && hourNum !== 12) {
            hourNum += 12;
          } else if (ampm === '오전' && hourNum === 12) {
            hourNum = 0;
          }
          
          return hourNum * 60 + parseInt(minute || 0);
        }
        
        // "08:00" 형식 파싱 (24시간 형식)
        if (timeStr.includes(':')) {
          const [hour, minute] = timeStr.split(':');
          return parseInt(hour) * 60 + parseInt(minute || 0);
        }
        
        return 9999;
      };
      
      return parseTime(a.time) - parseTime(b.time);
    });
  };

  // 일정 저장 함수
  const handleSaveEvent = async () => {
    if (!eventTitle.trim() || !eventDate.trim() || !startTime.trim() || !endTime.trim()) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }

    const dateKey = eventDate.trim();
    const timeFormatted = formatTimeToAMPM(startTime.trim());
    
    try {
      // Supabase에 저장 시도
      const newEvent = await createEvent({
        title: eventTitle.trim(),
        event_date: dateKey,
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        location: eventMemo.trim() || '',
        memo: '',
      });

      if (newEvent) {
        // Supabase 저장 성공
        const monthEvent = {
          id: newEvent.id,
          title: newEvent.title,
          time: timeFormatted,
          location: newEvent.location || '',
        };

        const dayEvent = {
          id: newEvent.id,
          title: newEvent.title,
          time: newEvent.start_time,
          endTime: newEvent.end_time,
          location: newEvent.location || '',
          type: 'custom',
        };

        // 로컬 state 업데이트 (시간 순으로 정렬)
        setEventsByDate(prev => {
          const newEvents = { ...prev };
          if (newEvents[dateKey]) {
            newEvents[dateKey] = sortEventsByTime([...newEvents[dateKey], monthEvent]);
          } else {
            newEvents[dateKey] = [monthEvent];
          }
          return newEvents;
        });

        setDailyEvents(prev => {
          const newEvents = { ...prev };
          if (newEvents[dateKey]) {
            newEvents[dateKey] = sortEventsByTime([...newEvents[dateKey], dayEvent]);
          } else {
            newEvents[dateKey] = [dayEvent];
          }
          return newEvents;
        });

        Alert.alert('성공', '일정이 저장되었습니다.');
      } else {
        // Supabase 저장 실패 시 로컬에만 저장
        const eventId = eventIdCounter;
        setEventIdCounter(prev => prev + 1);

        const monthEvent = {
          id: eventId,
          title: eventTitle.trim(),
          time: timeFormatted,
          location: eventMemo.trim() || '',
        };

        const dayEvent = {
          id: eventId,
          title: eventTitle.trim(),
          time: startTime.trim(),
          endTime: endTime.trim(),
          location: eventMemo.trim() || '',
          type: 'custom',
        };

        // 로컬 state 업데이트 (오프라인 모드, 시간 순으로 정렬)
        setEventsByDate(prev => {
          const newEvents = { ...prev };
          if (newEvents[dateKey]) {
            newEvents[dateKey] = sortEventsByTime([...newEvents[dateKey], monthEvent]);
          } else {
            newEvents[dateKey] = [monthEvent];
          }
          return newEvents;
        });

        setDailyEvents(prev => {
          const newEvents = { ...prev };
          if (newEvents[dateKey]) {
            newEvents[dateKey] = sortEventsByTime([...newEvents[dateKey], dayEvent]);
          } else {
            newEvents[dateKey] = [dayEvent];
          }
          return newEvents;
        });
      }
    } catch (error) {
      console.error('일정 저장 오류:', error);
      Alert.alert('오류', '일정 저장 중 오류가 발생했습니다.');
    }

    // 모달 닫기 및 입력 필드 초기화
    setModalVisible(false);
    setEventTitle('');
    setEventDate('');
    setStartTime('');
    setEndTime('');
    setEventMemo('');
  };

  // 일정 삭제 확인 모달 열기
  const openDeleteModal = (dateKey, eventId, eventTitle, eventTime) => {
    setEventToDelete({ dateKey, eventId, eventTitle, eventTime });
    setDeleteModalVisible(true);
  };

  // 일정 삭제 실행 함수
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    const { dateKey, eventId, eventTitle, eventTime } = eventToDelete;

    try {
      // Supabase에서 삭제 시도 (UUID 형식인 경우)
      if (eventId && typeof eventId === 'string' && eventId.includes('-')) {
        const deleted = await deleteEvent(eventId);
        if (!deleted) {
          console.warn('Supabase 삭제 실패, 로컬에서만 삭제합니다.');
        }
      }

      // dailyEvents에서 삭제
      setDailyEvents(prev => {
        const newEvents = { ...prev };
        if (newEvents[dateKey]) {
          let updatedEvents;
          if (eventId) {
            // ID가 있는 경우 ID로 삭제
            updatedEvents = newEvents[dateKey].filter(event => event.id !== eventId);
          } else {
            // ID가 없는 경우 제목과 시간으로 삭제
            updatedEvents = newEvents[dateKey].filter(event => 
              !(event.title === eventTitle && event.time === eventTime)
            );
          }
          if (updatedEvents.length === 0) {
            delete newEvents[dateKey];
          } else {
            newEvents[dateKey] = updatedEvents;
          }
        }
        return { ...newEvents };
      });

      // eventsByDate에서도 삭제
      setEventsByDate(prev => {
        const newEvents = { ...prev };
        if (newEvents[dateKey]) {
          let updatedEvents;
          if (eventId) {
            // ID가 있는 경우 ID로 삭제
            updatedEvents = newEvents[dateKey].filter(event => event.id !== eventId);
          } else {
            // ID가 없는 경우 제목으로 삭제 (시간 형식이 다를 수 있음)
            updatedEvents = newEvents[dateKey].filter(event => 
              event.title !== eventTitle
            );
          }
          if (updatedEvents.length === 0) {
            delete newEvents[dateKey];
          } else {
            newEvents[dateKey] = updatedEvents;
          }
        }
        return { ...newEvents };
      });

      Alert.alert('성공', '일정이 삭제되었습니다.');
    } catch (error) {
      console.error('일정 삭제 오류:', error);
      Alert.alert('오류', '일정 삭제 중 오류가 발생했습니다.');
    }

    // 모달 닫기 및 상태 초기화
    setDeleteModalVisible(false);
    setEventToDelete(null);
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 이전 달의 마지막 날들
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // 현재 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      });
    }

    // 다음 달의 첫 날들 (총 42개 셀을 채우기 위해)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const changeDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const hasEvent = (date) => {
    const key = formatDateKey(date);
    return eventsByDate[key] && eventsByDate[key].length > 0;
  };

  const isSelected = (date) => {
    return formatDateKey(date) === formatDateKey(selectedDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const upcoming = [];
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const key = formatDateKey(checkDate);
      if (eventsByDate[key]) {
        eventsByDate[key].forEach(event => {
          upcoming.push({ ...event, date: checkDate });
        });
      }
    }
    return upcoming.slice(0, 5);
  };

  const renderMonthView = () => {
    const days = getMonthDays();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const monthName = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;

    return (
      <View style={styles.monthViewContainer}>
        {/* 헤더 - 고정 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="calendar" size={20} color="#9C27B0" />
            </View>
            <Text style={styles.headerTitle}>월간 보기</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.eventsButton, { marginRight: 12 }]} 
              onPress={() => setUpcomingEventsModalVisible(true)}
            >
              <Ionicons name="list" size={16} color="#9C27B0" style={{ marginRight: 4 }} />
              <Text style={styles.eventsButtonText}>이벤트</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Ionicons name="add" size={16} color="#9C27B0" style={{ marginRight: 4 }} />
              <Text style={styles.addButtonText}>일정 추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 캘린더 카드 */}
        <View style={styles.calendarCard}>
          {/* 월 네비게이션 - 고정 */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.monthText}>{monthName}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* 요일 헤더 - 고정 */}
          <View style={styles.weekdayHeader}>
            {weekdays.map((day, index) => (
              <View key={index} style={styles.weekdayCell}>
                <Text style={[styles.weekdayText, index === 0 && styles.sundayText, index === 6 && styles.saturdayText]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* 날짜 그리드 - 스크롤 가능 */}
          <ScrollView style={styles.daysGridScrollView} showsVerticalScrollIndicator={true}>
            <View style={styles.daysGrid}>
              {days.map((day, index) => {
                const dateKey = formatDateKey(day.fullDate);
                const dayEvents = eventsByDate[dateKey] || [];
                // 시간 순으로 정렬 (가장 이른 시간이 최상단에)
                const sortedDayEvents = sortEventsByTime(dayEvents);
                const isSelectedDay = isSelected(day.fullDate);
                const isTodayDay = isToday(day.fullDate);
                const dayOfWeek = day.fullDate.getDay();
                const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      !day.isCurrentMonth && styles.otherMonthDayCell,
                      isSelectedDay && styles.selectedDayCell,
                      isTodayDay && !isSelectedDay && styles.todayCell,
                    ]}
                    onPress={() => {
                      if (day.isCurrentMonth) {
                        setSelectedDate(day.fullDate);
                        setSelectedDateForModal(day.fullDate);
                        setTimeout(() => {
                          setDateDetailModalVisible(true);
                        }, 100);
                      }
                    }}
                  >
                    <View style={styles.dayCellTop}>
                      {/* 요일 표시 */}
                      {day.isCurrentMonth && (
                        <Text style={styles.weekdayLabel}>
                          {weekdayNames[dayOfWeek]}
                        </Text>
                      )}
                      
                      {/* 날짜 숫자 */}
                      <Text
                        style={[
                          styles.dayText,
                          !day.isCurrentMonth && styles.otherMonthText,
                          isSelectedDay && styles.selectedDayText,
                          isTodayDay && !isSelectedDay && styles.todayText,
                        ]}
                      >
                        {day.date}
                      </Text>
                    </View>
                    
                    {/* 일정 목록 */}
                    {day.isCurrentMonth && sortedDayEvents.length > 0 && (
                      <View style={styles.dayEventsList}>
                        {sortedDayEvents.slice(0, 2).map((event, eventIndex) => (
                          <View key={eventIndex} style={[styles.dayEventItem, eventIndex === 0 && { marginTop: 0 }]}>
                            <View style={styles.dayEventBar} />
                            <Text style={styles.dayEventText} numberOfLines={1}>
                              {event.title}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderDayView = () => {
    const dateKey = formatDateKey(currentDate);
    const events = dailyEvents[dateKey] || [];
    const dateString = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`;

    const timeSlots = [];
    for (let hour = 7; hour <= 22; hour++) {
      timeSlots.push(hour);
    }

    return (
      <View style={styles.dayViewContainer}>
        {/* 헤더 - 고정 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="calendar" size={20} color="#9C27B0" />
            </View>
            <Text style={styles.headerTitle}>일별 보기</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => {
                // 일별 보기에서는 현재 날짜를 자동으로 설정
                const dateKey = formatDateKey(currentDate);
                setEventDate(dateKey);
                setModalVisible(true);
              }}
            >
              <Ionicons name="add" size={16} color="#9C27B0" />
              <Text style={styles.addButtonText}>일정 추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 날짜 네비게이션 - 고정 */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity onPress={() => changeDay(-1)}>
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.dateText}>{dateString}</Text>
          <TouchableOpacity onPress={() => changeDay(1)}>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 시간대별 일정 - 스크롤 가능 */}
        <ScrollView style={styles.dayViewScrollView}>
          <View style={styles.scheduleContainer}>
          {timeSlots.map((hour) => {
            const hourEvents = events.filter(event => {
              const eventHour = parseInt(event.time.split(':')[0]);
              return eventHour === hour;
            });

            const ampm = hour >= 12 ? '오후' : '오전';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

            return (
              <View key={hour} style={styles.timeSlot}>
                <View style={styles.timeLabel}>
                  <Text style={styles.timeText}>
                    {ampm} {displayHour}:00
                  </Text>
                </View>
                <View style={styles.eventsColumn}>
                  {hourEvents.length > 0 ? (
                    hourEvents.map((event, index) => (
                      <TouchableOpacity
                        key={event.id || index}
                        style={styles.eventBlock}
                        onPress={() => {
                          setSelectedEventForModal({ ...event, dateKey });
                          setEventDetailModalVisible(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            openDeleteModal(dateKey, event.id, event.title, event.time);
                          }}
                        >
                          <Text style={styles.deleteButtonText}>🗑️</Text>
                        </TouchableOpacity>
                        <Text style={styles.eventBlockTitle}>{event.title}</Text>
                        <Text style={styles.eventBlockTime}>
                          {ampm} {event.time} - {ampm} {event.endTime}
                        </Text>
                        {event.location && (
                          <Text style={styles.eventBlockLocation}>
                            {event.location.includes('온라인') ? '⊙' : '◎'} {event.location}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noEventText}>이벤트 없음</Text>
                  )}
                </View>
              </View>
            );
          })}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      
      {/* 뷰 모드 토글 */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'month' && styles.toggleButtonActive]}
          onPress={() => setViewMode('month')}
        >
          <Text style={[styles.toggleText, viewMode === 'month' && styles.toggleTextActive]}>
            월간 보기
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'day' && styles.toggleButtonActive]}
          onPress={() => setViewMode('day')}
        >
          <Text style={[styles.toggleText, viewMode === 'day' && styles.toggleTextActive]}>
            일별 보기
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'month' ? renderMonthView() : renderDayView()}

      {/* 일정 추가 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>일정 추가</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {/* 일정 제목 */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>일정 제목</Text>
                <TextInput
                  style={styles.modalInput}
                  value={eventTitle}
                  onChangeText={setEventTitle}
                  placeholder="일정 제목을 입력하세요"
                  placeholderTextColor="#999"
                />
              </View>

              {/* 날짜 선택 */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>날짜</Text>
                {viewMode === 'day' ? (
                  <View style={styles.modalInputDisabled}>
                    <Text style={styles.modalInputDisabledText}>
                      {eventDate ? (() => {
                        const [year, month, day] = eventDate.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
                        return `${year}년 ${month}월 ${day}일 (${weekdayNames[date.getDay()]})`;
                      })() : '날짜 선택'}
                    </Text>
                  </View>
                ) : (
                  <TextInput
                    style={styles.modalInput}
                    value={eventDate}
                    onChangeText={setEventDate}
                    placeholder="YYYY-MM-DD 형식으로 입력하세요"
                    placeholderTextColor="#999"
                  />
                )}
              </View>

              {/* 시간 선택 */}
              <View style={styles.timePickerSection}>
                <View style={styles.timePickerHeader}>
                  <TouchableOpacity
                    style={[styles.timePickerHeaderItem, timePickerType === 'start' && styles.timePickerHeaderItemActive]}
                    onPress={() => {
                      setTimePickerType('start');
                      // 현재 시작 시간을 파싱하여 피커에 설정
                      if (startTime) {
                        const [hour, minute] = startTime.split(':');
                        const h = parseInt(hour);
                        const ampm = h >= 12 ? '오후' : '오전';
                        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
                        const displayMinute = parseInt(minute) || 0;
                        setSelectedAmPm(ampm);
                        setSelectedHour(displayHour);
                        setSelectedMinute(displayMinute);
                        setTimePickerVisible(true);
                        // 스크롤 위치 설정
                        setTimeout(() => {
                          amPmScrollRef.current?.scrollTo({ y: (ampm === '오전' ? 0 : 1) * 50, animated: false });
                          hourScrollRef.current?.scrollTo({ y: (displayHour - 1) * 50, animated: false });
                          minuteScrollRef.current?.scrollTo({ y: (displayMinute / 5) * 50, animated: false });
                        }, 100);
                      } else {
                        // 기본값 설정
                        setSelectedAmPm('오전');
                        setSelectedHour(8);
                        setSelectedMinute(0);
                        setTimePickerVisible(true);
                        setTimeout(() => {
                          amPmScrollRef.current?.scrollTo({ y: 50 * 50, animated: false });
                          hourScrollRef.current?.scrollTo({ y: (600 + 7) * 50, animated: false });
                          minuteScrollRef.current?.scrollTo({ y: 600 * 50, animated: false });
                        }, 100);
                      }
                    }}
                  >
                    <Text style={styles.timePickerDateLabel}>
                      {eventDate ? (() => {
                        const [year, month, day] = eventDate.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
                        return `${month}월 ${day}일 (${weekdayNames[date.getDay()]})`;
                      })() : '날짜 선택'}
                    </Text>
                    <View style={[styles.timePickerTimeDisplay, timePickerType === 'start' && styles.timePickerTimeDisplayActive]}>
                      <Text style={[styles.timePickerTimeText, timePickerType === 'start' && styles.timePickerTimeTextActive]}>
                        {startTime ? (() => {
                          const [h, m] = startTime.split(':');
                          const hour = parseInt(h);
                          const ampm = hour >= 12 ? '오후' : '오전';
                          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                          return `${ampm} ${displayHour}:${m || '00'}`;
                        })() : '시작 시간'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <View style={styles.timePickerArrow}>
                    <Ionicons name="arrow-forward" size={20} color="#666" />
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.timePickerHeaderItem, timePickerType === 'end' && styles.timePickerHeaderItemActive]}
                    onPress={() => {
                      setTimePickerType('end');
                      // 현재 종료 시간을 파싱하여 피커에 설정
                      if (endTime) {
                        const [hour, minute] = endTime.split(':');
                        const h = parseInt(hour);
                        const ampm = h >= 12 ? '오후' : '오전';
                        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
                        const displayMinute = parseInt(minute) || 0;
                        setSelectedAmPm(ampm);
                        setSelectedHour(displayHour);
                        setSelectedMinute(displayMinute);
                        setTimePickerVisible(true);
                        // 스크롤 위치 설정 (중앙 위치로 설정하여 무한 루프 가능하게)
                        setTimeout(() => {
                          const ampmIndex = ampm === '오전' ? 0 : 1;
                          amPmScrollRef.current?.scrollTo({ y: (50 + ampmIndex) * 50, animated: false });
                          hourScrollRef.current?.scrollTo({ y: (600 + (displayHour - 1)) * 50, animated: false });
                          minuteScrollRef.current?.scrollTo({ y: (600 + (displayMinute / 5)) * 50, animated: false });
                        }, 100);
                      } else {
                        // 기본값 설정 (시작 시간 + 1시간)
                        if (startTime) {
                          const [hour, minute] = startTime.split(':');
                          const h = parseInt(hour) + 1;
                          const ampm = h >= 12 ? '오후' : '오전';
                          const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
                          const displayMinute = parseInt(minute) || 0;
                          setSelectedAmPm(ampm);
                          setSelectedHour(displayHour);
                          setSelectedMinute(displayMinute);
                          setTimePickerVisible(true);
                          setTimeout(() => {
                            const ampmIndex = ampm === '오전' ? 0 : 1;
                            amPmScrollRef.current?.scrollTo({ y: (50 + ampmIndex) * 50, animated: false });
                            hourScrollRef.current?.scrollTo({ y: (600 + (displayHour - 1)) * 50, animated: false });
                            minuteScrollRef.current?.scrollTo({ y: (600 + (displayMinute / 5)) * 50, animated: false });
                          }, 100);
                        } else {
                          setSelectedAmPm('오전');
                          setSelectedHour(9);
                          setSelectedMinute(0);
                          setTimePickerVisible(true);
                          setTimeout(() => {
                            amPmScrollRef.current?.scrollTo({ y: 50 * 50, animated: false });
                            hourScrollRef.current?.scrollTo({ y: (600 + 8) * 50, animated: false });
                            minuteScrollRef.current?.scrollTo({ y: 600 * 50, animated: false });
                          }, 100);
                        }
                      }
                    }}
                  >
                    <Text style={styles.timePickerDateLabel}>
                      {eventDate ? (() => {
                        const [year, month, day] = eventDate.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
                        return `${month}월 ${day}일 (${weekdayNames[date.getDay()]})`;
                      })() : '날짜 선택'}
                    </Text>
                    <View style={styles.timePickerTimeDisplay}>
                      <Text style={styles.timePickerTimeText}>
                        {endTime ? (() => {
                          const [h, m] = endTime.split(':');
                          const hour = parseInt(h);
                          const ampm = hour >= 12 ? '오후' : '오전';
                          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                          return `${ampm} ${displayHour}:${m || '00'}`;
                        })() : '종료 시간'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 메모 */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>메모</Text>
                <TextInput
                  style={styles.modalTextArea}
                  value={eventMemo}
                  onChangeText={setEventMemo}
                  placeholder="메모를 입력하세요"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* 저장 버튼 */}
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveEvent}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>일정 삭제</Text>
            <Text style={styles.deleteModalMessage}>이 일정을 삭제하시겠습니까?</Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalCancelButton, { marginRight: 12 }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.deleteModalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalConfirmButton]}
                onPress={confirmDeleteEvent}
              >
                <Text style={styles.deleteModalConfirmText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 시간 선택 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={timePickerVisible}
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={styles.timePickerModalOverlay}>
          <View style={styles.timePickerModalContent}>
            {/* 시간 선택 헤더 */}
            <View style={styles.timePickerModalHeader}>
              <TouchableOpacity
                onPress={() => setTimePickerVisible(false)}
                style={styles.timePickerCancelButton}
              >
                <Text style={styles.timePickerCancelText}>취소</Text>
              </TouchableOpacity>
              <Text style={styles.timePickerModalTitle}>
                {timePickerType === 'start' ? '시작 시간' : '종료 시간'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // 선택된 시간을 24시간 형식으로 변환
                  let hour24 = selectedHour;
                  if (selectedAmPm === '오후' && selectedHour !== 12) {
                    hour24 = selectedHour + 12;
                  } else if (selectedAmPm === '오전' && selectedHour === 12) {
                    hour24 = 0;
                  }
                  const timeString = `${String(hour24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
                  
                  if (timePickerType === 'start') {
                    setStartTime(timeString);
                  } else {
                    setEndTime(timeString);
                  }
                  setTimePickerVisible(false);
                }}
                style={styles.timePickerConfirmButton}
              >
                <Text style={styles.timePickerConfirmText}>확인</Text>
              </TouchableOpacity>
            </View>

            {/* 시간 선택 휠 */}
            <View style={styles.timePickerWheel}>
              {/* 선택 영역 오버레이 */}
              <View style={styles.timePickerOverlay} pointerEvents="none">
                <View style={styles.timePickerOverlayTop} />
                <View style={styles.timePickerOverlayMiddle} />
                <View style={styles.timePickerOverlayBottom} />
              </View>
              
              {/* AM/PM 선택 */}
              <View style={styles.timePickerColumn}>
                <ScrollView
                  ref={amPmScrollRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={50}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 50);
                    const actualIndex = ((index % 2) + 2) % 2;
                    const newAmPm = actualIndex === 0 ? '오전' : '오후';
                    setSelectedAmPm(newAmPm);
                    // 중앙 위치로 조정 (무한 루프를 위한 중간 위치)
                    const centerIndex = 50;
                    const targetY = (centerIndex + actualIndex) * 50;
                    amPmScrollRef.current?.scrollTo({ y: targetY, animated: false });
                  }}
                  scrollEventThrottle={16}
                  onScroll={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 50);
                    const actualIndex = ((index % 2) + 2) % 2;
                    const newAmPm = actualIndex === 0 ? '오전' : '오후';
                    setSelectedAmPm(newAmPm);
                    
                    // 스크롤이 끝에 가까우면 중앙으로 이동
                    const totalItems = 100;
                    const itemHeight = 50;
                    const maxScroll = (totalItems - 1) * itemHeight;
                    const currentScroll = offsetY;
                    
                    if (currentScroll < itemHeight * 5) {
                      // 상단에 가까우면 중앙으로 이동
                      setTimeout(() => {
                        const centerIndex = 50;
                        const actualIdx = ((index % 2) + 2) % 2;
                        amPmScrollRef.current?.scrollTo({ y: (centerIndex + actualIdx) * 50, animated: false });
                      }, 50);
                    } else if (currentScroll > maxScroll - itemHeight * 5) {
                      // 하단에 가까우면 중앙으로 이동
                      setTimeout(() => {
                        const centerIndex = 50;
                        const actualIdx = ((index % 2) + 2) % 2;
                        amPmScrollRef.current?.scrollTo({ y: (centerIndex + actualIdx) * 50, animated: false });
                      }, 50);
                    }
                  }}
                  contentContainerStyle={{ paddingVertical: 100 }}
                >
                  {Array.from({ length: 100 }, (_, i) => {
                    const ampm = i % 2 === 0 ? '오전' : '오후';
                    return (
                      <TouchableOpacity 
                        key={i} 
                        style={styles.timePickerItem}
                        onPress={() => {
                          const centerIndex = 50;
                          const actualIdx = i % 2;
                          const targetY = (centerIndex + actualIdx) * 50;
                          amPmScrollRef.current?.scrollTo({ y: targetY, animated: true });
                          setSelectedAmPm(ampm);
                        }}
                      >
                        <Text style={[
                          styles.timePickerItemText,
                          selectedAmPm === ampm && styles.timePickerItemTextActive
                        ]}>
                          {ampm}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 시간 선택 */}
              <View style={styles.timePickerColumn}>
                <ScrollView
                  ref={hourScrollRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={50}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingVertical: 100 }}
                  onMomentumScrollEnd={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 50);
                    const actualIndex = ((index % 12) + 12) % 12;
                    const newHour = actualIndex + 1;
                    setSelectedHour(newHour);
                    // 중앙 위치로 조정 (무한 루프를 위한 중간 위치)
                    const centerIndex = 600;
                    const targetY = (centerIndex + actualIndex) * 50;
                    hourScrollRef.current?.scrollTo({ y: targetY, animated: false });
                  }}
                  scrollEventThrottle={16}
                  onScroll={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 50);
                    const actualIndex = ((index % 12) + 12) % 12;
                    const newHour = actualIndex + 1;
                    setSelectedHour(newHour);
                    
                    // 스크롤이 끝에 가까우면 중앙으로 이동
                    const totalItems = 1200;
                    const itemHeight = 50;
                    const maxScroll = (totalItems - 1) * itemHeight;
                    const currentScroll = offsetY;
                    
                    if (currentScroll < itemHeight * 50) {
                      // 상단에 가까우면 중앙으로 이동
                      setTimeout(() => {
                        const centerIndex = 600;
                        const actualIdx = ((index % 12) + 12) % 12;
                        hourScrollRef.current?.scrollTo({ y: (centerIndex + actualIdx) * 50, animated: false });
                      }, 50);
                    } else if (currentScroll > maxScroll - itemHeight * 50) {
                      // 하단에 가까우면 중앙으로 이동
                      setTimeout(() => {
                        const centerIndex = 600;
                        const actualIdx = ((index % 12) + 12) % 12;
                        hourScrollRef.current?.scrollTo({ y: (centerIndex + actualIdx) * 50, animated: false });
                      }, 50);
                    }
                  }}
                >
                  {Array.from({ length: 1200 }, (_, i) => {
                    const hour = (i % 12) + 1;
                    return (
                      <TouchableOpacity 
                        key={i} 
                        style={styles.timePickerItem}
                        onPress={() => {
                          const centerIndex = 600;
                          const actualIdx = (i % 12);
                          const targetY = (centerIndex + actualIdx) * 50;
                          hourScrollRef.current?.scrollTo({ y: targetY, animated: true });
                          setSelectedHour(hour);
                        }}
                      >
                        <Text style={[
                          styles.timePickerItemText,
                          selectedHour === hour && styles.timePickerItemTextActive
                        ]}>
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <Text style={styles.timePickerColon}>:</Text>

              {/* 분 선택 */}
              <View style={styles.timePickerColumn}>
                <ScrollView
                  ref={minuteScrollRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={50}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingVertical: 100 }}
                  onMomentumScrollEnd={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 50);
                    const actualIndex = ((index % 12) + 12) % 12;
                    const newMinute = actualIndex * 5;
                    setSelectedMinute(newMinute);
                    // 중앙 위치로 조정 (무한 루프를 위한 중간 위치)
                    const centerIndex = 600;
                    const targetY = (centerIndex + actualIndex) * 50;
                    minuteScrollRef.current?.scrollTo({ y: targetY, animated: false });
                  }}
                  scrollEventThrottle={16}
                  onScroll={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    const index = Math.round(offsetY / 50);
                    const actualIndex = ((index % 12) + 12) % 12;
                    const newMinute = actualIndex * 5;
                    setSelectedMinute(newMinute);
                    
                    // 스크롤이 끝에 가까우면 중앙으로 이동
                    const totalItems = 1200;
                    const itemHeight = 50;
                    const maxScroll = (totalItems - 1) * itemHeight;
                    const currentScroll = offsetY;
                    
                    if (currentScroll < itemHeight * 50) {
                      // 상단에 가까우면 중앙으로 이동 (55분에서 0분으로 순환)
                      setTimeout(() => {
                        const centerIndex = 600;
                        const actualIdx = ((index % 12) + 12) % 12;
                        minuteScrollRef.current?.scrollTo({ y: (centerIndex + actualIdx) * 50, animated: false });
                      }, 50);
                    } else if (currentScroll > maxScroll - itemHeight * 50) {
                      // 하단에 가까우면 중앙으로 이동 (0분에서 55분으로 순환)
                      setTimeout(() => {
                        const centerIndex = 600;
                        const actualIdx = ((index % 12) + 12) % 12;
                        minuteScrollRef.current?.scrollTo({ y: (centerIndex + actualIdx) * 50, animated: false });
                      }, 50);
                    }
                  }}
                >
                  {Array.from({ length: 1200 }, (_, i) => {
                    const minute = (i % 12) * 5;
                    return (
                      <TouchableOpacity 
                        key={i} 
                        style={styles.timePickerItem}
                        onPress={() => {
                          const centerIndex = 600;
                          const actualIdx = (i % 12);
                          const targetY = (centerIndex + actualIdx) * 50;
                          minuteScrollRef.current?.scrollTo({ y: targetY, animated: true });
                          setSelectedMinute(minute);
                        }}
                      >
                        <Text style={[
                          styles.timePickerItemText,
                          selectedMinute === minute && styles.timePickerItemTextActive
                        ]}>
                          {String(minute).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 일정 상세 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={eventDetailModalVisible}
        onRequestClose={() => setEventDetailModalVisible(false)}
      >
        <View style={styles.eventDetailModalOverlay}>
          <View style={styles.eventDetailModalContent}>
            {selectedEventForModal && (() => {
              const ampm = parseInt(selectedEventForModal.time.split(':')[0]) >= 12 ? '오후' : '오전';
              const displayHour = parseInt(selectedEventForModal.time.split(':')[0]);
              const displayMinute = selectedEventForModal.time.split(':')[1];
              const displayHour12 = displayHour > 12 ? displayHour - 12 : displayHour === 0 ? 12 : displayHour;
              const startTimeFormatted = `${ampm} ${displayHour12}:${displayMinute}`;
              
              const endAmpm = parseInt(selectedEventForModal.endTime.split(':')[0]) >= 12 ? '오후' : '오전';
              const endDisplayHour = parseInt(selectedEventForModal.endTime.split(':')[0]);
              const endDisplayMinute = selectedEventForModal.endTime.split(':')[1];
              const endDisplayHour12 = endDisplayHour > 12 ? endDisplayHour - 12 : endDisplayHour === 0 ? 12 : endDisplayHour;
              const endTimeFormatted = `${endAmpm} ${endDisplayHour12}:${endDisplayMinute}`;

              const dateKey = selectedEventForModal.dateKey;
              const [year, month, day] = dateKey.split('-');
              const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              const weekdayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
              const weekdayName = weekdayNames[eventDate.getDay()];
              const dateString = `${year}년 ${month}월 ${day}일`;

              return (
                <>
                  {/* 모달 헤더 */}
                  <View style={styles.eventDetailModalHeader}>
                    <View>
                      <Text style={styles.eventDetailModalWeekday}>{weekdayName}</Text>
                      <Text style={styles.eventDetailModalDate}>{dateString}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setEventDetailModalVisible(false)}
                      style={styles.eventDetailCloseButton}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* 일정 상세 정보 */}
                  <View style={styles.eventDetailContent}>
                    <View style={styles.eventDetailEventBar} />
                    <View style={styles.eventDetailEventInfo}>
                      <Text style={styles.eventDetailEventTitle}>{selectedEventForModal.title}</Text>
                      <Text style={styles.eventDetailEventTime}>
                        {startTimeFormatted} - {endTimeFormatted}
                      </Text>
                      {selectedEventForModal.location && (
                        <View style={styles.eventDetailEventLocationRow}>
                          <Text style={styles.eventDetailEventLocationIcon}>
                            {selectedEventForModal.location.includes('온라인') ? '⊙' : '◎'}
                          </Text>
                          <Text style={styles.eventDetailEventLocation}>{selectedEventForModal.location}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* 삭제 버튼 */}
                  <TouchableOpacity
                    style={styles.eventDetailDeleteButton}
                    onPress={() => {
                      setEventDetailModalVisible(false);
                      openDeleteModal(selectedEventForModal.dateKey, selectedEventForModal.id, selectedEventForModal.title, selectedEventForModal.time);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#f44336" style={{ marginRight: 8 }} />
                    <Text style={styles.eventDetailDeleteButtonText}>일정 삭제</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* 다가오는 이벤트 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={upcomingEventsModalVisible}
        onRequestClose={() => setUpcomingEventsModalVisible(false)}
      >
        <View style={styles.upcomingEventsModalOverlay}>
          <View style={styles.upcomingEventsModalContent}>
            {/* 모달 헤더 */}
            <View style={styles.upcomingEventsModalHeader}>
              <Text style={styles.upcomingEventsModalTitle}>다가오는 이벤트</Text>
              <TouchableOpacity
                onPress={() => setUpcomingEventsModalVisible(false)}
                style={styles.upcomingEventsCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* 이벤트 목록 */}
            <ScrollView style={styles.upcomingEventsList}>
              {getUpcomingEvents().length > 0 ? (
                getUpcomingEvents().map((event, index) => {
                  const eventDate = event.date;
                  const dateString = `${eventDate.getFullYear()}년 ${eventDate.getMonth() + 1}월 ${eventDate.getDate()}일`;
                  const weekdayNames = ['일', '월', '화', '수', '목', '금', '토'];
                  const weekdayName = weekdayNames[eventDate.getDay()];

                  return (
                    <View key={index} style={styles.upcomingEventItem}>
                      <View style={styles.upcomingEventDate}>
                        <Text style={styles.upcomingEventDateText}>{dateString}</Text>
                        <Text style={styles.upcomingEventWeekday}>({weekdayName})</Text>
                      </View>
                      <View style={styles.upcomingEventContent}>
                        <Text style={styles.upcomingEventTitle}>{event.title}</Text>
                        <View style={styles.upcomingEventDetails}>
                          <Ionicons name="time-outline" size={14} color="#666" style={{ marginRight: 8 }} />
                          <Text style={[styles.upcomingEventTime, { marginRight: 8 }]}>{event.time}</Text>
                          {event.location && (
                            <>
                              <Ionicons name="location-outline" size={14} color="#666" style={{ marginRight: 8 }} />
                              <Text style={styles.upcomingEventLocation}>{event.location}</Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.upcomingEventsEmptyState}>
                  <Text style={styles.upcomingEventsEmptyText}>다가오는 이벤트가 없습니다</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 날짜 상세 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={dateDetailModalVisible}
        onRequestClose={() => setDateDetailModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.dateDetailModalOverlay}
          activeOpacity={1}
          onPress={() => setDateDetailModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.dateDetailModalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedDateForModal ? (() => {
              const dateKey = formatDateKey(selectedDateForModal);
              const dateEvents = eventsByDate[dateKey] || [];
              const dayEvents = dailyEvents[dateKey] || [];
              // 시간 순으로 정렬
              const sortedDayEvents = sortEventsByTime(dayEvents);
              const weekdayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
              const weekdayName = weekdayNames[selectedDateForModal.getDay()];
              const dateString = `${selectedDateForModal.getFullYear()}년 ${selectedDateForModal.getMonth() + 1}월 ${selectedDateForModal.getDate()}일`;

              return (
                <View style={styles.dateDetailModalWrapper}>
                  {/* 모달 헤더 */}
                  <View style={styles.dateDetailModalHeader}>
                    <View>
                      <Text style={styles.dateDetailModalWeekday}>{weekdayName}</Text>
                      <Text style={styles.dateDetailModalDate}>{dateString}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setDateDetailModalVisible(false)}
                      style={styles.dateDetailCloseButton}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* 일정 목록 */}
                  <ScrollView 
                    style={styles.dateDetailEventsList}
                    contentContainerStyle={styles.dateDetailEventsListContent}
                  >
                    {sortedDayEvents.length > 0 ? (
                      sortedDayEvents.map((event, index) => {
                        const ampm = parseInt(event.time.split(':')[0]) >= 12 ? '오후' : '오전';
                        const displayHour = parseInt(event.time.split(':')[0]);
                        const displayMinute = event.time.split(':')[1];
                        const displayHour12 = displayHour > 12 ? displayHour - 12 : displayHour === 0 ? 12 : displayHour;
                        const startTimeFormatted = `${ampm} ${displayHour12}:${displayMinute}`;
                        
                        const endAmpm = parseInt(event.endTime.split(':')[0]) >= 12 ? '오후' : '오전';
                        const endDisplayHour = parseInt(event.endTime.split(':')[0]);
                        const endDisplayMinute = event.endTime.split(':')[1];
                        const endDisplayHour12 = endDisplayHour > 12 ? endDisplayHour - 12 : endDisplayHour === 0 ? 12 : endDisplayHour;
                        const endTimeFormatted = `${endAmpm} ${endDisplayHour12}:${endDisplayMinute}`;

                        return (
                          <View key={index} style={styles.dateDetailEventItem}>
                            <View style={styles.dateDetailEventBar} />
                            <View style={styles.dateDetailEventContent}>
                              <Text style={styles.dateDetailEventTitle}>{event.title}</Text>
                              <Text style={styles.dateDetailEventTime}>
                                {startTimeFormatted} - {endTimeFormatted}
                              </Text>
                              {event.location && (
                                <Text style={styles.dateDetailEventLocation}>{event.location}</Text>
                              )}
                            </View>
                            <TouchableOpacity
                              style={styles.dateDetailDeleteButton}
                              onPress={() => {
                                const eventId = event.id;
                                const eventTitle = event.title;
                                const eventTime = event.time;
                                openDeleteModal(dateKey, eventId, eventTitle, eventTime);
                                setDateDetailModalVisible(false);
                              }}
                            >
                              <Text style={styles.dateDetailDeleteText}>🗑️</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })
                    ) : (
                      <View style={styles.dateDetailEmptyState}>
                        <Text style={styles.dateDetailEmptyText}>등록된 일정이 없습니다</Text>
                      </View>
                    )}
                  </ScrollView>

                  {/* 일정 추가 버튼 - 항상 고정 */}
                  <View style={styles.dateDetailAddButtonContainer}>
                    <TouchableOpacity
                      style={styles.dateDetailAddButton}
                      onPress={() => {
                        setDateDetailModalVisible(false);
                        setEventDate(formatDateKey(selectedDateForModal));
                        setModalVisible(true);
                      }}
                    >
                      <Ionicons name="add" size={20} color="#9C27B0" style={{ marginRight: 8 }} />
                      <Text style={styles.dateDetailAddButtonText}>일정 추가</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })() : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
