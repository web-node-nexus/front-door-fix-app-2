import { createNavigationContainerRef, NavigationState, PartialState } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

type NavState = NavigationState | PartialState<NavigationState>;

function deepestRouteName(state: NavState | undefined): string | undefined {
  if (!state?.routes?.length) return undefined;
  const route = state.routes[state.index ?? 0];
  if (route.state) return deepestRouteName(route.state as NavState);
  return route.name;
}

export function currentRouteName(): string | undefined {
  if (!navigationRef.isReady()) return undefined;
  return deepestRouteName(navigationRef.getRootState());
}

export function navigateToLiveTracking(booking: { id: number }) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('Main' as never, {
    screen: 'LiveTracking',
    params: { booking },
  } as never);
}

export function navigateToRateReview(booking: { id: number; booking_code?: string; service?: string; professional?: string }) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('Main' as never, {
    screen: 'RateReview',
    params: { booking },
  } as never);
}
