import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@utils';
import { Button } from './button';
import { Icon } from './icon';
import { Ternary } from '../common';

/**
 * A single option shape for the {@link SelectSheet} component.
 */
export interface SelectSheetOption {
  /** Human-readable label shown in the option list. */
  label: string;
  /** The underlying value returned when this option is selected. */
  value: string;
  /** Optional secondary text rendered below the label. */
  subtitle?: string;
}

interface SelectSheetProps {
  /** Label text displayed above the trigger. */
  label?: string;
  /** Placeholder text shown when `selectedValue` is empty or no match is found. */
  placeholder?: string;
  /** Title displayed at the top of the opened sheet. Defaults to "Select". */
  title?: string;
  /** The list of available options. */
  options: SelectSheetOption[];
  /** The currently selected value. */
  selectedValue: string;
  /** Called when the user selects an option. Receives the option's `value`. */
  onSelect: (value: string) => void;
  /** Optional validation error message shown below the trigger. */
  error?: string;

  disabled?: boolean;

  refetch?: () => void;
  loading?: boolean;
}

/**
 * A slide-up bottom-sheet option picker.
 *
 * Renders a tappable trigger button (styled to match {@link Input}) that opens
 * a modal sheet sliding up from the bottom with a scrollable list of options.
 * The active selection is highlighted with a blue accent and a checkmark icon.
 *
 * Uses `react-native-reanimated` for smooth spring-based entrance and timed
 * exit animations.
 *
 * @example
 * ```tsx
 * <SelectSheet
 *   label="Country"
 *   placeholder="Choose a country"
 *   title="Select Country"
 *   options={[
 *     { label: 'United States', value: 'US', subtitle: '+1' },
 *     { label: 'Canada', value: 'CA', subtitle: '+1' },
 *   ]}
 *   selectedValue={country}
 *   onSelect={setCountry}
 *   error={errors.country?.message}
 * />
 * ```
 */
export const SelectSheet = (props: SelectSheetProps) => {
  const {
    label,
    placeholder = 'Select an option',
    title = 'Select',
    options,
    selectedValue,
    onSelect,
    error,
    disabled,
    refetch,
    loading,
  } = props;
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
      setOpen(false);
    },
    [onSelect]
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayText = selectedOption?.label ?? placeholder;

  return (
    <View className="my-2 w-full">
      {label && (
        <Text
          className={cn(
            'mb-2 ml-1 text-lg font-semibold',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}>
          {label}
        </Text>
      )}

      {/* Trigger Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(true)}
        disabled={disabled}
        className={cn(
          'min-h-[50px] w-full flex-row items-center justify-between rounded-md border bg-background px-4 dark:bg-gray-900',
          error ? 'bg-destructive/5 border-destructive' : 'border-input dark:border-gray-600'
        )}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? 'Field'}: ${displayText}. Tap to change.`}>
        <Text
          className={cn(
            'text-body-md flex-1',
            selectedOption
              ? 'font-semibold text-foreground dark:text-white'
              : 'text-muted-foreground'
          )}>
          {loading ? 'Loading...' : displayText}
        </Text>
        <Icon name="chevron-down" size={18} color="#9ca3af" />
      </TouchableOpacity>

      {error && <Text className="ml-1 mt-2 text-base text-destructive">{error}</Text>}

      {/* Bottom Sheet */}
      <SelectSheetModal
        open={open}
        title={title}
        options={options}
        selectedValue={selectedValue}
        onSelect={handleSelect}
        onClose={handleClose}
        refetch={refetch}
        isLoading={loading}
      />
    </View>
  );
};

/**
 * Internal bottom-sheet modal rendered inside a React Native `Modal`.
 * Separated from {@link SelectSheet} so the animation state resets properly
 * each time the modal opens (remount on `open` toggle).
 */
type SelectSheetModalProps = {
  open: boolean;
  title: string;
  options: SelectSheetOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  isLoading?: boolean;
  refetch?: () => void;
};

const SelectSheetModal = (props: SelectSheetModalProps) => {
  const { open, title, options, selectedValue, onSelect, onClose, refetch, isLoading } = props;
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (open) {
      progress.value = withSpring(1, {
        damping: 25,
        stiffness: 200,
        mass: 0.9,
      });
    } else {
      progress.value = withTiming(0, { duration: 200 });
    }
  }, [open, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [600, 0], Extrapolate.CLAMP),
      },
    ],
  }));

  return (
    <Modal
      transparent
      visible={open}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]} className="bg-black/50">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sheet Container */}
      <View style={StyleSheet.absoluteFill} className="pointer-events-box-none justify-end">
        <Animated.View
          style={[sheetStyle]}
          className="rounded-lg bg-background pb-2 dark:bg-gray-900">
          {/* Handle bar */}
          <View className="items-center py-3">
            <View className="h-1.5 w-10 rounded-md bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Title */}
          <Text className="px-5 pb-4 text-lg font-bold">{title}</Text>

          {/* Options / Empty State */}
          <ScrollView
            className="max-h-96"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
            <Ternary
              condition={options.length === 0}
              ifTrue={
                <View className="items-center justify-center gap-y-2 px-5 py-10">
                  <View className="rounded-md  bg-primary p-2">
                    <Icon name="file-not-found" size={48} className="text-white" />
                  </View>
                  <Text className="text-graphite mt-3 text-center text-lg">
                    No options available. Please check and try again.
                  </Text>
                  {refetch && (
                    <Button
                      activeOpacity={0.7}
                      onPress={refetch}
                      disabled={isLoading}
                      className="mt-4 flex-row items-center gap-x-2 rounded-lg bg-primary px-6 py-2.5 ">
                      <Text className="font-semibold text-white">
                        {isLoading ? 'Loading...' : 'Retry'}
                      </Text>
                    </Button>
                  )}
                </View>
              }
              ifFalse={options.map((option) => {
                const isSelected = selectedValue === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.6}
                    onPress={() => {
                      runOnJS(onSelect)(option.value);
                    }}
                    className={cn(
                      'mx-3 flex-row items-center justify-between rounded-md border border-transparent px-4 py-4',
                      isSelected ? 'text-primary ' : 'text-graphite'
                    )}
                    accessibilityRole="button"
                    accessibilityLabel={`${option.label}${isSelected ? ', selected' : ''}`}>
                    <View className="flex-1">
                      <Text
                        className={cn(
                          'text-base',
                          isSelected ? 'font-semibold text-primary ' : 'text-graphite font-medium'
                        )}>
                        {option.label}
                      </Text>
                      {option.subtitle && (
                        <Text className={isSelected ? 'text-primary ' : 'text-graphite'}>
                          {option.subtitle}
                        </Text>
                      )}
                    </View>
                    {isSelected ? (
                      <Icon name="check-circle-2" size={22} color="#3b82f6" />
                    ) : (
                      <Icon name="circle" size={22} color="#d1d5db" />
                    )}
                  </TouchableOpacity>
                );
              })}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};
