import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ApiError,
  AppShell,
  BrandLogo,
  Icon,
  Notice,
  authApi,
} from '@dairy/shared';
import { deliveryRoutes } from '../delivery-routes';
import { useNavigate } from '../router';

export function DeliveryForgotPasswordScreen() {
  const navigate = useNavigate();

  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const handleSendOtp = async () => {
    if (pending) return;
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your registered rider email address.');
      return;
    }

    setPending(true);
    try {
      const res = await authApi.sendResetOtp({ email: trimmed });
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      setStep('OTP');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Could not send OTP.');
      } else {
        setError(err instanceof Error ? err.message : 'Could not reach server. Please try again.');
      }
    } finally {
      setPending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (pending) return;
    setError(null);

    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    if (trimmedOtp.length !== 6) {
      setError('OTP must be exactly 6 digits.');
      return;
    }

    setPending(true);
    try {
      const res = await authApi.verifyResetOtp({
        email: email.trim(),
        otp: trimmedOtp,
      });

      // Navigate to separate Screen 2 (Reset Password)
      navigate(
        `${deliveryRoutes.resetPassword}?email=${encodeURIComponent(email.trim())}&token=${encodeURIComponent(res.resetToken)}`,
        { replace: true },
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Invalid or expired OTP.');
      } else {
        setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <AppShell statusLight>
      <KeyboardAvoidingView
        style={styles.keyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.ambientTopGlow} pointerEvents="none" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Row: Back Button */}
          <View style={styles.topNavRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              onPress={() => {
                if (step === 'OTP') {
                  setStep('EMAIL');
                  setError(null);
                } else {
                  navigate(deliveryRoutes.login);
                }
              }}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            >
              <Icon name="arrowLeft" size={22} color="#141518" strokeWidth={2.4} />
            </Pressable>
          </View>

          {/* Top Brand Emblem Badge */}
          <View style={styles.topBadgeWrap}>
            <View style={styles.brandBadge}>
              <BrandLogo size={66} variant="circle" />
            </View>
          </View>

          {/* Heading Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headingTitle}>
              {step === 'EMAIL' ? 'Forgot Password' : 'Verify Rider OTP'}
            </Text>
            <Text style={styles.headingSubtitle}>
              {step === 'EMAIL'
                ? 'Enter your rider email to receive a secure OTP code'
                : `Enter the 6-digit verification code sent to ${email.trim()}`}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {error ? (
              <Notice tone="error" icon="alert">
                {error}
              </Notice>
            ) : null}

            {step === 'OTP' && devOtpHint ? (
              <View style={styles.otpBanner}>
                <Icon name="check" size={16} color="#059669" strokeWidth={2.4} />
                <Text style={styles.otpBannerText}>
                  Testing OTP: <Text style={styles.otpCodeBold}>{devOtpHint}</Text>
                </Text>
              </View>
            ) : null}

            {step === 'EMAIL' ? (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Rider Email *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="rider@dairyfresh.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={setEmail}
                      editable={!pending}
                      onSubmitEditing={() => void handleSendOtp()}
                    />
                  </View>
                </View>

                {/* Primary CTA: Send OTP */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Send OTP"
                  disabled={pending}
                  onPress={() => void handleSendOtp()}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
                    pending && { opacity: 0.7 },
                  ]}
                >
                  {pending ? (
                    <ActivityIndicator size="small" color="#CCFF00" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Send OTP</Text>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>6-Digit OTP *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.textInput, styles.otpInput]}
                      placeholder="••••••"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                      value={otp}
                      onChangeText={setOtp}
                      editable={!pending}
                      onSubmitEditing={() => void handleVerifyOtp()}
                    />
                  </View>
                </View>

                {/* Primary CTA: Verify OTP */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Verify OTP"
                  disabled={pending}
                  onPress={() => void handleVerifyOtp()}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
                    pending && { opacity: 0.7 },
                  ]}
                >
                  {pending ? (
                    <ActivityIndicator size="small" color="#CCFF00" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Verify OTP</Text>
                  )}
                </Pressable>

                {/* Resend & Change Email Row */}
                <View style={styles.metaActionRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Resend OTP"
                    hitSlop={8}
                    disabled={pending}
                    onPress={() => void handleSendOtp()}
                  >
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Change Email"
                    hitSlop={8}
                    disabled={pending}
                    onPress={() => {
                      setStep('EMAIL');
                      setOtp('');
                      setError(null);
                    }}
                  >
                    <Text style={styles.changeEmailText}>Change Email</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          {/* Footer Back to Login */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Back to sign in? </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign In"
              onPress={() => navigate(deliveryRoutes.login)}
              hitSlop={6}
            >
              <Text style={styles.footerLink}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  ambientTopGlow: {
    position: 'absolute',
    top: -120,
    left: '15%',
    right: '15%',
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBadgeWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerSection: {
    marginBottom: 28,
    alignItems: 'center',
  },
  headingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#141518',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  inputContainer: {
    height: 52,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 15,
    color: '#141518',
    padding: 0,
  },
  otpInput: {
    fontSize: 20,
    letterSpacing: 6,
    textAlign: 'center',
    fontWeight: '700',
  },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#141518',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CCFF00',
    letterSpacing: 0.2,
  },
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  otpBannerText: {
    fontSize: 13,
    color: '#065F46',
  },
  otpCodeBold: {
    fontWeight: '800',
    fontSize: 14,
    color: '#047857',
  },
  metaActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141518',
  },
  changeEmailText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
  },
  footerPrompt: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141518',
  },
});
