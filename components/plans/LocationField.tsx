import { Colors } from '@/assets/constants/Colors'
import { IconSquare } from '@/components/plans/IconSquare'
import { strings } from '@/constants/strings'
import { FontSize } from '@/constants/typography'
import { GOOGLE_PLACES_KEY } from '@/lib/env_reader'
import { ParsedPlace, parsePlaceSelection } from '@/lib/plans/formatPlace'
import { Ionicons } from '@expo/vector-icons'
import React, { forwardRef, useState } from 'react'
import { Platform, Text, View, type TextStyle } from 'react-native'
import GooglePlacesTextInput, {
  GooglePlacesTextInputRef,
  GooglePlacesTextInputStyles,
  Place,
} from 'react-native-google-places-textinput'

type LocationFieldProps = {
  value: string
  onPlaceSelect: (parsed: ParsedPlace) => void
  onTextChange: (text: string) => void
  onFocus?: () => void
}

export const LocationField = forwardRef<GooglePlacesTextInputRef, LocationFieldProps>(
  function LocationField({ value, onPlaceSelect, onTextChange, onFocus }, ref) {
    const [inputEpoch, setInputEpoch] = useState(0)

    function handlePlaceSelect(place: Place) {
      setInputEpoch(epoch => epoch + 1)
      onPlaceSelect(parsePlaceSelection(place))
    }

    return (
      <View className="flex-row items-start gap-3 px-4 py-4">
        <IconSquare className="bg-surface-greenLight">
          <Ionicons name="location-outline" size={18} color={Colors.tone.green} />
        </IconSquare>
        <View className="z-10 flex-1">
          <Text className="mb-1 text-label font-bold tracking-wide text-neutral-label">
            {strings.newPlan.locationLabel}
          </Text>
          <GooglePlacesTextInput
            key={inputEpoch}
            ref={ref}
            apiKey={GOOGLE_PLACES_KEY}
            value={value}
            placeHolderText={strings.newPlan.locationPlaceholder}
            languageCode="es"
            includedRegionCodes={['co']}
            fetchDetails
            detailsFields={['types', 'displayName', 'location', 'id', 'addressComponents']}
            onPlaceSelect={handlePlaceSelect}
            onTextChange={onTextChange}
            onFocus={onFocus}
            onError={(error) => console.warn('Places API error:', error)}
            scrollEnabled={false}
            nestedScrollEnabled={false}
            showClearButton
            clearElement={
              <Ionicons name="close" size={18} color={Colors.neutral.label} />
            }
            style={placesTextInputStyles}
            suggestionTextProps={{
              mainTextNumberOfLines: 1,
              secondaryTextNumberOfLines: 1,
              ellipsizeMode: 'tail',
            }}
          />
        </View>
      </View>
    )
  },
)

const androidInputStyle: TextStyle =
  Platform.OS === 'android'
    ? { includeFontPadding: false, textAlignVertical: 'center' }
    : {}

const placesTextInputStyles: GooglePlacesTextInputStyles = {
  container: {
    flex: 0,
    zIndex: 10,
    margin: 0,
    padding: 0,
  },
  inputContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    margin: 0,
    borderWidth: 0,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: FontSize.lead,
    fontWeight: '500',
    color: Colors.ink.DEFAULT,
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
    ...androidInputStyle,
  },
  suggestionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: 6,
    zIndex: 1000,
    elevation: 8,
    shadowColor: Colors.black.DEFAULT,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    maxHeight: 260,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionText: {
    main: {
      fontSize: FontSize.body,
      color: Colors.ink.DEFAULT,
    },
    secondary: {
      fontSize: FontSize.caption,
      color: Colors.black[400],
    },
  },
  placeholder: {
    color: Colors.neutral.label,
  },
}
