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
} from '@dairy/shared';
import { deliveryRoutes } from '../delivery-routes';
import { useNavigate } from '../router';
import { useDeliveryAuth } from '../auth/delivery-auth.context';

/** 2. Delivery Partner Login — Modern clean design with black & lime accents. */
export function DeliveryLoginScreen() {
  const navigate = useNavigate();
  const { login, roleMismatch } = useDeliveryAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);



  const submit = async () => {
    if (pending) return;
    setError(null);

    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setPending(true);
    try {
      await login(email.trim(), password);
      navigate(deliveryRoutes.home, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.isUnauthorized
            ? 'Those credentials don’t match a rider account. Check your email and password.'
            : err.message,
        );
      } else {
        setError('Could not reach DairyFresh right now. Please try again.');
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
        {/* Soft Ambient Brand Glow at Top */}
        <View style={styles.ambientTopGlow} pointerEvents="none" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Emblem Badge */}
          <View style={styles.topBadgeWrap}>
            <View style={styles.brandBadge}>
              <BrandLogo size={66} variant="circle" />
            </View>
          </View>

          {/* Heading Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headingTitle}>Delivery Partner{'\n'}Portal</Text>
            <Text style={styles.headingSubtitle}>Sign in with your rider account to start delivering</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {roleMismatch ? (
              <Notice tone="error" icon="alert">
                This account is not registered as a Delivery Partner. Use your rider credentials.
              </Notice>
            ) : error ? (
              <Notice tone="error" icon="alert">
                {error}
              </Notice>
            ) : null}

            {/* Email Field */}
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
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                hitSlop={10}
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeBtn}
              >
                <Icon
                  name={showPassword ? 'eyeOff' : 'eye'}
                  size={20}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>

            {/* Remember Me & Help */}
            <View style={styles.metaRow}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: remember }}
                accessibilityLabel="Keep me signed in"
                onPress={() => setRemember((prev) => !prev)}
                style={styles.rememberWrap}
              >
                <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                  {remember ? <Icon name="check" size={12} color="#CCFF00" strokeWidth={3.2} /> : null}
                </View>
                <Text style={styles.rememberText}>Keep me signed in</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Forgot Password"
                onPress={() => navigate(deliveryRoutes.forgotPassword)}
                hitSlop={8}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>

            {/* Primary CTA: Log In */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign In"
              disabled={pending}
              onPress={() => void submit()}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
                pending && { opacity: 0.7 },
              ]}
            >
              {pending ? (
                <ActivityIndicator size="small" color="#CCFF00" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In to Deliver</Text>
              )}
            </Pressable>

            {/* Info Footer */}
            <View style={styles.infoCard}>
              <Icon name="shield" size={18} color="#141518" />
              <Text style={styles.infoText}>
                Rider accounts are issued by DairyFresh operations. Need access? Reach out to your local depot supervisor.
              </Text>
            </View>
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
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
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
    fontSize: 28,
    fontWeight: '800',
    color: '#141518',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  headingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  formSection: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 54,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#141518',
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 6,
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rememberWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#141518',
    borderColor: '#141518',
  },
  rememberText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
});

