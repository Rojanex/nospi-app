import { ACTIVITY_META, ActivityType } from '@/components/plans/PlanCard'
import { Feather, Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import React, { useState } from 'react'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width
const CHIP_WIDTH = (SCREEN_WIDTH - 32 - 24) / 4

interface NuevoPlanSheetProps {
  onClose: () => void
}

const sectionLabel: TextStyle = {
  fontSize: 10,
  fontWeight: '700',
  color: '#A09890',
  letterSpacing: 0.7,
  textTransform: 'uppercase',
  marginTop: 16,
  marginBottom: 8,
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
  return others === 1 ? 'tú + 1 persona' : `tú + ${others} personas`
}

function IconSquare({
  bg,
  children,
}: {
  bg: string
  children: React.ReactNode
}) {
  return (
    <View style={[styles.iconSquare, { backgroundColor: bg }]}>
      {children}
    </View>
  )
}

export function NuevoPlanSheet({ onClose: _onClose }: NuevoPlanSheetProps) {
  const [activityType, setActivityType] = useState<ActivityType | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState<Date | null>(null)
  const [maxSpots, setMaxSpots] = useState(3)
  const [visibility, setVisibility] = useState<'open' | 'local'>('open')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [titleFocused, setTitleFocused] = useState(false)
  const [descriptionFocused, setDescriptionFocused] = useState(false)

  const isValid =
    !!activityType &&
    title.trim().length >= 3 &&
    locationName.trim().length > 0 &&
    !!date &&
    !!time

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Activity type */}
        <Text style={sectionLabel}>¿qué tipo de plan?</Text>
        <View style={styles.chipGrid}>
          {(Object.entries(ACTIVITY_META) as [ActivityType, typeof ACTIVITY_META[ActivityType]][]).map(
            ([key, meta]) => {
              const selected = activityType === key
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setActivityType(key)}
                  style={[
                    styles.chip,
                    { width: CHIP_WIDTH },
                    {
                      backgroundColor: selected ? meta.bg : '#FFFFFF',
                      borderColor: selected ? meta.accent : 'transparent',
                    },
                  ]}
                >
                  <Text style={styles.chipEmoji}>{meta.emoji}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: selected ? meta.accent : '#8A837B' },
                    ]}
                  >
                    {meta.label}
                  </Text>
                </TouchableOpacity>
              )
            },
          )}
        </View>

        {/* El plan */}
        <Text style={sectionLabel}>el plan</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <IconSquare bg="#FEF3EA">
              <Ionicons name="pencil" size={14} color="#E8642A" />
            </IconSquare>
            <View style={styles.cardRowContent}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>TÍTULO</Text>
                {titleFocused && (
                  <Text
                    style={[
                      styles.charCounter,
                      title.length > 72 && styles.charCounterWarn,
                    ]}
                  >
                    {title.length}/80
                  </Text>
                )}
              </View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="¿cuál es el plan?"
                placeholderTextColor="#A09890"
                maxLength={80}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                style={styles.titleInput}
              />
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.cardRow}>
            <IconSquare bg="#FEF3EA">
              <Feather name="align-left" size={14} color="#E8642A" />
            </IconSquare>
            <View style={styles.cardRowContent}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>DESCRIPCIÓN (OPCIONAL)</Text>
                {descriptionFocused && (
                  <Text style={styles.charCounter}>
                    {description.length}/300
                  </Text>
                )}
              </View>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="agrega detalles del plan..."
                placeholderTextColor="#A09890"
                maxLength={300}
                multiline
                numberOfLines={3}
                onFocus={() => setDescriptionFocused(true)}
                onBlur={() => setDescriptionFocused(false)}
                style={styles.descriptionInput}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Dónde y cuándo */}
        <Text style={sectionLabel}>¿dónde y cuándo?</Text>
        <View style={styles.card}>
          {/* TODO: replace with GooglePlacesAutocomplete */}
          <View style={styles.cardRow}>
            <IconSquare bg="#E8F4EE">
              <Ionicons name="location-outline" size={14} color="#2D8B5A" />
            </IconSquare>
            <View style={styles.cardRowContent}>
              <Text style={styles.fieldLabel}>LUGAR</Text>
              <TextInput
                value={locationName}
                onChangeText={setLocationName}
                placeholder="busca un sitio..."
                placeholderTextColor="#A09890"
                style={styles.locationInput}
              />
            </View>
          </View>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => setShowDatePicker(true)}
          >
            <IconSquare bg="#E6F1FB">
              <Ionicons name="calendar-outline" size={14} color="#185FA5" />
            </IconSquare>
            <View style={styles.cardRowContent}>
              <Text style={styles.fieldLabel}>FECHA</Text>
              <Text style={date ? styles.fieldValue : styles.fieldPlaceholder}>
                {date ? formatDate(date) : 'elige una fecha'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => setShowTimePicker(true)}
          >
            <IconSquare bg="#E6F1FB">
              <Ionicons name="time-outline" size={14} color="#185FA5" />
            </IconSquare>
            <View style={styles.cardRowContent}>
              <Text style={styles.fieldLabel}>HORA</Text>
              <Text style={time ? styles.fieldValue : styles.fieldPlaceholder}>
                {time ? formatTime(time) : 'elige la hora'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date ?? new Date()}
            mode="date"
            minimumDate={new Date()}
            onChange={(_, selected) => {
              setShowDatePicker(false)
              if (selected) setDate(selected)
            }}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={time ?? new Date()}
            mode="time"
            onChange={(_, selected) => {
              setShowTimePicker(false)
              if (selected) setTime(selected)
            }}
          />
        )}

        {/* Cupos y visibilidad */}
        <Text style={sectionLabel}>cupos y visibilidad</Text>
        <View style={styles.spotsCard}>
          <View style={styles.spotsRow}>
            <View style={styles.spotsLeft}>
              <IconSquare bg="#E8F4EE">
                <Ionicons name="people-outline" size={14} color="#2D8B5A" />
              </IconSquare>
              <View style={styles.spotsTextBlock}>
                <Text style={styles.fieldLabel}>CUPOS</Text>
                <Text style={styles.spotsCount}>{maxSpots} personas</Text>
                <Text style={styles.spotsSubtitle}>
                  {spotsSubtitle(maxSpots)}
                </Text>
              </View>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                onPress={() => setMaxSpots((prev) => Math.max(2, prev - 1))}
                disabled={maxSpots === 2}
                style={[
                  styles.stepperBtn,
                  maxSpots === 2 && styles.stepperBtnDisabled,
                ]}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{maxSpots}</Text>
              <TouchableOpacity
                onPress={() => setMaxSpots((prev) => Math.min(5, prev + 1))}
                disabled={maxSpots === 5}
                style={[
                  styles.stepperBtn,
                  maxSpots === 5 && styles.stepperBtnDisabled,
                ]}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.visibilityCard}>
          <Text style={styles.visibilityLabel}>¿QUIÉN PUEDE UNIRSE?</Text>
          <View style={styles.visibilityOptions}>
            {(
              [
                {
                  key: 'open' as const,
                  title: 'abierto',
                  subtitle: 'cualquier Nospero verificado',
                },
                {
                  key: 'local' as const,
                  title: 'solo locales',
                  subtitle: 'únicamente locales verificados',
                },
              ] as const
            ).map((option) => {
              const selected = visibility === option.key
              return (
                <TouchableOpacity
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
                      { color: selected ? '#D4650E' : '#1C1B19' },
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Text style={styles.visibilitySubtitle}>
                    {option.subtitle}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
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
          style={[styles.ctaButton, !isValid && styles.ctaButtonDisabled]}
        >
          <Text style={styles.ctaLabel}>¡crear parche! ✓</Text>
        </TouchableOpacity>
        <Text style={styles.ctaHint}>
          tu plan aparece en el feed de una vez
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 13,
    paddingVertical: 9,
    paddingHorizontal: 3,
    alignItems: 'center',
    gap: 4,
  },
  chipEmoji: {
    fontSize: 22,
  },
  chipLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  cardRowContent: {
    flex: 1,
  },
  iconSquare: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A09890',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  charCounter: {
    fontSize: 10,
    color: '#A09890',
  },
  charCounterWarn: {
    color: '#E8642A',
  },
  titleInput: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1B19',
    padding: 0,
  },
  descriptionInput: {
    fontSize: 13,
    color: '#6B6560',
    padding: 0,
    minHeight: 60,
  },
  locationInput: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1B19',
    padding: 0,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1B19',
  },
  fieldPlaceholder: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A09890',
  },
  rowDivider: {
    height: 0.5,
    backgroundColor: '#F0EBE5',
    marginHorizontal: 14,
  },
  spotsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  spotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spotsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  spotsTextBlock: {
    flex: 1,
  },
  spotsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1B19',
  },
  spotsSubtitle: {
    fontSize: 11,
    color: '#8A837B',
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E6E0D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1B19',
    lineHeight: 20,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 16,
    textAlign: 'center',
    color: '#1C1B19',
  },
  visibilityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 9,
  },
  visibilityLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A09890',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  visibilityOptionSelected: {
    borderColor: '#D4650E',
    backgroundColor: '#FEF3EA',
  },
  visibilityOptionDefault: {
    borderColor: '#E6E0D8',
    backgroundColor: '#FFFFFF',
  },
  visibilityTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  visibilitySubtitle: {
    fontSize: 9,
    color: '#8A837B',
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: '#F2EDE8',
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#1C1B19',
    borderRadius: 99,
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.4,
  },
  ctaLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaHint: {
    fontSize: 10,
    color: '#A09890',
    textAlign: 'center',
    marginTop: 7,
  },
})
