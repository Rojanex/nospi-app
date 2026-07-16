import { Colors } from '@/assets/constants/Colors'
import { IconSquare } from '@/components/plans/IconSquare'
import { LocationField } from '@/components/plans/LocationField'
import { ACTIVITY_META, ActivityType } from '@/components/plans/PlanCard'
import { strings } from '@/constants/strings'
import { NEW_PLAN_DESCRIPTION_MAX, NEW_PLAN_TITLE_MAX } from '@/lib/env_reader'
import { ParsedPlace } from '@/lib/plans/formatPlace'
import { formatSheetDate, formatSheetTime } from '@/lib/plans/formatSheetDateTime'
import { NewPlanFormValues, PlanVisibility } from '@/types'
import { Feather, Ionicons } from '@expo/vector-icons'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import React, { RefObject } from 'react'
import {
  Dimensions,
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
const CHIP_WIDTH = (SCREEN_WIDTH - 32 - 24) / 4

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
  activePicker: ActivePicker
  pickerDraft: Date
  onOpenPicker: (picker: 'date' | 'time') => void
  onPickerChange: (event: DateTimePickerEvent, selected?: Date) => void
  onConfirmPicker: () => void
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
    <View className="px-3.5 pb-3">
      <DateTimePicker
        value={value}
        mode={mode}
        display="spinner"
        minimumDate={minimumDate}
        onChange={onChange}
      />
      <Pressable
        onPress={onConfirm}
        className="mt-2 self-end rounded-full border border-neutral-border px-7 py-2"
      >
        <Text className="text-sm font-bold text-neutral-label">
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
  activePicker,
  pickerDraft,
  onOpenPicker,
  onPickerChange,
  onConfirmPicker,
}: NewPlanFieldsProps) {
  const { activityType, title, description, location, date, time, maxSpots, visibility } = form

  return (
    <>
      <Text className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.7px] text-neutral-label">
        {strings.newPlan.activityTypeSection}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {(Object.entries(ACTIVITY_META) as [ActivityType, typeof ACTIVITY_META[ActivityType]][]).map(
          ([key, meta]) => {
            const selected = activityType === key
            return (
              <Pressable
                key={key}
                onPress={() => onPatchForm({ activityType: key })}
                style={[
                  styles.activityChip,
                  { width: CHIP_WIDTH },
                  {
                    backgroundColor: selected ? meta.bg : Colors.white,
                    borderColor: selected ? meta.accent : 'transparent',
                  },
                ]}
              >
                <Text className="text-[22px]">{meta.emoji}</Text>
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

      <Text className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.7px] text-neutral-label">
        {strings.newPlan.planSection}
      </Text>
      <View className="rounded-[14px] bg-white">
        <View className="flex-row items-start gap-2.5 px-3.5 py-3">
          <IconSquare className="bg-surface-orangeLight">
            <Ionicons name="pencil" size={14} color={Colors.activity.orange} />
          </IconSquare>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="mb-1 text-[10px] font-bold tracking-wide text-neutral-label">
                {strings.newPlan.titleLabel}
              </Text>
              {titleFocused && (
                <Text
                  className={`text-[10px] ${title.length > TITLE_WARN_THRESHOLD ? 'text-activity-orange' : 'text-neutral-label'}`}
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

        <View className="mx-3.5 h-[0.5px] bg-neutral-divider" />

        <View className="flex-row items-start gap-2.5 px-3.5 py-3">
          <IconSquare className="bg-surface-orangeLight">
            <Feather name="align-left" size={14} color={Colors.activity.orange} />
          </IconSquare>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="mb-1 text-[10px] font-bold tracking-wide text-neutral-label">
                {strings.newPlan.descriptionLabel}
              </Text>
              {descriptionFocused && (
                <Text className="text-[10px] text-neutral-label">
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
              className="min-h-[60px] p-0 text-[13px] text-neutral-body"
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>

      <Text className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.7px] text-neutral-label">
        {strings.newPlan.whereWhenSection}
      </Text>
      <View className="rounded-[14px] bg-white">
        <LocationField
          ref={placesRef}
          value={location.name}
          onPlaceSelect={onLocationPlaceSelect}
          onTextChange={onLocationTextChange}
        />

        <View className="mx-3.5 h-[0.5px] bg-neutral-divider" />

        <Pressable
          className={`flex-row items-start gap-2.5 px-3.5 py-3 ${activePicker === 'date' ? 'bg-primary-200' : ''}`}
          onPress={() => onOpenPicker('date')}
        >
          <IconSquare className="bg-surface-blueLight">
            <Ionicons name="calendar-outline" size={14} color={Colors.activity.blue} />
          </IconSquare>
          <View className="flex-1">
            <Text className="mb-1 text-[10px] font-bold tracking-wide text-neutral-label">
              {strings.newPlan.dateLabel}
            </Text>
            <Text className={`text-sm font-medium ${date ? 'text-ink' : 'text-neutral-label'}`}>
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

        <View className="mx-3.5 h-[0.5px] bg-neutral-divider" />

        <Pressable
          className={`flex-row items-start gap-2.5 px-3.5 py-3 ${activePicker === 'time' ? 'bg-primary-200' : ''}`}
          onPress={() => onOpenPicker('time')}
        >
          <IconSquare className="bg-surface-blueLight">
            <Ionicons name="time-outline" size={14} color={Colors.activity.blue} />
          </IconSquare>
          <View className="flex-1">
            <Text className="mb-1 text-[10px] font-bold tracking-wide text-neutral-label">
              {strings.newPlan.timeLabel}
            </Text>
            <Text className={`text-sm font-medium ${time ? 'text-ink' : 'text-neutral-label'}`}>
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
          className="mt-1.5 px-3.5 py-1.5 text-[11px] font-semibold"
          style={{ color: Colors.activity.amber }}
        >
          {strings.newPlan.locationPrivateWarning}
        </Text>
      )}

      <Text className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.7px] text-neutral-label">
        {strings.newPlan.spotsVisibilitySection}
      </Text>
      <View className="rounded-[14px] bg-white px-3.5 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-2.5">
            <IconSquare className="bg-surface-greenLight">
              <Ionicons name="people-outline" size={14} color={Colors.activity.green} />
            </IconSquare>
            <View className="flex-1">
              <Text className="mb-1 text-[10px] font-bold tracking-wide text-neutral-label">
                {strings.newPlan.spotsLabel}
              </Text>
              <Text className="text-[13px] font-semibold text-ink">
                {strings.newPlan.spotsCount(maxSpots)}
              </Text>
              <Text className="mt-0.5 text-[11px] text-black-400">
                {spotsSubtitle(maxSpots)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => onPatchForm({ maxSpots: Math.max(2, maxSpots - 1) })}
              disabled={maxSpots === 2}
              className={`h-[30px] w-[30px] items-center justify-center rounded-full bg-neutral-border ${maxSpots === 2 ? 'opacity-40' : ''}`}
            >
              <Text className="text-lg font-semibold leading-5 text-ink">−</Text>
            </Pressable>
            <Text className="min-w-4 text-center text-base font-bold text-ink">
              {maxSpots}
            </Text>
            <Pressable
              onPress={() => onPatchForm({ maxSpots: Math.min(5, maxSpots + 1) })}
              disabled={maxSpots === 5}
              className={`h-[30px] w-[30px] items-center justify-center rounded-full bg-neutral-border ${maxSpots === 5 ? 'opacity-40' : ''}`}
            >
              <Text className="text-lg font-semibold leading-5 text-ink">+</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="mt-2 rounded-[14px] bg-white px-3.5 py-3">
        <Text className="mb-2 text-[10px] font-bold tracking-wide text-neutral-label">
          {strings.newPlan.visibilityLabel}
        </Text>
        <View className="flex-row gap-1.5">
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
                onPress={() => onPatchForm({ visibility: option.key as PlanVisibility })}
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
    </>
  )
}

const styles = StyleSheet.create({
  titleInput: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    minHeight: 22,
    padding: 0,
    color: Colors.ink,
    ...(Platform.OS === 'android'
      ? { includeFontPadding: false, textAlignVertical: 'center' }
      : {}),
  },
  activityChip: {
    alignItems: 'center',
    gap: 4,
    borderRadius: 13,
    borderWidth: 1.5,
    paddingHorizontal: 3,
    paddingVertical: 9,
  },
  activityChipLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  visibilityOption: {
    flex: 1,
    borderRadius: 11,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 9,
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
    fontSize: 12,
    fontWeight: '700',
  },
  visibilityTitleSelected: {
    color: Colors.activity.orangeDark,
  },
  visibilityTitleDefault: {
    color: Colors.ink,
  },
  visibilitySubtitle: {
    fontSize: 9,
    color: Colors.black[400],
    marginTop: 2,
  },
})
