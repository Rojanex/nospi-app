import { ActivePicker, NewPlanFields } from '@/components/plans/NewPlanFields'
import { strings } from '@/constants/strings'
import { createPlan } from '@/lib/plans/createPlan'
import { ParsedPlace } from '@/lib/plans/formatPlace'
import {
  EMPTY_NEW_PLAN_FORM,
  EMPTY_NEW_PLAN_LOCATION,
  isNewPlanFormValid,
} from '@/lib/plans/newPlanForm'
import { NewPlanFormValues } from '@/types'
import { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import React, { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { GestureDetector, GestureType } from 'react-native-gesture-handler'
import { GooglePlacesTextInputRef } from 'react-native-google-places-textinput'
import { SharedValue } from 'react-native-reanimated'

interface NewPlanSheetProps {
  onClose: () => void
  scrollOffset: SharedValue<number>
  nativeScrollGesture: GestureType
}

export function NewPlanSheet({
  onClose,
  scrollOffset,
  nativeScrollGesture,
}: NewPlanSheetProps) {
  const placesRef = useRef<GooglePlacesTextInputRef>(null)
  const [form, setForm] = useState<NewPlanFormValues>(EMPTY_NEW_PLAN_FORM)
  const [activePicker, setActivePicker] = useState<ActivePicker>(null)
  const [pickerDraft, setPickerDraft] = useState(new Date())
  const [titleFocused, setTitleFocused] = useState(false)
  const [descriptionFocused, setDescriptionFocused] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function patchForm(patch: Partial<NewPlanFormValues>) {
    setForm(prev => ({ ...prev, ...patch }))
  }

  function openPicker(picker: 'date' | 'time') {
    Keyboard.dismiss()
    setPickerDraft(picker === 'date' ? (form.date ?? new Date()) : (form.time ?? new Date()))
    setActivePicker(picker)
  }

  function handlePickerChange(_event: DateTimePickerEvent, selected?: Date) {
    if (selected) setPickerDraft(selected)
  }

  function confirmPicker() {
    if (activePicker === 'date') patchForm({ date: pickerDraft })
    if (activePicker === 'time') patchForm({ time: pickerDraft })
    setActivePicker(null)
  }

  function dismissPickerForOtherInput() {
    if (!activePicker) return
    confirmPicker()
  }

  function handleLocationPlaceSelect(parsed: ParsedPlace) {
    Keyboard.dismiss()
    patchForm({
      location: {
        name: parsed.locationName,
        placeId: parsed.locationPlaceId,
        lat: parsed.locationLat,
        lng: parsed.locationLng,
        isPublic: parsed.locationIsPublic,
      },
    })
  }

  function handleLocationTextChange(text: string) {
    setForm(prev => ({
      ...prev,
      location: text === '' ? EMPTY_NEW_PLAN_LOCATION : { ...prev.location, name: text },
    }))
  }

  async function handleSubmit() {
    Keyboard.dismiss()
    setSubmitting(true)
    setSubmitError(null)

    const { error } = await createPlan(form)

    setSubmitting(false)

    if (error) {
      setSubmitError(error)
      return
    }

    setForm(EMPTY_NEW_PLAN_FORM)
    setActivePicker(null)
    onClose()
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollOffset.value = event.nativeEvent.contentOffset.y
  }

  const isValid = isNewPlanFormValid(form)
  const isSubmitDisabled = !isValid || submitting

  return (
    <View className="flex-1 w-full">
      <Pressable onPress={Keyboard.dismiss} className="px-4">

      </Pressable>

      <GestureDetector gesture={nativeScrollGesture}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow px-4 pb-4"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onScrollBeginDrag={Keyboard.dismiss}
        >
          
          <NewPlanFields
            form={form}
            onPatchForm={patchForm}
            titleFocused={titleFocused}
            onTitleFocus={() => {
              dismissPickerForOtherInput()
              setTitleFocused(true)
            }}
            onTitleBlur={() => setTitleFocused(false)}
            descriptionFocused={descriptionFocused}
            onDescriptionFocus={() => {
              dismissPickerForOtherInput()
              setDescriptionFocused(true)
            }}
            onDescriptionBlur={() => setDescriptionFocused(false)}
            placesRef={placesRef}
            onLocationPlaceSelect={handleLocationPlaceSelect}
            onLocationTextChange={handleLocationTextChange}
            onLocationFocus={dismissPickerForOtherInput}
            activePicker={activePicker}
            pickerDraft={pickerDraft}
            onOpenPicker={openPicker}
            onPickerChange={handlePickerChange}
            onConfirmPicker={confirmPicker}
            onDismissPickerForOtherInput={dismissPickerForOtherInput}
          />
        </ScrollView>
      </GestureDetector>

      <View className="bg-surface-sheet px-4 pb-7 pt-3">
        <Pressable
          key={isSubmitDisabled ? 'submit-disabled' : 'submit-enabled'}
          disabled={isSubmitDisabled}
          onPress={() => {
            void handleSubmit()
          }}
          className="w-full items-center rounded-full bg-buttons-brown py-[15px]"
          style={{ opacity: isSubmitDisabled ? 0.4 : 1 }}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-sm font-bold text-white ">
              {strings.newPlan.addButton}
            </Text>
          )}
        </Pressable>
        {submitError ? (
          <Text className="mt-2 text-center text-xs font-semibold text-danger">
            {submitError}
          </Text>
        ) : (
          <Text className="mt-[7px] text-center text-[10px] text-neutral-label">
            {strings.newPlan.ctaHint}
          </Text>
        )}
      </View>
    </View>
  )
}
