import { Text, View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { styles } from './NotificationsScreen.styles';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>알림</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>새로운 알림이 없습니다.</Text>
        </View>
      </ScrollView>
    </View>
  );
}


