import { NewPlanFields } from '@/components/plans/NewPlanFields'
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
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { GooglePlacesTextInputRef } from 'react-native-google-places-textinput'

type ActivePicker = 'date' | 'time' | null

interface NewPlanSheetProps {
  onClose: () => void
}

export function NuevoPlanSheet({ onClose }: NewPlanSheetProps) {
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

  function handleLocationPlaceSelect(parsed: ParsedPlace) {
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

  const isValid = isNewPlanFormValid(form)

  return (
    <View className="flex-1 w-full">
      <Text className="text-center px-4 pt-1 pb-3 text-xl font-extrabold text-ink">
        {strings.newPlan.sheetTitle}
      </Text>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-4"
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <NewPlanFields
          form={form}
          onPatchForm={patchForm}
          titleFocused={titleFocused}
          onTitleFocus={() => setTitleFocused(true)}
          onTitleBlur={() => setTitleFocused(false)}
          descriptionFocused={descriptionFocused}
          onDescriptionFocus={() => setDescriptionFocused(true)}
          onDescriptionBlur={() => setDescriptionFocused(false)}
          placesRef={placesRef}
          onLocationPlaceSelect={handleLocationPlaceSelect}
          onLocationTextChange={handleLocationTextChange}
          activePicker={activePicker}
          pickerDraft={pickerDraft}
          onOpenPicker={openPicker}
          onPickerChange={handlePickerChange}
          onConfirmPicker={confirmPicker}
        />
      </ScrollView>

      <View className="bg-surface-sheet px-4 pb-7 pt-3">
        <TouchableOpacity
          disabled={!isValid || submitting}
          onPress={handleSubmit}
          className={`w-full items-center rounded-full bg-buttons-brown py-[15px] ${!isValid || submitting ? 'opacity-40' : ''}`}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-sm font-bold text-white ">
              {strings.newPlan.ctaButton}
            </Text>
          )}
        </TouchableOpacity>
        <Text
          className={`mt-[7px] text-center text-[10px] ${submitError ? 'text-activity-orange' : 'text-neutral-label'}`}
        >
          {submitError ?? strings.newPlan.ctaHint}
        </Text>
      </View>
    </View>
  )
}
