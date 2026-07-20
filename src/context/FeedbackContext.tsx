import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import PremiumFeedbackModal, {
  FeedbackAction,
  FeedbackTone,
} from '../components/PremiumFeedbackModal';

type ShowOptions = {
  title: string;
  message?: string;
  tone?: FeedbackTone;
  actions?: FeedbackAction[];
};

type FeedbackContextValue = {
  showSuccess: (title: string, message?: string, actions?: FeedbackAction[]) => void;
  showError: (title: string, message?: string, actions?: FeedbackAction[]) => void;
  showInfo: (title: string, message?: string, actions?: FeedbackAction[]) => void;
  showWarning: (title: string, message?: string, actions?: FeedbackAction[]) => void;
  showFeedback: (options: ShowOptions) => void;
  hideFeedback: () => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [tone, setTone] = useState<FeedbackTone>('success');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState<string | undefined>();
  const [actions, setActions] = useState<FeedbackAction[] | undefined>();

  const hideFeedback = useCallback(() => {
    setVisible(false);
  }, []);

  const showFeedback = useCallback((options: ShowOptions) => {
    setTone(options.tone || 'success');
    setTitle(options.title);
    setMessage(options.message);
    setActions(options.actions);
    setVisible(true);
  }, []);

  const value = useMemo<FeedbackContextValue>(
    () => ({
      showSuccess: (t, m, a) => showFeedback({ title: t, message: m, tone: 'success', actions: a }),
      showError: (t, m, a) => showFeedback({ title: t, message: m, tone: 'error', actions: a }),
      showInfo: (t, m, a) => showFeedback({ title: t, message: m, tone: 'info', actions: a }),
      showWarning: (t, m, a) => showFeedback({ title: t, message: m, tone: 'warning', actions: a }),
      showFeedback,
      hideFeedback,
    }),
    [hideFeedback, showFeedback],
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <PremiumFeedbackModal
        visible={visible}
        tone={tone}
        title={title}
        message={message}
        actions={actions}
        onClose={hideFeedback}
      />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider');
  return ctx;
}
