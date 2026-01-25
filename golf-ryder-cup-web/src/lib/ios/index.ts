/**
 * iOS Module — World-Class iPhone Experience
 *
 * Comprehensive iOS functionality barrel export.
 * Import everything you need for a premium iPhone experience.
 *
 * @example
 * import {
 *   SafeAreaProvider,
 *   useSafeArea,
 *   IOSBottomSheet,
 *   IOSActionSheet,
 *   useSwipeGesture,
 *   useSpring,
 * } from '@/lib/ios';
 */

// ============================================
// Safe Area System
// ============================================

export {
  SafeAreaProvider,
  useSafeArea,
  useSafeAreaStyle,
  useFixedPosition,
  SafeAreaView,
  SafeAreaSpacer,
  DynamicIslandAware,
  HomeIndicatorAware,
  type SafeAreaInsets,
  type SafeAreaContextValue,
} from './SafeAreaProvider';

// ============================================
// Bottom Sheet
// ============================================

export {
  IOSBottomSheet,
  useBottomSheet,
  type BottomSheetProps,
  type BottomSheetRef,
  type SnapPoint,
} from './IOSBottomSheet';

// ============================================
// Action Sheet
// ============================================

export {
  IOSActionSheet,
  useActionSheet,
  ConfirmActionSheet,
  type ActionSheetProps,
  type ActionSheetAction,
  type ConfirmActionSheetProps,
} from './IOSActionSheet';

// ============================================
// Context Menu
// ============================================

export {
  IOSContextMenu,
  useContextMenu,
  type ContextMenuProps,
  type ContextMenuItem,
} from './IOSContextMenu';

// ============================================
// Spring Animations
// ============================================

export {
  useSpring,
  useRubberBand,
  useMomentum,
  SpringPresets,
  generateSpringKeyframes,
  type SpringConfig,
  type SpringValue,
  type UseSpringOptions,
  type UseSpringReturn,
  type UseRubberBandOptions,
  type UseMomentumOptions,
} from './useIOSSpring';

// ============================================
// Scroll Container
// ============================================

export {
  IOSScrollContainer,
  ScrollSnapItem,
  useScrollState,
  type ScrollContainerProps,
  type ScrollContainerRef,
  type ScrollDirection,
  type SnapType,
  type SnapAlign,
} from './IOSScrollContainer';

// ============================================
// Re-export from hooks
// ============================================

export {
  useSwipeGesture,
  useSwipeNavigation,
  useLongPress,
  useEdgeSwipe,
  usePinchZoom,
  type GestureState,
  type SwipeConfig,
  type SwipeCallbacks,
  type LongPressConfig,
  type PinchState,
} from '../hooks/useIOSGestures';

export {
  useIOSKeyboard,
  useIOSInputZoomPrevention,
} from '../hooks/useIOSKeyboard';
