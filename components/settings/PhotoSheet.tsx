import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type PhotoAction = 'camera' | 'library' | 'remove'

type PhotoSheetProps = {
  visible: boolean
  hasPhoto: boolean
  onClose: () => void
  onChoose: (action: PhotoAction) => void
  /**
   * Called once the sheet is fully gone. Open the camera/gallery from here:
   * iOS silently ignores a picker opened while a Modal is still closing.
   */
  onDismiss: () => void
}

export function PhotoSheet({ visible, hasPhoto, onClose, onChoose, onDismiss }: PhotoSheetProps) {
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      onDismiss={onDismiss}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View
          className="w-full rounded-t-3xl bg-primary-200 px-5 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="mb-3 flex-row items-start justify-between gap-3">
            <Text className="shrink text-xl font-extrabold text-ink">
              {strings.settings.photoSheetTitle}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={strings.settings.cancel}
              className="h-8 w-8 items-center justify-center"
            >
              <Ionicons name="close" size={20} color={Colors.black[400]} />
            </Pressable>
          </View>

          <OptionRow
            icon="camera-outline"
            label={strings.settings.takePhoto}
            onPress={() => onChoose('camera')}
          />
          <OptionRow
            icon="images-outline"
            label={strings.settings.chooseFromLibrary}
            onPress={() => onChoose('library')}
          />
          {hasPhoto ? (
            <OptionRow
              icon="trash-outline"
              label={strings.settings.removePhoto}
              danger
              onPress={() => onChoose('remove')}
            />
          ) : null}

          <Pressable onPress={onClose} className="mt-2 w-full items-center py-3">
            <Text className="text-body font-semibold text-ink-50">{strings.settings.cancel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

type OptionRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  danger?: boolean
  onPress: () => void
}

function OptionRow({ icon, label, danger, onPress }: OptionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center gap-3 rounded-2xl px-2 py-3.5"
    >
      <Ionicons name={icon} size={22} color={danger ? Colors.danger : Colors.black[400]} />
      <Text className={`text-lead font-semibold ${danger ? 'text-danger' : 'text-ink'}`}>
        {label}
      </Text>
    </Pressable>
  )
}
