/**
 * Hook to handle Yuno SDK events
 */

import {useEffect, useRef} from 'react';
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
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    console.log('🎧 Setting up Yuno event listeners...');

    const yunoEventEmitter = getYunoEventEmitter();

    if (!yunoEventEmitter) {
      console.error('❌ Cannot setup Yuno event listeners: native module not available');
      return;
    }

    const paymentSubscription = yunoEventEmitter.addListener(
      'YunoPaymentStatus',
      (state: YunoPaymentState) => {
        console.log('📥 Payment Status Event:', JSON.stringify(state, null, 2));
        callbacksRef.current.onPaymentStatus?.(state);
      },
    );

    const enrollmentSubscription = yunoEventEmitter.addListener(
      'YunoEnrollmentStatus',
      (state: YunoEnrollmentState) => {
        console.log('📥 Enrollment Status Event:', JSON.stringify(state, null, 2));
        callbacksRef.current.onEnrollmentStatus?.(state);
      },
    );

    const ottSubscription = yunoEventEmitter.addListener(
      'YunoOneTimeToken',
      (token: string) => {
        console.log('📥 OTT Event received:', token);
        callbacksRef.current.onOTT?.(token);
      },
    );

    const ottInfoSubscription = yunoEventEmitter.addListener(
      'YunoOneTimeTokenInfo',
      (info: OneTimeTokenInfo) => {
        console.log('📥 OTT Info Event received:', JSON.stringify(info, null, 2));
        callbacksRef.current.onOTTInfo?.(info);
      },
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
  }, []);
};

