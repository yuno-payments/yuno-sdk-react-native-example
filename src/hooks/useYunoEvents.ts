/**
 * Hook to handle Yuno SDK events
 */

import {useEffect, useCallback} from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';
import type {
  YunoPaymentState,
  YunoEnrollmentState,
  OneTimeTokenInfo,
} from '../types';

/**
 * Lazy getter for Yuno native module
 */
function getYunoNative() {
  const native = NativeModules.YunoSdk;
  if (!native) {
    console.warn('[useYunoEvents] YunoSdk native module is not available');
  }
  return native;
}

/**
 * Lazy getter for Yuno event emitter
 */
function getYunoEventEmitter(): NativeEventEmitter | null {
  const native = getYunoNative();
  return native ? new NativeEventEmitter(native) : null;
}

interface YunoEventsCallbacks {
  onPaymentStatus?: (state: YunoPaymentState) => void;
  onEnrollmentStatus?: (state: YunoEnrollmentState) => void;
  onOTT?: (token: string) => void;
  onOTTInfo?: (info: OneTimeTokenInfo) => void;
}

export const useYunoEvents = (callbacks: YunoEventsCallbacks) => {
  const {onPaymentStatus, onEnrollmentStatus, onOTT, onOTTInfo} = callbacks;

  const handlePaymentStatus = useCallback(
    (state: YunoPaymentState) => {
      console.log('📥 Payment Status Event:', JSON.stringify(state, null, 2));
      onPaymentStatus?.(state);
    },
    [onPaymentStatus],
  );

  const handleEnrollmentStatus = useCallback(
    (state: YunoEnrollmentState) => {
      console.log('📥 Enrollment Status Event:', JSON.stringify(state, null, 2));
      onEnrollmentStatus?.(state);
    },
    [onEnrollmentStatus],
  );

  const handleOTT = useCallback(
    (token: string) => {
      console.log('📥 OTT Event received:', token);
      onOTT?.(token);
    },
    [onOTT],
  );

  const handleOTTInfo = useCallback(
    (info: OneTimeTokenInfo) => {
      console.log('📥 OTT Info Event received:', JSON.stringify(info, null, 2));
      onOTTInfo?.(info);
    },
    [onOTTInfo],
  );

  useEffect(() => {
    console.log('🎧 Setting up Yuno event listeners...');

    const yunoEventEmitter = getYunoEventEmitter();
    
    if (!yunoEventEmitter) {
      console.error('❌ Cannot setup Yuno event listeners: native module not available');
      return;
    }

    const paymentSubscription = yunoEventEmitter.addListener(
      'YunoPaymentStatus',
      handlePaymentStatus,
    );

    const enrollmentSubscription = yunoEventEmitter.addListener(
      'YunoEnrollmentStatus',
      handleEnrollmentStatus,
    );

    const ottSubscription = yunoEventEmitter.addListener(
      'YunoOneTimeToken',
      handleOTT,
    );

    const ottInfoSubscription = yunoEventEmitter.addListener(
      'YunoOneTimeTokenInfo',
      handleOTTInfo,
    );

    console.log('✅ Yuno event listeners setup complete');

    return () => {
      console.log('🔌 Removing Yuno event listeners...');
      paymentSubscription.remove();
      enrollmentSubscription.remove();
      ottSubscription.remove();
      ottInfoSubscription.remove();
      console.log('✅ Yuno event listeners removed');
    };
  }, [handlePaymentStatus, handleEnrollmentStatus, handleOTT, handleOTTInfo]);
};

