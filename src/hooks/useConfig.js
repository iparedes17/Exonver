import { useState, useCallback } from 'react';
import { DEFAULT_ORIGINS, DEFAULT_PAYMENT_TYPES } from '../data/constants';
import { load, save } from '../utils/helpers';

export function useConfig() {
  const [origins,      setOrigins]      = useState(() => load('exv_origins',  DEFAULT_ORIGINS));
  const [paymentTypes, setPaymentTypes] = useState(() => load('exv_payments', DEFAULT_PAYMENT_TYPES));

  const saveOrigins = useCallback((list) => {
    setOrigins(list); save('exv_origins', list);
  }, []);

  const addOrigin = useCallback((label) => {
    label = label.trim();
    if (!label || origins.includes(label)) return;
    const next = [...origins, label];
    setOrigins(next); save('exv_origins', next);
  }, [origins]);

  const removeOrigin = useCallback((label) => {
    const next = origins.filter(o => o !== label);
    setOrigins(next); save('exv_origins', next);
  }, [origins]);

  const savePaymentTypes = useCallback((list) => {
    setPaymentTypes(list); save('exv_payments', list);
  }, []);

  const addPaymentType = useCallback((label) => {
    label = label.trim();
    if (!label || paymentTypes.includes(label)) return;
    const next = [...paymentTypes, label];
    setPaymentTypes(next); save('exv_payments', next);
  }, [paymentTypes]);

  const removePaymentType = useCallback((label) => {
    const next = paymentTypes.filter(p => p !== label);
    setPaymentTypes(next); save('exv_payments', next);
  }, [paymentTypes]);

  return { origins, paymentTypes, addOrigin, removeOrigin, addPaymentType, removePaymentType };
}
