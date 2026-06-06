import React from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type TabScreenProps = {
  header?: React.ReactNode
  children: React.ReactNode
  /** When false, skip top safe-area padding on body (e.g. scroll handles insets in ListHeaderComponent) */
  contentInsetTop?: boolean
}

export function TabScreen({ header, children, contentInsetTop = true }: TabScreenProps) {
  const insets = useSafeAreaInsets()

  return (
    <View className="screen-root">
      {header != null ? (
        <View style={{ paddingTop: insets.top + 5 }}>
          {header}
        </View>
      ) : null}
      <View
        className="tab-body"
        style={
          header == null && contentInsetTop
            ? { paddingTop: insets.top }
            : undefined
        }
      >
        {children}
      </View>
    </View>
  )
}
