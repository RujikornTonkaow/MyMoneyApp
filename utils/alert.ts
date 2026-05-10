import { Alert, Platform } from 'react-native';

// React Native's Alert.alert is a no-op on react-native-web (it logs to
// console but never renders a dialog), so multi-button confirm flows like
// "Sign out?" silently break in PWA mode. These helpers fall back to the
// browser's native window.alert / window.confirm on web so the UX works
// everywhere with one call site.

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function confirmAction(opts: ConfirmOptions): void {
  const {
    title,
    message,
    confirmText = 'OK',
    cancelText  = 'Cancel',
    destructive = false,
    onConfirm,
    onCancel,
  } = opts;

  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
    const text = message ? `${title}\n\n${message}` : title;
    if (window.confirm(text)) {
      Promise.resolve(onConfirm()).catch(() => {});
    } else {
      onCancel?.();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel', onPress: onCancel },
    {
      text:    confirmText,
      style:   destructive ? 'destructive' : 'default',
      onPress: () => { Promise.resolve(onConfirm()).catch(() => {}); },
    },
  ]);
}

export function notifyAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}
