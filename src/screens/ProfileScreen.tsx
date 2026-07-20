import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ProfileAvatar from '../components/ProfileAvatar';
import ProfileMenuItem from '../components/ProfileMenuItem';
import { BRAND } from '../config';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useProfile } from '../context/ProfileContext';
import { api, Booking } from '../api/client';
import { useScreenPadding } from '../hooks/useScreenPadding';

const QUICK_ACTIONS = [
  { icon: 'star' as const, bg: '#FCE7F3', title: 'My Bookings', sub: 'View all bookings', route: 'BookingsTab', tab: 'Upcoming' },
  { icon: 'heart' as const, bg: '#F3E8FF', title: 'Wishlist', sub: 'Liked services', route: 'Favorites' },
  { icon: 'ticket' as const, bg: '#D1FAE5', title: 'Offers', sub: 'Exclusive deals', route: 'Offers' },
  { icon: 'wallet' as const, bg: '#FFEDD5', title: 'My Wallet', sub: 'Payments & refunds', route: 'Wallet' },
];

const ORDER_TABS = [
  { icon: 'calendar-outline' as const, label: 'Upcoming', tab: 'Upcoming' },
  { icon: 'sync-outline' as const, label: 'In Progress', tab: 'Active' },
  { icon: 'checkmark-circle-outline' as const, label: 'Completed', tab: 'Completed' },
  { icon: 'close-circle-outline' as const, label: 'Cancelled', tab: 'Cancelled' },
];

function tabFor(status: string) {
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'completed') return 'Completed';
  if (status === 'in_progress') return 'Active';
  return 'Upcoming';
}

export default function ProfileScreen() {
  const nav = useNavigation<any>();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { walletBalance, cashbackEarned, isPremium, rewardPoints } = useProfile();
  const screenPad = useScreenPadding({ headerless: true });
  const [counts, setCounts] = useState({ Upcoming: 0, Active: 0, Completed: 0, Cancelled: 0 });

  useFocusEffect(useCallback(() => {
    api.bookings().then((list: Booking[]) => {
      const c = { Upcoming: 0, Active: 0, Completed: 0, Cancelled: 0 };
      list.forEach((b) => { c[tabFor(b.status)] += 1; });
      setCounts(c);
    }).catch(() => {});
  }, []));

  const go = (screen: string, params?: object) => nav.navigate(screen, params);
  const goBookings = (tab: string) => nav.navigate('Bookings', { tab });

  const displayName = user?.name || 'Customer';
  const displayPhone = user?.phone || 'Add phone number';
  const displayEmail = user?.email || '';

  const deleteAccount = () => {
    Alert.alert('Delete Account', 'This will permanently delete your account. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          Alert.alert(
            'Request submitted',
            'Our team will process your deletion request within 48 hours. You will now be signed out.',
            [{ text: 'OK', onPress: () => logout() }],
          );
        },
      },
    ]);
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: screenPad.paddingTop, paddingBottom: screenPad.paddingBottom + 80 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>My Profile</Text>
          <Text style={styles.pageSub}>Manage your account and preferences</Text>
        </View>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconBtn} onPress={() => go('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={BRAND.ink} />
            {unreadCount > 0 && <View style={styles.notifDot}><Text style={styles.notifText}>{unreadCount}</Text></View>}
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => go('AppSettings')}>
            <Ionicons name="settings-outline" size={22} color={BRAND.ink} />
          </Pressable>
        </View>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileLeft}>
          <ProfileAvatar name={displayName} avatar={user?.avatar} />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <View style={styles.nameLeft}>
                <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                <Ionicons name="checkmark-circle" size={18} color={BRAND.primary} />
              </View>
              <Pressable style={styles.editChip} onPress={() => go('PersonalInfo', { edit: true })} hitSlop={8}>
                <Ionicons name="pencil" size={13} color={BRAND.primary} />
                <Text style={styles.editText}>Edit</Text>
              </Pressable>
            </View>
            <Text style={styles.contact}>{displayPhone}</Text>
            <Text style={styles.contact}>{displayEmail}</Text>
            {isPremium ? (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={12} color="#fff" />
                <Text style={styles.premiumText}>Premium Member</Text>
              </View>
            ) : (
              <Pressable onPress={() => go('Subscription')}>
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond-outline" size={12} color="#fff" />
                  <Text style={styles.premiumText}>Upgrade to Premium</Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable style={styles.walletCard} onPress={() => go('Wallet')}>
          <LinearGradient colors={['#FF2D7A', '#E91E63']} style={styles.walletGrad}>
            <View style={styles.walletTop}>
              <View>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <Text style={styles.walletAmt}>₹{walletBalance.toLocaleString('en-IN')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
            </View>
            <View style={styles.walletDivider} />
            <View style={styles.walletBottom}>
              <Text style={styles.cashLabel}>Cashback Earned</Text>
              <View style={styles.cashRow}>
                <Text style={styles.cashAmt}>₹{cashbackEarned}</Text>
                <Ionicons name="cash-outline" size={16} color="rgba(255,255,255,0.9)" />
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickGrid}>
        {QUICK_ACTIONS.map((a) => (
          <Pressable
            key={a.title}
            style={styles.quickCard}
            onPress={() => (a.route === 'BookingsTab' ? goBookings(a.tab!) : go(a.route))}
          >
            <View style={[styles.quickIcon, { backgroundColor: a.bg }]}>
              <Ionicons name={a.icon} size={22} color={BRAND.primary} />
            </View>
            <Text style={styles.quickTitle}>{a.title}</Text>
            <Text style={styles.quickSub}>{a.sub}</Text>
          </Pressable>
        ))}
      </View>

      {/* My Orders */}
      <View style={styles.secHead}>
        <Text style={styles.secTitle}>My Orders</Text>
        <Pressable onPress={() => goBookings('Upcoming')}>
          <Text style={styles.secLink}>View All Orders ›</Text>
        </Pressable>
      </View>
      <View style={styles.ordersRow}>
        {ORDER_TABS.map((o) => (
          <Pressable key={o.label} style={styles.orderItem} onPress={() => goBookings(o.tab)}>
            <View style={styles.orderIconWrap}>
              <Ionicons name={o.icon} size={24} color={BRAND.primary} />
              {counts[o.tab as keyof typeof counts] > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{counts[o.tab as keyof typeof counts]}</Text>
                </View>
              )}
            </View>
            <Text style={styles.orderLabel}>{o.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Account & Settings */}
      <Text style={[styles.secTitle, { marginTop: 24, marginBottom: 8 }]}>Account & Settings</Text>
      <View style={styles.menuCard}>
        <ProfileMenuItem icon="person-outline" iconBg="#FCE7F3" title="Personal Information" subtitle="Name, phone, email" trailing="edit" onPress={() => go('PersonalInfo')} />
        <ProfileMenuItem icon="location-outline" iconBg="#F3E8FF" title="Addresses" subtitle="Home, office & more" onPress={() => go('Addresses')} />
        <ProfileMenuItem icon="card-outline" iconBg="#D1FAE5" title="Payment Methods" subtitle="UPI, cards & wallet" onPress={() => go('PaymentMethods')} />
        <ProfileMenuItem icon="notifications-outline" iconBg="#FFEDD5" title="Notifications" subtitle="Push & SMS alerts" onPress={() => go('Notifications')} />
        <ProfileMenuItem icon="shield-checkmark-outline" iconBg="#F3E8FF" title="Privacy & Security" subtitle="Password, biometrics" onPress={() => go('Security')} />
        <ProfileMenuItem icon="gift-outline" iconBg="#FCE7F3" title="Refer & Earn" subtitle="Invite friends, earn ₹500" onPress={() => go('ReferEarn')} />
        <ProfileMenuItem icon="headset-outline" iconBg="#DBEAFE" title="Help & Support" subtitle="Chat, call & FAQ" onPress={() => nav.navigate('Support')} />
        <ProfileMenuItem icon="star-outline" iconBg="#FEF3C7" title="My Reviews" subtitle="Ratings & feedback" onPress={() => go('Reviews')} />
        <ProfileMenuItem icon="time-outline" iconBg="#D1FAE5" title="Service History" subtitle="Past bookings" onPress={() => go('ServiceHistory')} />
        <ProfileMenuItem icon="document-text-outline" iconBg="#FEE2E2" title="Invoices" subtitle="Download receipts" onPress={() => go('ServiceHistory')} />
        <ProfileMenuItem icon="diamond-outline" iconBg="#F3E8FF" title="Subscription" subtitle="Premium membership" onPress={() => go('Subscription')} />
        <ProfileMenuItem icon="settings-outline" iconBg="#F3F4F6" title="App Settings" subtitle="Language & preferences" onPress={() => go('AppSettings')} />
      </View>

      {/* Rewards */}
      <Text style={[styles.secTitle, { marginTop: 24, marginBottom: 8 }]}>Front Door Rewards</Text>
      <View style={styles.rewardsRow}>
        <View style={styles.rewardBox}><Text style={styles.rewardVal}>{rewardPoints}</Text><Text style={styles.rewardLabel}>Points Earned</Text></View>
        <View style={styles.rewardBox}><Text style={styles.rewardVal}>₹{cashbackEarned}</Text><Text style={styles.rewardLabel}>Cashback</Text></View>
        <View style={styles.rewardBox}><Text style={styles.rewardVal}>2</Text><Text style={styles.rewardLabel}>Gift Cards</Text></View>
      </View>

      {/* Premium Banner */}
      <LinearGradient colors={['#F3E8FF', '#FDF4FF']} style={styles.banner}>
        <Ionicons name="diamond" size={28} color={BRAND.purple} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.bannerTitle}>Become a Premium Member</Text>
          <Text style={styles.bannerSub}>Exclusive offers, priority support & special discounts</Text>
        </View>
        <Pressable onPress={() => go('Subscription')}>
          <LinearGradient colors={[BRAND.purple, BRAND.primary]} style={styles.upgradeBtn}>
            <Text style={styles.upgradeText}>Upgrade</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>

      {/* Refer Banner */}
      <LinearGradient colors={['#FCE7F3', '#FDF4FF']} style={styles.banner}>
        <Text style={{ fontSize: 28 }}>🎁</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.bannerTitle}>Refer a Friend & Earn</Text>
          <Text style={styles.bannerSub}>Get ₹500 cashback for every referral</Text>
        </View>
        <Pressable style={styles.inviteBtn} onPress={() => go('ReferEarn')}>
          <Text style={styles.inviteText}>Invite Now</Text>
        </Pressable>
      </LinearGradient>

      {/* Logout */}
      <Pressable style={styles.logoutCard} onPress={confirmLogout}>
        <View style={[styles.quickIcon, { backgroundColor: '#FCE7F3' }]}>
          <Ionicons name="log-out-outline" size={20} color={BRAND.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.logoutTitle}>Logout</Text>
          <Text style={styles.logoutSub}>Sign out from your account</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={BRAND.light} />
      </Pressable>

      <Pressable style={styles.deleteBtn} onPress={deleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: BRAND.ink },
  pageSub: { fontSize: 13, color: BRAND.muted, marginTop: 4 },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: BRAND.surface, borderWidth: 1, borderColor: BRAND.border, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  notifText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  profileCard: {
    backgroundColor: BRAND.canvas,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 20,
  },
  profileLeft: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  nameLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: BRAND.ink, flexShrink: 1 },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BRAND.lavender,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  editText: { fontSize: 12, fontWeight: '800', color: BRAND.primary },
  contact: { fontSize: 12, color: BRAND.muted, marginTop: 3 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: BRAND.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  premiumText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  walletCard: { borderRadius: 18, overflow: 'hidden' },
  walletGrad: { padding: 16 },
  walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  walletAmt: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 2 },
  walletDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 12 },
  walletBottom: {},
  cashLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  cashRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  cashAmt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  quickCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: BRAND.canvas,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    alignItems: 'center',
  },
  quickIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickTitle: { fontSize: 13, fontWeight: '800', color: BRAND.ink },
  quickSub: { fontSize: 10, color: BRAND.muted, marginTop: 2, textAlign: 'center' },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink },
  secLink: { fontSize: 12, fontWeight: '700', color: BRAND.primary },
  ordersRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: BRAND.canvas, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: BRAND.border },
  orderItem: { alignItems: 'center', flex: 1 },
  orderIconWrap: { position: 'relative', marginBottom: 6 },
  countBadge: { position: 'absolute', top: -4, right: -8, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  countText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  orderLabel: { fontSize: 10, fontWeight: '600', color: BRAND.muted, textAlign: 'center' },
  menuCard: { backgroundColor: BRAND.canvas, borderRadius: 24, paddingHorizontal: 12, borderWidth: 1, borderColor: BRAND.border },
  rewardsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  rewardBox: { flex: 1, backgroundColor: BRAND.canvas, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: BRAND.border },
  rewardVal: { fontSize: 18, fontWeight: '800', color: BRAND.primary },
  rewardLabel: { fontSize: 10, color: BRAND.muted, marginTop: 4, textAlign: 'center' },
  banner: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BRAND.border },
  bannerTitle: { fontSize: 14, fontWeight: '800', color: BRAND.ink },
  bannerSub: { fontSize: 11, color: BRAND.muted, marginTop: 2 },
  upgradeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  upgradeText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  inviteBtn: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: BRAND.primary },
  inviteText: { color: BRAND.primary, fontWeight: '800', fontSize: 12 },
  logoutCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: BRAND.canvas, borderRadius: 20, padding: 16, marginTop: 8, borderWidth: 1, borderColor: BRAND.border },
  logoutTitle: { fontSize: 15, fontWeight: '800', color: BRAND.ink },
  logoutSub: { fontSize: 11, color: BRAND.muted, marginTop: 2 },
  deleteBtn: { alignItems: 'center', padding: 16, marginTop: 8 },
  deleteText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
});
