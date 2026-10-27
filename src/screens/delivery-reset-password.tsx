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
import { useNavigate, useParams } from '../router';

export function DeliveryResetPasswordScreen() {
  const navigate = useNavigate();
  const { email: paramEmail, token: paramToken } = useParams<{ email?: string; token?: string }>();

  const email = (paramEmail || '').trim();
  const resetToken = (paramToken || '').trim();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    if (pending) return;
    setError(null);
    setSuccess(null);

    if (!resetToken) {
      setError('Invalid or expired reset session. Please request a new OTP.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify and re-enter.');
      return;
    }

    setPending(true);
    try {
      await authApi.resetPassword({
        email,
        resetToken,
        newPassword,
      });

      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate(deliveryRoutes.login, { replace: true });
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Could not reset password.');
      } else {
        setError(err instanceof Error ? err.message : 'Could not reset password. Please try again.');
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
              onPress={() => navigate(deliveryRoutes.forgotPassword)}
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
            <Text style={styles.headingTitle}>Set New Password</Text>
            <Text style={styles.headingSubtitle}>
              {email ? `Create a new rider password for ${email}` : 'Create a secure new password for your rider account.'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {error ? (
              <Notice tone="error" icon="alert">
                {error}
              </Notice>
            ) : null}

            {success ? (
              <View style={styles.successBanner}>
                <Icon name="check" size={16} color="#059669" strokeWidth={2.4} />
                <Text style={styles.successBannerText}>{success}</Text>
              </View>
            ) : null}

            {/* New Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>New Password *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!pending}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showNewPassword ? 'Hide password' : 'Show password'}
                  hitSlop={10}
                  onPress={() => setShowNewPassword((prev) => !prev)}
                  style={styles.eyeBtn}
                >
                  <Icon
                    name={showNewPassword ? 'eyeOff' : 'eye'}
                    size={20}
                    color="#9CA3AF"
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Confirm New Password *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!pending}
                  onSubmitEditing={() => void handleSubmit()}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                  hitSlop={10}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.eyeBtn}
                >
                  <Icon
                    name={showConfirmPassword ? 'eyeOff' : 'eye'}
                    size={20}
                    color="#9CA3AF"
                  />
                </Pressable>
              </View>
            </View>

            {/* Primary CTA: Save New Password */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save New Password"
              disabled={pending}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
                pending && { opacity: 0.7 },
              ]}
            >
              {pending ? (
                <ActivityIndicator size="small" color="#CCFF00" />
              ) : (
                <Text style={styles.primaryBtnText}>Save New Password</Text>
              )}
            </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#141518',
    padding: 0,
  },
  eyeBtn: {
    padding: 6,
    marginLeft: 6,
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  successBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
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
