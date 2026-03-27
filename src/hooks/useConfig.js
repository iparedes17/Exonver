import { useState, useCallback } from 'react';
import { DEFAULT_ORIGINS, DEFAULT_PAYMENT_TYPES, DEFAULT_LOSS_REASONS, TASK_TYPES } from '../data/constants';
import { load, save, generateId } from '../utils/helpers';

const DEFAULT_TASK_TYPES = TASK_TYPES;

export function useConfig() {
  const [origins,      setOrigins]      = useState(() => load('exv_origins',       DEFAULT_ORIGINS));
  const [paymentTypes, setPaymentTypes] = useState(() => load('exv_payments',      DEFAULT_PAYMENT_TYPES));
  const [taskTypes,    setTaskTypes]    = useState(() => load('exv_task_types',    DEFAULT_TASK_TYPES));
  const [lossReasons,  setLossReasons]  = useState(() => load('exv_loss_reasons',  DEFAULT_LOSS_REASONS));

  // ── Origins ──────────────────────────────────────────────────────────────
  const addOrigin    = useCallback((label) => { label=label.trim(); if(!label||origins.includes(label))return; const n=[...origins,label]; setOrigins(n); save('exv_origins',n); }, [origins]);
  const removeOrigin = useCallback((label) => { const n=origins.filter(o=>o!==label); setOrigins(n); save('exv_origins',n); }, [origins]);

  // ── Payment types ─────────────────────────────────────────────────────────
  const addPaymentType    = useCallback((label) => { label=label.trim(); if(!label||paymentTypes.includes(label))return; const n=[...paymentTypes,label]; setPaymentTypes(n); save('exv_payments',n); }, [paymentTypes]);
  const removePaymentType = useCallback((label) => { const n=paymentTypes.filter(p=>p!==label); setPaymentTypes(n); save('exv_payments',n); }, [paymentTypes]);

  // ── Task types ────────────────────────────────────────────────────────────
  const addTaskType    = useCallback((label) => { label=label.trim(); if(!label||taskTypes.includes(label))return; const n=[...taskTypes,label]; setTaskTypes(n); save('exv_task_types',n); }, [taskTypes]);
  const removeTaskType = useCallback((label) => { const n=taskTypes.filter(t=>t!==label); setTaskTypes(n); save('exv_task_types',n); }, [taskTypes]);
  const reorderTaskTypes = useCallback((list) => { setTaskTypes(list); save('exv_task_types',list); }, []);

  // ── Loss reasons ──────────────────────────────────────────────────────────
  const addLossReason    = useCallback((label) => { label=label.trim(); if(!label||lossReasons.includes(label))return; const n=[...lossReasons,label]; setLossReasons(n); save('exv_loss_reasons',n); }, [lossReasons]);
  const removeLossReason = useCallback((label) => { const n=lossReasons.filter(r=>r!==label); setLossReasons(n); save('exv_loss_reasons',n); }, [lossReasons]);
  const editLossReason   = useCallback((old, newLabel) => { newLabel=newLabel.trim(); if(!newLabel)return; const n=lossReasons.map(r=>r===old?newLabel:r); setLossReasons(n); save('exv_loss_reasons',n); }, [lossReasons]);

  return {
    origins, paymentTypes, taskTypes, lossReasons,
    addOrigin, removeOrigin,
    addPaymentType, removePaymentType,
    addTaskType, removeTaskType, reorderTaskTypes,
    addLossReason, removeLossReason, editLossReason,
  };
}
