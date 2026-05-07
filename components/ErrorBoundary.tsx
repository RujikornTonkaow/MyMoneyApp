import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './ui';
import { colors, radii, shadows, spacing } from '../constants/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <View style={styles.iconBox}>
            <Ionicons name="warning-outline" size={44} color={colors.brand[500]} />
          </View>
          <AppText variant="h2" weight="bold" align="center" style={styles.title}>
            เกิดข้อผิดพลาด
          </AppText>
          <AppText variant="body" tone="secondary" align="center" style={styles.message}>
            {this.state.error?.message ?? 'ไม่ทราบสาเหตุ'}
          </AppText>
          <TouchableOpacity
            onPress={this.handleReset}
            style={styles.button}
          >
            <AppText variant="bodyMd" weight="semibold" tone="inverse">
              ลองใหม่
            </AppText>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.base,
    paddingHorizontal: spacing['8'],
  },
  iconBox: {
    width: 88,
    height: 88,
    borderRadius: radii.xl,
    backgroundColor: colors.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4'],
  },
  title: {
    marginBottom: spacing['2'],
  },
  message: {
    marginBottom: spacing['6'],
  },
  button: {
    backgroundColor: colors.brand[500],
    borderRadius: radii.lg,
    paddingHorizontal: spacing['8'],
    paddingVertical: spacing['3'],
    ...shadows.brand,
  },
});
