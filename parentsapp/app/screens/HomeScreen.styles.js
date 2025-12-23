import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  // 자녀 선택 탭 - 고정
  childTabsFixed: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  // 자녀 선택 탭
  childTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  childTab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  childTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#9C27B0',
  },
  childTabText: {
    fontSize: 16,
    color: '#666',
  },
  childTabTextActive: {
    color: '#9C27B0',
    fontWeight: '600',
  },
  // 상단 카드
  topCards: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  topCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  topCardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  attendanceRate: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  feedbackText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 12,
    flex: 1,
  },
  detailButton: {
    backgroundColor: '#f3e5f5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  detailButtonText: {
    fontSize: 12,
    color: '#9C27B0',
    fontWeight: '500',
  },
  // 현재 일정 섹션
  scheduleSection: {
    marginBottom: 24,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 22,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentTime: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    lineHeight: 22,
  },
  refreshIcon: {
    fontSize: 16,
    lineHeight: 22,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    lineHeight: 22,
  },
  scheduleContainer: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: 60,
    marginRight: 12,
  },
  timeSlot: {
    height: 60,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  scheduleColumn: {
    flex: 1,
  },
  scheduleBlock: {
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minHeight: 50,
    justifyContent: 'center',
  },
  scheduleTime: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 4,
    fontWeight: '600',
  },
  scheduleTitle: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  // 빠른 요청 섹션
  quickRequestSection: {
    marginBottom: 20,
  },
  quickRequestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickRequestButton: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickRequestIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  absentIcon: {
    backgroundColor: '#ffebee',
  },
  tardyIcon: {
    backgroundColor: '#f3e5f5',
  },
  illnessIcon: {
    backgroundColor: '#f3e5f5',
  },
  inquiryIcon: {
    backgroundColor: '#f3e5f5',
  },
  quickRequestIconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickRequestText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalInputText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#999',
  },
  calendarIcon: {
    fontSize: 16,
    marginRight: 8,
    lineHeight: 20,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 4,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#f3e5f5',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#9C27B0',
    fontWeight: '600',
  },
  modalTextArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // 출석률 상세 모달 스타일
  attendanceSummary: {
    backgroundColor: '#f3e5f5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  attendanceSummaryTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  attendanceSummaryRate: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 8,
  },
  attendanceSummarySubtext: {
    fontSize: 12,
    color: '#666',
  },
  attendanceList: {
    marginBottom: 20,
  },
  attendanceListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  attendanceItemLeft: {
    flex: 1,
  },
  attendanceAcademy: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  attendanceTime: {
    fontSize: 12,
    color: '#666',
  },
  attendanceStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  attendanceStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // 피드백 상세 모달 스타일
  feedbackList: {
    marginBottom: 20,
  },
  feedbackListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  feedbackItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  feedbackContent: {
    marginBottom: 12,
    minHeight: 50,
  },
  feedbackSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  feedbackDateTime: {
    fontSize: 12,
    color: '#999',
  },
  feedbackTeacher: {
    fontSize: 12,
    color: '#9C27B0',
    fontWeight: '500',
  },
  // 피드백 자세히 보기 모달 스타일
  feedbackDetailContent: {
    flex: 1,
  },
  feedbackDetailHeader: {
    marginBottom: 16,
  },
  feedbackDetailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  feedbackDetailAcademy: {
    fontSize: 16,
    color: '#9C27B0',
    fontWeight: '500',
  },
  feedbackDetailInfo: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  feedbackDetailDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackDetailTime: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  feedbackDetailDate: {
    fontSize: 14,
    color: '#666',
  },
  feedbackDetailTextContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  feedbackDetailText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  feedbackDetailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  replyButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  replyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  feedbackDetailTeacher: {
    fontSize: 14,
    color: '#9C27B0',
    fontWeight: '500',
  },
});
