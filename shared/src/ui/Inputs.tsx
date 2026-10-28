import { useState, type ReactNode } from 'react';
import { Pressable, Text, TextInput, View, StyleSheet, type TextInputProps } from 'react-native';
import { colors, radius, spacing, typography } from './tokens';
import { Icon, type IconName } from './icons';

interface BaseFieldProps {
  label?: string;
  hint?: string;
  error?: string | null;
  leadingIcon?: IconName;
}

export interface TextFieldProps extends BaseFieldProps, Omit<TextInputProps, 'style'> {
  trailing?: ReactNode;
  containerStyle?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}

export function TextField({
  label,
  hint,
  error,
  leadingIcon,
  trailing,
  containerStyle,
  ...rest
}: TextFieldProps) {
  return (
    <View style={[styles.field, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error ? styles.inputWrapError : null]}>
        {leadingIcon ? <Icon name={leadingIcon} size={19} color={colors.muted} /> : null}
        <TextInput
          style={[styles.input, leadingIcon ? null : styles.inputNoIcon]}
          placeholderTextColor={colors.muted2}
          selectionColor={colors.green}
          {...rest}
        />
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
      {error ? (
        <View style={styles.inlineRow}>
          <Icon name="alert" size={14} color={colors.red} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function PasswordField({ label, hint, error, ...rest }: TextFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      label={label}
      hint={hint}
      error={error}
      secureTextEntry={!visible}
      autoCapitalize="none"
      leadingIcon="lock"
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          hitSlop={8}
          onPress={() => setVisible((value) => !value)}
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} size={19} color={colors.muted} />
        </Pressable>
      }
      {...rest}
    />
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  ...rest
}: BaseFieldProps & Omit<TextInputProps, 'style'>) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, styles.textareaWrap, error ? styles.inputWrapError : null]}>
        <TextInput
          multiline
          textAlignVertical="top"
          style={[styles.input, styles.textarea]}
          placeholderTextColor={colors.muted2}
          selectionColor={colors.green}
          {...rest}
        />
      </View>
      {error ? (
        <View style={styles.inlineRow}>
          <Icon name="alert" size={14} color={colors.red} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  onFilter,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilter?: () => void;
  autoFocus?: boolean;
}) {
  return (
    <View style={styles.searchRow}>
      <View style={[styles.inputWrap, styles.searchInput]}>
        <Icon name="search" size={19} color={colors.muted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.muted2}
          autoFocus={autoFocus}
          returnKeyType="search"
          style={[styles.input, styles.inputNoIcon]}
          accessibilityLabel={placeholder}
        />
        {value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
            onPress={() => onChange('')}
          >
            <Icon name="x" size={17} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {onFilter ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filters"
          hitSlop={8}
          onPress={onFilter}
          style={styles.filterBtn}
        >
          <Icon name="sliders" size={20} color={colors.ink} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { ...typography.small, color: colors.ink2, fontWeight: '700', fontSize: 13 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  inputWrapError: { borderColor: colors.red },
  inputNoIcon: { paddingHorizontal: 0 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
  },
  textareaWrap: { minHeight: 96, alignItems: 'stretch', paddingVertical: 6 },
  textarea: { minHeight: 84, paddingTop: 6 },
  trailing: { marginLeft: 'auto' },
  hint: { ...typography.caption },
  error: { ...typography.caption, color: colors.red, fontWeight: '600', flexShrink: 1 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchInput: { flex: 1, borderRadius: radius.pill },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
});
