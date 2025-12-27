import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AcademyScreen.styles';

export default function AcademyScreen({ route, navigation }) {
  // route.params에서 학원 정보를 가져옴
  const { academy } = route.params || {
    academy: {
      id: '1',
      name: 'XYZ 학원',
      subject: '수학, 영어',
      logo: '📚',
      address: '서울시 강남구 역삼동 456',
      phone: '02-9876-5432',
    },
  };


  const InfoCard = ({ title, icon, children }) => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={24} color="#9C27B0" />
        <Text style={styles.cardTitle}>{title}</Text>
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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>학원 정보</Text>
        </View>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>{academy.logo || '📚'}</Text>
          </View>
          <Text style={styles.name}>{academy.name}</Text>
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectText}>{academy.subject}</Text>
          </View>
        </View>

        {/* 학원 상세 정보 */}
        <InfoCard title="학원 정보" icon="information-circle">
          <InfoRow label="학원명" value={academy.name} />
          <InfoRow label="과목" value={academy.subject} />
          {academy.phone && (
            <InfoRow label="전화번호" value={academy.phone} />
          )}
        </InfoCard>

        {/* 주소 정보 */}
        {academy.address && (
          <InfoCard title="주소" icon="location">
            <Text style={styles.addressText}>{academy.address}</Text>
          </InfoCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
