import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './LoginScreen.styles';
import { useApp } from '../context/AppContext';

export default function LoginScreen({ navigation }) {
  const { loginWithPhone } = useApp();
  
  // 전화번호 입력
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // 로그인 또는 회원가입 모드
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // 전화번호 포맷팅 (하이픈 자동 추가)
  const formatPhoneNumber = (text) => {
    // 숫자만 추출
    const numbers = text.replace(/[^0-9]/g, '');
    
    // 최대 11자리로 제한
    const limitedNumbers = numbers.slice(0, 11);
    
    // 하이픈 추가
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  // 전화번호 유효성 검사
  const validatePhone = (phoneNumber) => {
    // 하이픈 제거 후 숫자만 추출
    const numbers = phoneNumber.replace(/[^0-9]/g, '');
    
    // 10자리 또는 11자리 숫자인지 확인
    if (numbers.length < 10 || numbers.length > 11) {
      return false;
    }
    
    // 010으로 시작하는지 확인
    if (!numbers.startsWith('010')) {
      return false;
    }
    
    return true;
  };

  // 비밀번호 유효성 검사 (최소 6자)
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // 전화번호 + 비밀번호 로그인 처리
  const handleLogin = async () => {
    // 입력값 검증
    if (!phone.trim()) {
      Alert.alert('알림', '전화번호를 입력해주세요.');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('알림', '올바른 전화번호 형식이 아닙니다.\n010-XXXX-XXXX 형식으로 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('알림', '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (isSignUp && !name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 전화번호에서 하이픈 제거
      const phoneNumber = phone.replace(/[^0-9]/g, '');
      
      await loginWithPhone(
        phoneNumber,
        password,
        isSignUp,
        {
          name: name.trim(),
        }
      );
    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('오류', error.message || '로그인 중 오류가 발생했습니다.\n다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 소셜 로그인 처리 - 주석 처리 (이메일 로그인 구현 전까지 비활성화)
  // const handleSocialLogin = async (provider, signInFunction) => {
  //   setSocialLoading(provider);
  //   try {
  //     const result = await signInFunction();
  //     
  //     if (result.success && result.user) {
  //       // 소셜 로그인 성공 - AppContext에서 처리
  //       await loginWithSocial(result.user);
  //     } else {
  //       Alert.alert('로그인 실패', result.error || '소셜 로그인에 실패했습니다.');
  //     }
  //   } catch (error) {
  //     console.error(`${provider} 로그인 오류:`, error);
  //     Alert.alert('오류', '로그인 중 오류가 발생했습니다.\n다시 시도해주세요.');
  //   } finally {
  //     setSocialLoading(null);
  //   }
  // };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* 로고/제목 영역 */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={80} color="#9C27B0" />
            </View>
            <Text style={styles.title}>학부모 전용 앱</Text>
            <Text style={styles.subtitle}>자녀의 학습 정보를 확인하세요</Text>
          </View>

          {/* 전화번호 + 비밀번호 로그인 폼 */}
          <View style={styles.form}>
            {/* 전화번호 입력 */}
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="전화번호 (010-XXXX-XXXX)"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={13}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={false}
              />
            </View>

            {/* 회원가입일 때 이름 입력 */}
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="이름"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoFocus={false}
                />
              </View>
            )}

            {/* 비밀번호 입력 */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 (최소 6자)"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>
                    {isSignUp ? '회원가입' : '로그인'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.loginIcon} />
                </>
              )}
            </TouchableOpacity>

            {/* 로그인/회원가입 전환 */}
            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setPassword('');
              }}
            >
              <Text style={styles.switchModeText}>
                {isSignUp
                  ? '이미 계정이 있으신가요? 로그인'
                  : '계정이 없으신가요? 회원가입'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 안내 문구 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              전화번호와 비밀번호로 로그인하여\n자녀 정보를 확인할 수 있습니다
            </Text>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
