import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, SupportChatMessage } from '../../api/client';
import { BRAND } from '../../config';
import { useLocale } from '../../context/LocaleContext';

export default function LiveChatScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const listRef = useRef<FlatList<SupportChatMessage>>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastIdRef = useRef(0);

  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const mergeMessages = useCallback((incoming: SupportChatMessage[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const map = new Map<number, SupportChatMessage>();
      prev.forEach((m) => map.set(m.id, m));
      incoming.forEach((m) => map.set(m.id, m));
      const merged = [...map.values()].sort((a, b) => a.id - b.id);
      lastIdRef.current = merged[merged.length - 1]?.id ?? lastIdRef.current;
      return merged;
    });
  }, []);

  const loadMessages = useCallback(async (since = 0, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.supportMessages(since);
      mergeMessages(data.messages);
      setError(null);
      if (since === 0) scrollToBottom(false);
    } catch (e) {
      if (!silent) {
        setError(e instanceof Error ? e.message : 'Could not load chat');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [mergeMessages, scrollToBottom]);

  useFocusEffect(
    useCallback(() => {
      lastIdRef.current = 0;
      loadMessages(0);
      pollRef.current = setInterval(() => {
        if (lastIdRef.current > 0) {
          loadMessages(lastIdRef.current, true);
        }
      }, 12000);

      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
        Keyboard.dismiss();
      };
    }, [loadMessages]),
  );

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setDraft('');
    Keyboard.dismiss();

    try {
      const res = await api.sendSupportMessage(text);
      mergeMessages(res.messages);
      setError(null);
      scrollToBottom();
    } catch (e) {
      setDraft(text);
      setError(e instanceof Error ? e.message : 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={BRAND.ink} />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={styles.agentAvatar}>
            <Ionicons name="headset" size={20} color={BRAND.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{t('support.liveChat')}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{t('support.online')}</Text>
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={BRAND.primary} size="large" />
          <Text style={styles.loadingText}>{t('support.chatLoading')}</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: 12 }]}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollToBottom(false)}
          renderItem={({ item }) => (
            <View style={[styles.bubbleWrap, item.mine ? styles.mineWrap : styles.theirsWrap]}>
              {!item.mine ? (
                <Text style={styles.senderLabel}>{item.sender}</Text>
              ) : null}
              <View style={[styles.bubble, item.mine ? styles.mineBubble : styles.theirsBubble]}>
                <Text style={[styles.bubbleText, item.mine ? styles.mineText : styles.theirsText]}>
                  {item.body}
                </Text>
              </View>
              {item.time ? (
                <Text style={[styles.timeText, item.mine ? styles.timeMine : styles.timeTheirs]}>
                  {item.time}
                </Text>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>{t('support.chatEmpty')}</Text>
            </View>
          }
        />
      )}

      {error ? (
        <View style={styles.errorBar}>
          <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
          <Pressable onPress={() => loadMessages(0)}>
            <Text style={styles.retryText}>{t('bookings.retry')}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.composer, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          style={styles.input}
          placeholder={t('support.chatPlaceholder')}
          placeholderTextColor={BRAND.light}
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={1000}
          editable={!sending}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={sendMessage}
        />
        <Pressable
          style={[styles.sendBtn, (!draft.trim() || sending) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!draft.trim() || sending}
        >
          <LinearGradient
            colors={draft.trim() && !sending ? [BRAND.primary, '#E91E63'] : ['#D1D5DB', '#9CA3AF']}
            style={styles.sendGradient}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BRAND.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  agentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  onlineText: { fontSize: 12, color: BRAND.muted, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 10, color: BRAND.muted, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingTop: 16, flexGrow: 1 },
  bubbleWrap: { marginBottom: 14, maxWidth: '82%' },
  mineWrap: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirsWrap: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  senderLabel: { fontSize: 11, color: BRAND.muted, fontWeight: '700', marginBottom: 4 },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  mineBubble: {
    backgroundColor: BRAND.primary,
    borderBottomRightRadius: 6,
  },
  theirsBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BRAND.border,
    borderBottomLeftRadius: 6,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  mineText: { color: '#fff' },
  theirsText: { color: BRAND.ink },
  timeText: { fontSize: 10, marginTop: 4, color: BRAND.light, fontWeight: '600' },
  timeMine: { textAlign: 'right' },
  timeTheirs: { textAlign: 'left' },
  emptyText: { color: BRAND.muted, fontWeight: '600' },
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { flex: 1, fontSize: 12, color: '#B91C1C', fontWeight: '600' },
  retryText: { fontSize: 12, fontWeight: '800', color: BRAND.primary },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: Platform.OS === 'ios' ? 120 : 100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: BRAND.ink,
  },
  sendBtn: { marginBottom: 2 },
  sendBtnDisabled: { opacity: 0.8 },
  sendGradient: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
