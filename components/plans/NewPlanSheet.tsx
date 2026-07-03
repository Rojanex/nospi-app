import { ACTIVITY_META, ActivityType } from '@/components/plans/PlanCard'
import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import { NEW_PLAN_DESCRIPTION_MAX, NEW_PLAN_TITLE_MAX } from '@/lib/env_reader'
import { Feather, Ionicons } from '@expo/vector-icons'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import React, { useState } from 'react'
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width
const TITLE_WARN_THRESHOLD = NEW_PLAN_TITLE_MAX - 8
const CHIP_WIDTH = (SCREEN_WIDTH - 32 - 24) / 4

type ActivePicker = 'date' | 'time' | null

interface NewPlanSheetProps {
  onClose: () => void
}

function formatDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function formatTime(time: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(time)
}

function spotsSubtitle(maxSpots: number): string {
  const others = maxSpots - 1
  return others === 1
    ? strings.newPlan.spotsSubtitleYouPlusOne
    : strings.newPlan.spotsSubtitleYouPlusOthers(others)
}

function IconSquare({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <View
      className={`h-[30px] w-[30px] items-center justify-center rounded-[9px] ${className ?? ''}`}
    >
      {children}
    </View>
  )
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

export function NuevoPlanSheet({ onClose: _onClose }: NewPlanSheetProps) {
  const [activityType, setActivityType] = useState<ActivityType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<Date | null>(null)
  const [maxSpots, setMaxSpots] = useState(3)
  const [visibility, setVisibility] = useState<'open' | 'local'>('open')
  const [activePicker, setActivePicker] = useState<ActivePicker>(null)
  const [pickerDraft, setPickerDraft] = useState(new Date())
  const [titleFocused, setTitleFocused] = useState(false)
  const [descriptionFocused, setDescriptionFocused] = useState(false)

  function openPicker(picker: 'date' | 'time') {
    setPickerDraft(picker === 'date' ? (date ?? new Date()) : (time ?? new Date()))
    setActivePicker(picker)
  }

  function handlePickerChange(_event: DateTimePickerEvent, selected?: Date) {
    if (selected) setPickerDraft(selected)
  }

  function confirmPicker() {
    if (activePicker === 'date') setDate(pickerDraft)
    if (activePicker === 'time') setTime(pickerDraft)
    setActivePicker(null)
  }

  const isValid =
    !!activityType &&
    title.trim().length >= 3 &&
    locationName.trim().length > 0 &&
    !!date &&
    !!time

  return (
    <View className="flex-1 w-full">
      <Text className="text-center px-4 pt-1 pb-3 text-xl font-extrabold text-ink">
        {strings.newPlan.sheetTitle}
      </Text>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
                  onPress={() => setActivityType(key)}
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
        <View className="overflow-hidden rounded-[14px] bg-white">
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
                onChangeText={setTitle}
                placeholder={strings.newPlan.titlePlaceholder}
                placeholderTextColor={Colors.neutral.label}
                maxLength={NEW_PLAN_TITLE_MAX}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                className="p-0 text-sm font-medium text-ink"
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
                onChangeText={setDescription}
                placeholder={strings.newPlan.descriptionPlaceholder}
                placeholderTextColor={Colors.neutral.label}
                maxLength={NEW_PLAN_DESCRIPTION_MAX}
                multiline
                numberOfLines={3}
                onFocus={() => setDescriptionFocused(true)}
                onBlur={() => setDescriptionFocused(false)}
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
          <View className="flex-row items-start gap-2.5 px-3.5 py-3">
            <IconSquare className="bg-surface-greenLight">
              <Ionicons name="location-outline" size={14} color={Colors.activity.green} />
            </IconSquare>
            <View className="flex-1">
              <Text className="mb-1 text-[10px] font-bold tracking-wide text-neutral-label">
                {strings.newPlan.locationLabel}
              </Text>
              <TextInput
                value={locationName}
                onChangeText={setLocationName}
                placeholder={strings.newPlan.locationPlaceholder}
                placeholderTextColor={Colors.neutral.label}
                className="p-0 text-sm font-medium text-ink"
              />
            </View>
          </View>

          <View className="mx-3.5 h-[0.5px] bg-neutral-divider" />

          <Pressable
            className={`flex-row items-start gap-2.5 px-3.5 py-3 ${activePicker === 'date' ? 'bg-primary-200' : ''}`}
            onPress={() => openPicker('date')}
          >
            <IconSquare className="bg-surface-blueLight">
              <Ionicons name="calendar-outline" size={14} color={Colors.activity.blue} />
            </IconSquare>
            <View className="flex-1">
              <Text className="mb-1 text-[10px] font-bold tracking-wide text-neutral-label">
                {strings.newPlan.dateLabel}
              </Text>
              <Text className={`text-sm font-medium ${date ? 'text-ink' : 'text-neutral-label'}`}>
                {date ? formatDate(date) : strings.newPlan.datePlaceholder}
              </Text>
            </View>
          </Pressable>

          {activePicker === 'date' && (
            <InlinePickerPanel
              value={pickerDraft}
              mode="date"
              minimumDate={new Date()}
              onChange={handlePickerChange}
              onConfirm={confirmPicker}
            />
          )}

          <View className="mx-3.5 h-[0.5px] bg-neutral-divider" />

          <Pressable
            className={`flex-row items-start gap-2.5 px-3.5 py-3 ${activePicker === 'time' ? 'bg-primary-200' : ''}`}
            onPress={() => openPicker('time')}
          >
            <IconSquare className="bg-surface-blueLight">
              <Ionicons name="time-outline" size={14} color={Colors.activity.blue} />
            </IconSquare>
            <View className="flex-1">
              <Text className="mb-1 text-[10px] font-bold tracking-wide text-neutral-label">
                {strings.newPlan.timeLabel}
              </Text>
              <Text className={`text-sm font-medium ${time ? 'text-ink' : 'text-neutral-label'}`}>
                {time ? formatTime(time) : strings.newPlan.timePlaceholder}
              </Text>
            </View>
          </Pressable>

          {activePicker === 'time' && (
            <InlinePickerPanel
              value={pickerDraft}
              mode="time"
              onChange={handlePickerChange}
              onConfirm={confirmPicker}
            />
          )}
        </View>

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
                onPress={() => setMaxSpots((prev) => Math.max(2, prev - 1))}
                disabled={maxSpots === 2}
                className={`h-[30px] w-[30px] items-center justify-center rounded-full bg-neutral-border ${maxSpots === 2 ? 'opacity-40' : ''}`}
              >
                <Text className="text-lg font-semibold leading-5 text-ink">−</Text>
              </Pressable>
              <Text className="min-w-4 text-center text-base font-bold text-ink">
                {maxSpots}
              </Text>
              <Pressable
                onPress={() => setMaxSpots((prev) => Math.min(5, prev + 1))}
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
                  key: 'local' as const,
                  title: strings.newPlan.visibilityLocalTitle,
                  subtitle: strings.newPlan.visibilityLocalSubtitle,
                },
              ] as const
            ).map((option) => {
              const selected = visibility === option.key
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setVisibility(option.key)}
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
      </ScrollView>

      <View className="bg-surface-sheet px-4 pb-7 pt-3">
        <TouchableOpacity
          disabled={!isValid}
          onPress={() =>
            console.log({
              activityType,
              title,
              description,
              locationName,
              date,
              time,
              maxSpots,
              visibility,
            })
          }
          className={`w-full items-center rounded-full bg-buttons-brown py-[15px] ${!isValid ? 'opacity-40' : ''}`}
        >
          <Text className="text-sm font-bold text-white ">
            {strings.newPlan.ctaButton}
          </Text>
        </TouchableOpacity>
        <Text className="mt-[7px] text-center text-[10px] text-neutral-label">
          {strings.newPlan.ctaHint}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
