import nodemailer from 'nodemailer';

/**
 * 이메일 발송 서비스
 */

// 이메일 전송기 설정
const createTransporter = () => {
  // 환경 변수에서 이메일 설정 가져오기
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  // 개발 환경에서 이메일 설정이 없으면 콘솔에만 출력
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    console.warn('\n⚠️ 이메일 설정이 없습니다. 이메일은 콘솔에만 출력됩니다.');
    console.warn('   .env 파일에 SMTP_USER와 SMTP_PASSWORD를 설정하세요.');
    console.warn('   Gmail 사용 시: https://myaccount.google.com/apppasswords 에서 앱 비밀번호 생성\n');
    return null;
  }

  // 설정 확인 로그
  console.log('\n📧 이메일 발송 설정 확인:');
  console.log(`   SMTP Host: ${emailConfig.host}`);
  console.log(`   SMTP Port: ${emailConfig.port}`);
  console.log(`   SMTP User: ${emailConfig.auth.user}`);
  console.log(`   SMTP Password: ${emailConfig.auth.pass ? '***설정됨***' : '없음'}\n`);

  try {
    const transporter = nodemailer.createTransport(emailConfig);
    
    // 연결 테스트 (선택사항)
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ SMTP 연결 테스트 실패:', error.message);
        if (error.code === 'EAUTH') {
          console.error('   💡 Gmail 인증 오류: 앱 비밀번호를 확인하세요.');
        }
      } else {
        console.log('✅ SMTP 연결 테스트 성공\n');
      }
    });
    
    return transporter;
  } catch (error) {
    console.error('이메일 전송기 생성 실패:', error);
    return null;
  }
};

/**
 * 이메일 인증 링크 발송
 * @param {string} to - 수신자 이메일
 * @param {string} verificationToken - 인증 토큰
 * @param {string} academyName - 학원 이름
 * @returns {Promise<boolean>} 발송 성공 여부
 */
export const sendVerificationEmail = async (to, verificationToken, academyName, academyCode) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || '학원 관리 시스템'}" <${process.env.SMTP_USER}>`,
    to: to,
    subject: '[학원 관리 시스템] 이메일 인증을 완료해주세요',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 30px;
            margin: 20px 0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 10px;
          }
          .title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            color: #4b5563;
            margin-bottom: 30px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }
          .button:hover {
            opacity: 0.9;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }
          .link {
            color: #6366f1;
            word-break: break-all;
            font-size: 12px;
            margin-top: 20px;
            padding: 10px;
            background-color: #f3f4f6;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
          }
          .academy-info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
          .academy-info h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
            font-weight: 600;
          }
          .academy-code {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
          }
          .steps {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
          }
          .step-number {
            background-color: #6366f1;
            color: #ffffff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 12px;
            flex-shrink: 0;
          }
          .step-content {
            flex: 1;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">학원 관리 시스템</div>
          </div>
          
          <div class="title">이메일 인증을 완료해주세요</div>
          
          <div class="content">
            <p>안녕하세요, <strong>${academyName}</strong>님!</p>
            <p>회원가입이 완료되었습니다. 아래 학원 정보를 확인하시고 이메일 인증을 완료해주세요.</p>
            
            ${academyCode ? `
            <div class="academy-info">
              <h3>📚 등록된 학원 정보</h3>
              <div style="margin: 15px 0;">
                <div style="font-size: 16px; margin-bottom: 8px;">학원명</div>
                <div style="font-size: 20px; font-weight: 600;">${academyName}</div>
              </div>
              <div style="margin: 15px 0;">
                <div style="font-size: 16px; margin-bottom: 8px;">학원 코드</div>
                <div class="academy-code">${academyCode}</div>
                <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">로그인 시 이 코드가 필요합니다</div>
              </div>
            </div>
            ` : ''}
            
            <div class="steps">
              <h3 style="margin-top: 0; margin-bottom: 15px; color: #1f2937;">📋 인증 절차</h3>
              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <strong>이메일 인증 완료</strong><br>
                  아래 버튼을 클릭하여 이메일 인증을 완료하세요.
                </div>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <strong>로그인</strong><br>
                  인증 완료 후 학원 코드와 비밀번호로 로그인하세요.
                </div>
              </div>
            </div>
            
            <div class="button-container">
              <a href="${verificationLink}" class="button">✅ 이메일 인증하기</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ 주의사항:</strong><br>
              • 이 링크는 24시간 후 만료됩니다. 만료되면 다시 인증 이메일을 요청해주세요.<br>
              • 학원 코드(<strong>${academyCode || '확인 필요'}</strong>)는 로그인 시 필요하니 안전하게 보관하세요.
            </div>
            
            <p style="margin-top: 25px;">버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
            <div class="link">${verificationLink}</div>
          </div>
          
          <div class="footer">
            <p>이 이메일은 자동으로 발송되었습니다. 회원가입을 요청하지 않으셨다면 무시하셔도 됩니다.</p>
            <p>&copy; ${new Date().getFullYear()} 학원 관리 시스템. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
학원 관리 시스템 - 이메일 인증

안녕하세요, ${academyName}님!

회원가입이 완료되었습니다. 아래 정보를 확인하시고 이메일 인증을 완료해주세요.

📚 등록된 학원 정보
학원명: ${academyName}
${academyCode ? `학원 코드: ${academyCode}\n(로그인 시 이 코드가 필요합니다)` : ''}

📋 인증 절차
1. 이메일 인증 완료: 아래 링크를 클릭하여 이메일 인증을 완료하세요.
2. 로그인: 인증 완료 후 학원 코드와 비밀번호로 로그인하세요.

인증 링크:
${verificationLink}

⚠️ 주의사항
• 이 링크는 24시간 후 만료됩니다.
${academyCode ? `• 학원 코드(${academyCode})는 로그인 시 필요하니 안전하게 보관하세요.` : ''}

이 이메일은 자동으로 발송되었습니다. 회원가입을 요청하지 않으셨다면 무시하셔도 됩니다.
    `.trim(),
  };

  const transporter = createTransporter();

  // 개발 환경에서 이메일 설정이 없으면 콘솔에만 출력
  if (!transporter) {
    console.log('\n📧 [개발 모드] 이메일 인증 링크:');
    console.log(`   수신자: ${to}`);
    console.log(`   학원명: ${academyName}`);
    if (academyCode) {
      console.log(`   학원 코드: ${academyCode}`);
    }
    console.log(`   인증 링크: ${verificationLink}`);
    console.log(`   토큰: ${verificationToken}\n`);
    return true; // 개발 모드에서는 성공으로 처리
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('\n✅ 이메일 발송 성공!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   수신자: ${to}`);
    console.log(`   발신자: ${mailOptions.from}`);
    console.log(`   응답: ${info.response || 'N/A'}\n`);
    return true;
  } catch (error) {
    console.error('\n❌ 이메일 발송 실패!');
    console.error('   수신자:', to);
    console.error('   발신자:', mailOptions.from);
    console.error('   에러 코드:', error.code);
    console.error('   에러 메시지:', error.message);
    
    // Gmail 관련 에러 메시지 안내
    if (error.code === 'EAUTH' || error.message.includes('Invalid login')) {
      console.error('\n💡 Gmail 인증 오류 해결 방법:');
      console.error('   1. Gmail 계정에서 2단계 인증이 활성화되어 있는지 확인');
      console.error('   2. 앱 비밀번호를 생성했는지 확인');
      console.error('   3. .env 파일의 SMTP_PASSWORD에 앱 비밀번호를 올바르게 입력했는지 확인');
      console.error('   4. 앱 비밀번호는 공백 없이 입력해야 합니다\n');
    } else if (error.code === 'ECONNECTION' || error.message.includes('connection')) {
      console.error('\n💡 연결 오류 해결 방법:');
      console.error('   1. 인터넷 연결 확인');
      console.error('   2. 방화벽에서 포트 587이 차단되지 않았는지 확인');
      console.error('   3. SMTP_HOST와 SMTP_PORT 설정 확인\n');
    }
    
    // 개발 환경에서는 에러를 던지지 않고 콘솔에만 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 [개발 모드] 이메일 인증 링크 (발송 실패, 콘솔 출력):');
      console.log(`   수신자: ${to}`);
      console.log(`   학원명: ${academyName}`);
      console.log(`   인증 링크: ${verificationLink}`);
      console.log(`   토큰: ${verificationToken}\n`);
      return true;
    }
    
    return false;
  }
};

/**
 * 비밀번호 재설정 이메일 발송
 * @param {string} to - 수신자 이메일
 * @param {string} resetToken - 재설정 토큰
 * @param {string} academyName - 학원 이름
 * @returns {Promise<boolean>} 발송 성공 여부
 */
export const sendPasswordResetEmail = async (to, resetToken, academyName) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || '학원 관리 시스템'}" <${process.env.SMTP_USER}>`,
    to: to,
    subject: '[학원 관리 시스템] 비밀번호 재설정',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .warning {
            background-color: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>비밀번호 재설정</h2>
          <p>안녕하세요, ${academyName}님!</p>
          <p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">비밀번호 재설정하기</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ 주의사항:</strong><br>
            이 링크는 1시간 후 만료됩니다. 비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.
          </div>
          
          <p>버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
          <p style="word-break: break-all; font-size: 12px; color: #666;">${resetLink}</p>
        </div>
      </body>
      </html>
    `,
  };

  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n📧 [개발 모드] 비밀번호 재설정 링크:');
    console.log(`   수신자: ${to}`);
    console.log(`   재설정 링크: ${resetLink}\n`);
    return true;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ 비밀번호 재설정 이메일 발송 성공');
    return true;
  } catch (error) {
    console.error('❌ 비밀번호 재설정 이메일 발송 실패:', error);
    return false;
  }
};

