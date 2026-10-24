import { Colors } from '@/assets/constants/Colors'
import { IconSquare } from '@/components/plans/IconSquare'
import { LocationField } from '@/components/plans/LocationField'
import { ACTIVITY_META, ActivityType } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import { FontSize, LineHeight } from '@/constants/typography'
import {
  NEW_PLAN_DESCRIPTION_MAX,
  NEW_PLAN_MAX_SPOTS,
  NEW_PLAN_TITLE_MAX,
  VERIFICATION_ENABLED,
} from '@/lib/env_reader'
import { ParsedPlace } from '@/lib/plans/formatPlace'
import { formatSheetDate, formatSheetTime } from '@/lib/plans/formatDateTime'
import { NewPlanFormValues, PlanVisibility } from '@/types'
import { Feather, Ionicons } from '@expo/vector-icons'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import React, { RefObject } from 'react'
import {
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { GooglePlacesTextInputRef } from 'react-native-google-places-textinput'

const SCREEN_WIDTH = Dimensions.get('window').width
const TITLE_WARN_THRESHOLD = NEW_PLAN_TITLE_MAX - 8
const CHIP_COLUMNS = 3
const CHIP_GAP = 8
const CHIP_WIDTH = (SCREEN_WIDTH - 32 - CHIP_GAP * (CHIP_COLUMNS - 1)) / CHIP_COLUMNS

export type ActivePicker = 'date' | 'time' | null

export type NewPlanFieldsProps = {
  form: NewPlanFormValues
  onPatchForm: (patch: Partial<NewPlanFormValues>) => void
  titleFocused: boolean
  onTitleFocus: () => void
  onTitleBlur: () => void
  descriptionFocused: boolean
  onDescriptionFocus: () => void
  onDescriptionBlur: () => void
  placesRef: RefObject<GooglePlacesTextInputRef | null>
  onLocationPlaceSelect: (parsed: ParsedPlace) => void
  onLocationTextChange: (text: string) => void
  onLocationFocus: () => void
  activePicker: ActivePicker
  pickerDraft: Date
  onOpenPicker: (picker: 'date' | 'time') => void
  onPickerChange: (event: DateTimePickerEvent, selected?: Date) => void
  onConfirmPicker: () => void
  onDismissPickerForOtherInput: () => void
}

function spotsSubtitle(maxSpots: number): string {
  const others = maxSpots - 1
  return others === 1
    ? strings.newPlan.spotsSubtitleYouPlusOne
    : strings.newPlan.spotsSubtitleYouPlusOthers(others)
}

function InlinePickerPanel({
  value,
  mode,
  minimumDate,
  onChange,
  onConfirm,
}: {
  value: Date
  mode: 'date' | 'time'
  minimumDate?: Date
  onChange: (event: DateTimePickerEvent, date?: Date) => void
  onConfirm: () => void
}) {
  return (
    <View className="px-3.5 pb-3" style={{ backgroundColor: Colors.white }}>
      <DateTimePicker
        value={value}
        mode={mode}
        display="spinner"
        minimumDate={minimumDate}
        onChange={onChange}
        // iOS spinner goes blank on real devices in dark mode without these.
        {...(Platform.OS === 'ios'
          ? {
              themeVariant: 'light' as const,
              textColor: Colors.ink.DEFAULT,
            }
          : {})}
      />
      <Pressable
        onPress={onConfirm}
        className="mt-2 self-end rounded-full border border-neutral-border px-7 py-2.5"
      >
        <Text className="text-body font-bold text-neutral-label">
          {strings.newPlan.pickerDone}
        </Text>
      </Pressable>
    </View>
  )
}

export function NewPlanFields({
  form,
  onPatchForm,
  titleFocused,
  onTitleFocus,
  onTitleBlur,
  descriptionFocused,
  onDescriptionFocus,
  onDescriptionBlur,
  placesRef,
  onLocationPlaceSelect,
  onLocationTextChange,
  onLocationFocus,
  activePicker,
  pickerDraft,
  onOpenPicker,
  onPickerChange,
  onConfirmPicker,
  onDismissPickerForOtherInput,
}: NewPlanFieldsProps) {
  const { activityType, title, description, location, date, time, maxSpots, visibility } = form

  return (
    <>
      <Text className="mb-2.5 mt-6 text-label font-bold uppercase tracking-[0.7px] text-neutral-label">
        {strings.newPlan.activityTypeSection}
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: CHIP_GAP }}>
        {(Object.entries(ACTIVITY_META) as [ActivityType, typeof ACTIVITY_META[ActivityType]][]).map(
          ([key, meta]) => {
            const selected = activityType === key
            return (
              <Pressable
                key={key}
                onPress={() => {
                  Keyboard.dismiss()
                  onDismissPickerForOtherInput()
                  onPatchForm({ activityType: key })
                }}
                style={[
                  styles.activityChip,
                  { width: CHIP_WIDTH },
                  {
                    backgroundColor: selected ? meta.bg : Colors.white,
                    borderColor: selected ? meta.accent : 'transparent',
                  },
                ]}
              >
                <Text className="text-[26px]">{meta.emoji}</Text>
                <Text
                  style={[
                    styles.activityChipLabel,
                    { color: selected ? meta.accent : Colors.black[400] },
                  ]}
                >
                  {meta.label}
                </Text>
              </Pressable>
            )
          },
        )}
      </View>

      <Text className="mb-2.5 mt-6 text-label font-bold uppercase tracking-[0.7px] text-neutral-label">
        {strings.newPlan.planSection}
      </Text>
      <View className="rounded-[14px] bg-white">
        <View className="flex-row items-start gap-3 px-4 py-4">
          <IconSquare className="bg-surface-orangeLight">
            <Ionicons name="pencil" size={18} color={Colors.activity.orange} />
          </IconSquare>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="mb-1 text-label font-bold tracking-wide text-neutral-label">
                {strings.newPlan.titleLabel}
              </Text>
              {titleFocused && (
                <Text
                  className={`text-label ${title.length > TITLE_WARN_THRESHOLD ? 'text-activity-orange' : 'text-neutral-label'}`}
                >
                  {title.length}/{NEW_PLAN_TITLE_MAX}
                </Text>
              )}
            </View>
            <TextInput
              value={title}
              onChangeText={text => onPatchForm({ title: text })}
              placeholder={strings.newPlan.titlePlaceholder}
              placeholderTextColor={Colors.neutral.label}
              maxLength={NEW_PLAN_TITLE_MAX}
              onFocus={onTitleFocus}
              onBlur={onTitleBlur}
              style={styles.titleInput}
            />
          </View>
        </View>

        <View className="mx-4 h-[0.5px] bg-neutral-divider" />

        <View className="flex-row items-start gap-3 px-4 py-4">
          <IconSquare className="bg-surface-orangeLight">
            <Feather name="align-left" size={18} color={Colors.activity.orange} />
          </IconSquare>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="mb-1 text-label font-bold tracking-wide text-neutral-label">
                {strings.newPlan.descriptionLabel}
              </Text>
              {descriptionFocused && (
                <Text className="text-label text-neutral-label">
                  {description.length}/{NEW_PLAN_DESCRIPTION_MAX}
                </Text>
              )}
            </View>
            <TextInput
              value={description}
              onChangeText={text => onPatchForm({ description: text })}
              placeholder={strings.newPlan.descriptionPlaceholder}
              placeholderTextColor={Colors.neutral.label}
              maxLength={NEW_PLAN_DESCRIPTION_MAX}
              multiline
              numberOfLines={3}
              onFocus={onDescriptionFocus}
              onBlur={onDescriptionBlur}
              className="min-h-[88px] p-0 text-lead text-neutral-body"
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>

      <Text className="mb-2.5 mt-6 text-label font-bold uppercase tracking-[0.7px] text-neutral-label">
        {strings.newPlan.whereWhenSection}
      </Text>
      <View className="rounded-[14px] bg-white">
        <LocationField
          ref={placesRef}
          value={location.name}
          onPlaceSelect={onLocationPlaceSelect}
          onTextChange={onLocationTextChange}
          onFocus={onLocationFocus}
        />

        <View className="mx-4 h-[0.5px] bg-neutral-divider" />

        <Pressable
          className={`flex-row items-start gap-3 px-4 py-4 ${activePicker === 'date' ? 'bg-primary-200' : ''}`}
          onPress={() => onOpenPicker('date')}
        >
          <IconSquare className="bg-surface-blueLight">
            <Ionicons name="calendar-outline" size={18} color={Colors.activity.blue} />
          </IconSquare>
          <View className="flex-1">
            <Text className="mb-1 text-label font-bold tracking-wide text-neutral-label">
              {strings.newPlan.dateLabel}
            </Text>
            <Text className={`text-lead font-medium ${date ? 'text-ink' : 'text-neutral-label'}`}>
              {date ? formatSheetDate(date) : strings.newPlan.datePlaceholder}
            </Text>
          </View>
        </Pressable>

        {activePicker === 'date' && (
          <InlinePickerPanel
            value={pickerDraft}
            mode="date"
            minimumDate={new Date()}
            onChange={onPickerChange}
            onConfirm={onConfirmPicker}
          />
        )}

        <View className="mx-4 h-[0.5px] bg-neutral-divider" />

        <Pressable
          className={`flex-row items-start gap-3 px-4 py-4 ${activePicker === 'time' ? 'bg-primary-200' : ''}`}
          onPress={() => onOpenPicker('time')}
        >
          <IconSquare className="bg-surface-blueLight">
            <Ionicons name="time-outline" size={18} color={Colors.activity.blue} />
          </IconSquare>
          <View className="flex-1">
            <Text className="mb-1 text-label font-bold tracking-wide text-neutral-label">
              {strings.newPlan.timeLabel}
            </Text>
            <Text className={`text-lead font-medium ${time ? 'text-ink' : 'text-neutral-label'}`}>
              {time ? formatSheetTime(time) : strings.newPlan.timePlaceholder}
            </Text>
          </View>
        </Pressable>

        {activePicker === 'time' && (
          <InlinePickerPanel
            value={pickerDraft}
            mode="time"
            onChange={onPickerChange}
            onConfirm={onConfirmPicker}
          />
        )}
      </View>

      {location.isPublic === false && (
        <Text
          className="mt-2 px-4 py-1.5 text-caption font-semibold"
          style={{ color: Colors.activity.amber }}
        >
          {strings.newPlan.locationPrivateWarning}
        </Text>
      )}

      <Text className="mb-2.5 mt-6 text-label font-bold uppercase tracking-[0.7px] text-neutral-label">
        {VERIFICATION_ENABLED
          ? strings.newPlan.spotsVisibilitySection
          : strings.newPlan.spotsSection}
      </Text>
      <View className="rounded-[14px] bg-white px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-3">
            <IconSquare className="bg-surface-greenLight">
              <Ionicons name="people-outline" size={18} color={Colors.activity.green} />
            </IconSquare>
            <View className="flex-1">
              <Text className="mb-1 text-label font-bold tracking-wide text-neutral-label">
                {strings.newPlan.spotsLabel}
              </Text>
              <Text className="text-lead font-semibold text-ink">
                {strings.newPlan.spotsCount(maxSpots)}
              </Text>
              <Text className="mt-0.5 text-caption text-black-400">
                {spotsSubtitle(maxSpots)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => {
                Keyboard.dismiss()
                onDismissPickerForOtherInput()
                onPatchForm({ maxSpots: Math.max(2, maxSpots - 1) })
              }}
              disabled={maxSpots === 2}
              className={`h-10 w-10 items-center justify-center rounded-full bg-neutral-border ${maxSpots === 2 ? 'opacity-40' : ''}`}
            >
              <Text className="text-title font-semibold text-ink">−</Text>
            </Pressable>
            <Text className="min-w-6 text-center text-title font-bold text-ink">
              {maxSpots}
            </Text>
            <Pressable
              onPress={() => {
                Keyboard.dismiss()
                onDismissPickerForOtherInput()
                onPatchForm({ maxSpots: Math.min(NEW_PLAN_MAX_SPOTS, maxSpots + 1) })
              }}
              disabled={maxSpots === NEW_PLAN_MAX_SPOTS}
              className={`h-10 w-10 items-center justify-center rounded-full bg-neutral-border ${maxSpots === NEW_PLAN_MAX_SPOTS ? 'opacity-40' : ''}`}
            >
              <Text className="text-title font-semibold text-ink">+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {VERIFICATION_ENABLED ? (
        <View className="mt-2 rounded-[14px] bg-white px-4 py-4">
          <Text className="mb-2.5 text-label font-bold tracking-wide text-neutral-label">
            {strings.newPlan.visibilityLabel}
          </Text>
          <View className="flex-row gap-2">
            {(
              [
                {
                  key: 'open' as const,
                  title: strings.newPlan.visibilityOpenTitle,
                  subtitle: strings.newPlan.visibilityOpenSubtitle,
                },
                {
                  key: 'locals' as const,
                  title: strings.newPlan.visibilityLocalTitle,
                  subtitle: strings.newPlan.visibilityLocalSubtitle,
                },
              ] as const
            ).map((option) => {
              const selected = visibility === option.key
              return (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    Keyboard.dismiss()
                    onPatchForm({ visibility: option.key as PlanVisibility })
                  }}
                  style={[
                    styles.visibilityOption,
                    selected
                      ? styles.visibilityOptionSelected
                      : styles.visibilityOptionDefault,
                  ]}
                >
                  <Text
                    style={[
                      styles.visibilityTitle,
                      selected
                        ? styles.visibilityTitleSelected
                        : styles.visibilityTitleDefault,
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Text style={styles.visibilitySubtitle}>
                    {option.subtitle}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  titleInput: {
    fontSize: FontSize.lead,
    fontWeight: '500',
    lineHeight: LineHeight.lead,
    minHeight: LineHeight.lead + 2,
    padding: 0,
    color: Colors.ink.DEFAULT,
    ...(Platform.OS === 'android'
      ? { includeFontPadding: false, textAlignVertical: 'center' }
      : {}),
  },
  activityChip: {
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  activityChipLabel: {
    fontSize: FontSize.label,
    fontWeight: '700',
  },
  visibilityOption: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  visibilityOptionSelected: {
    borderColor: Colors.activity.orangeDark,
    backgroundColor: Colors.surface.orangeLight,
  },
  visibilityOptionDefault: {
    borderColor: Colors.neutral.border,
    backgroundColor: Colors.white,
  },
  visibilityTitle: {
    fontSize: FontSize.body,
    fontWeight: '700',
  },
  visibilityTitleSelected: {
    color: Colors.activity.orangeDark,
  },
  visibilityTitleDefault: {
    color: Colors.ink.DEFAULT,
  },
  visibilitySubtitle: {
    fontSize: FontSize.caption,
    lineHeight: LineHeight.caption,
    color: Colors.black[400],
    marginTop: 3,
  },
})
