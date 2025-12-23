import { Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createStudent } from '../lib/supabaseStudents';
import { upsertParentAcademy } from '../lib/supabaseParentAcademies';
import { styles } from './ProfileScreen.styles';

export default function ProfileScreen({ navigation }) {
  const {
    personalInfo,
    learningInstitution,
    childrenList,
    updatePersonalInfo,
    updateLearningInstitution,
    refreshChildrenList,
  } = useApp();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditInstitutionModalVisible, setIsEditInstitutionModalVisible] = useState(false);
  const [isAddChildModalVisible, setIsAddChildModalVisible] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [institutionFormData, setInstitutionFormData] = useState({
    name: '',
    type: '',
    address: '',
    phone: '',
    floor: '',
  });
  const [childFormData, setChildFormData] = useState({
    name: '',
    note: '',
  });

  const handleEditPersonalInfo = () => {
    setEditFormData({
      name: personalInfo.name,
      email: personalInfo.email,
      phone: personalInfo.phone,
      address: personalInfo.address,
    });
    setIsEditModalVisible(true);
  };

  const handleSavePersonalInfo = () => {
    updatePersonalInfo({
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      address: editFormData.address,
    });
    setIsEditModalVisible(false);
    // 여기에 실제 API 호출 로직을 추가할 수 있습니다
    console.log('개인 정보 저장:', editFormData);
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
  };

  const handleEditInstitutionInfo = () => {
    setInstitutionFormData({
      name: learningInstitution.name || '',
      type: learningInstitution.type || '',
      address: learningInstitution.address || '',
      phone: learningInstitution.phone || '',
      floor: learningInstitution.floor || '',
    });
    setIsEditInstitutionModalVisible(true);
  };

  const handleSaveInstitutionInfo = async () => {
    if (!personalInfo.phone) {
      Alert.alert('알림', '학부모 연락처가 설정되지 않았습니다.');
      return;
    }

    try {
      const updated = await upsertParentAcademy(personalInfo.phone, {
        name: institutionFormData.name.trim() || '',
        type: institutionFormData.type.trim() || '',
        address: institutionFormData.address.trim() || '',
        phone: institutionFormData.phone.trim() || '',
        floor: institutionFormData.floor.trim() || null,
      });

      if (updated) {
        // Context 업데이트
        updateLearningInstitution({
          name: institutionFormData.name.trim() || '',
          type: institutionFormData.type.trim() || '',
          address: institutionFormData.address.trim() || '',
          phone: institutionFormData.phone.trim() || '',
          floor: institutionFormData.floor.trim() || '',
        });
        Alert.alert('성공', '학습 기관 정보가 수정되었습니다.');
        setIsEditInstitutionModalVisible(false);
      } else {
        Alert.alert('오류', '학습 기관 정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('학습 기관 정보 수정 오류:', error);
      Alert.alert('오류', '학습 기관 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleCancelEditInstitution = () => {
    setIsEditInstitutionModalVisible(false);
    setInstitutionFormData({
      name: '',
      type: '',
      address: '',
      phone: '',
      floor: '',
    });
  };

  const handleAddChild = () => {
    setChildFormData({
      name: '',
      note: '',
    });
    setIsAddChildModalVisible(true);
  };

  const handleSaveChild = async () => {
    if (!childFormData.name.trim()) {
      Alert.alert('알림', '자녀 이름을 입력해주세요.');
      return;
    }

    if (!personalInfo.phone) {
      Alert.alert('알림', '학부모 연락처가 설정되지 않았습니다.');
      return;
    }

    try {
      const newStudent = await createStudent({
        name: childFormData.name.trim(),
        parent_contact: personalInfo.phone,
        note: childFormData.note.trim() || null,
        academy_id: null, // 필요시 나중에 추가
      });

      if (newStudent) {
        Alert.alert('성공', '자녀 정보가 추가되었습니다.');
        setIsAddChildModalVisible(false);
        setChildFormData({ name: '', note: '' });
        // 자녀 목록 새로고침
        if (refreshChildrenList) {
          await refreshChildrenList();
        }
      } else {
        Alert.alert('오류', '자녀 정보 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('자녀 추가 오류:', error);
      Alert.alert('오류', '자녀 정보 추가 중 오류가 발생했습니다.');
    }
  };

  const handleCancelAddChild = () => {
    setIsAddChildModalVisible(false);
    setChildFormData({ name: '', note: '' });
  };

  const InfoCard = ({ title, icon, children, showEditButton, onEdit, showAddButton, onAdd }) => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={24} color="#9C27B0" />
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.cardHeaderButtons}>
          {showAddButton && (
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={onAdd}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color="#9C27B0" />
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          )}
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="auto" />
      {/* 프로필 제목 - 고정 */}
      <View style={styles.titleFixed}>
        <Text style={styles.title}>프로필</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 개인 정보 */}
        <InfoCard 
          title="개인 정보" 
          icon="person"
          showEditButton={true}
          onEdit={handleEditPersonalInfo}
        >
          <InfoRow label="이름" value={personalInfo.name} />
          <InfoRow label="이메일" value={personalInfo.email} />
          <InfoRow label="전화번호" value={personalInfo.phone} />
          <InfoRow label="주소" value={personalInfo.address} />
        </InfoCard>

        {/* 자녀 목록 */}
        <InfoCard 
          title="자녀 목록" 
          icon="link"
          showAddButton={true}
          onAdd={handleAddChild}
        >
          {(() => {
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
            
            return sortedChildrenList.length > 0 ? (
              sortedChildrenList.map((child) => (
              <TouchableOpacity 
                key={child.id}
                style={styles.childItem}
                onPress={() => navigation.navigate('Child', {
                  childName: child.name,
                  childId: child.id,
                  status: child.status,
                })}
                activeOpacity={0.7}
              >
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.statusEmoji}>
                  {child.status === '연동됨' ? 'o' : 'x'}
                </Text>
              </TouchableOpacity>
            ))
            ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>등록된 자녀가 없습니다.</Text>
              <Text style={styles.emptyStateSubText}>우측 상단의 '추가' 버튼을 눌러 자녀를 추가하세요.</Text>
            </View>
            );
          })()}
        </InfoCard>

        {/* 학습 기관 정보 */}
        <InfoCard 
          title="학습 기관 정보" 
          icon="school"
          showEditButton={true}
          onEdit={handleEditInstitutionInfo}
        >
          <InfoRow label="기관명" value={learningInstitution.name} />
          <InfoRow label="유형" value={learningInstitution.type} />
          <InfoRow label="주소" value={learningInstitution.address} />
          <InfoRow label="층수" value={learningInstitution.floor} />
          <InfoRow label="전화번호" value={learningInstitution.phone} />
        </InfoCard>
      </ScrollView>

      {/* 개인 정보 수정 모달 */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>개인 정보 수정</Text>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이름</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  placeholder="이름을 입력하세요"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>이메일</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.email}
                  onChangeText={(text) => setEditFormData({ ...editFormData, email: text })}
                  placeholder="이메일을 입력하세요"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>전화번호</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                  placeholder="전화번호를 입력하세요"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>주소</Text>
                <TextInput
                  style={styles.input}
                  value={editFormData.address}
                  onChangeText={(text) => setEditFormData({ ...editFormData, address: text })}
                  placeholder="주소를 입력하세요"
                  multiline
                />
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
                onPress={handleSavePersonalInfo}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 자녀 추가 모달 */}
      <Modal
        visible={isAddChildModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelAddChild}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>자녀 추가</Text>
              <TouchableOpacity onPress={handleCancelAddChild} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>자녀 이름 *</Text>
                <TextInput
                  style={styles.input}
                  value={childFormData.name}
                  onChangeText={(text) => setChildFormData({ ...childFormData, name: text })}
                  placeholder="자녀 이름을 입력하세요"
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>특이사항</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={childFormData.note}
                  onChangeText={(text) => setChildFormData({ ...childFormData, note: text })}
                  placeholder="특이사항을 입력하세요 (선택사항)"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color="#666" />
                <Text style={styles.infoBoxText}>
                  자녀 정보는 Supabase에 저장되며, 학원에서 관리하는 학생 정보와 연동됩니다.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { marginRight: 12 }]} 
                onPress={handleCancelAddChild}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveChild}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 학습 기관 정보 수정 모달 */}
      <Modal
        visible={isEditInstitutionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEditInstitution}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>학습 기관 정보 수정</Text>
              <TouchableOpacity onPress={handleCancelEditInstitution} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>기관명</Text>
                <TextInput
                  style={styles.input}
                  value={institutionFormData.name}
                  onChangeText={(text) => setInstitutionFormData({ ...institutionFormData, name: text })}
                  placeholder="기관명을 입력하세요"
                  autoFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>유형</Text>
                <TextInput
                  style={styles.input}
                  value={institutionFormData.type}
                  onChangeText={(text) => setInstitutionFormData({ ...institutionFormData, type: text })}
                  placeholder="예: 학원, 과외, 온라인 등"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>주소</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={institutionFormData.address}
                  onChangeText={(text) => setInstitutionFormData({ ...institutionFormData, address: text })}
                  placeholder="학습 기관 주소를 입력하세요"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>층수</Text>
                <TextInput
                  style={styles.input}
                  value={institutionFormData.floor}
                  onChangeText={(text) => setInstitutionFormData({ ...institutionFormData, floor: text })}
                  placeholder="예: 3층"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>전화번호</Text>
                <TextInput
                  style={styles.input}
                  value={institutionFormData.phone}
                  onChangeText={(text) => setInstitutionFormData({ ...institutionFormData, phone: text })}
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
                onPress={handleCancelEditInstitution}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveInstitutionInfo}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
