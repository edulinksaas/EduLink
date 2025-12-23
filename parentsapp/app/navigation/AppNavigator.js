import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import ChildScreen from '../screens/ChildScreen';
import AcademyScreen from '../screens/AcademyScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn, isLoadingAuth } = useApp();

  // 인증 상태 확인 중일 때 로딩 화면 표시
  if (isLoadingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isLoggedIn ? (
        // 로그인되지 않은 경우 로그인 화면 표시
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            headerShown: false,
            animationTypeForReplace: isLoggedIn ? 'push' : 'pop',
          }}
        />
      ) : (
        // 로그인된 경우 메인 화면들 표시
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen 
            name="Child" 
            component={ChildScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Academy" 
            component={AcademyScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
