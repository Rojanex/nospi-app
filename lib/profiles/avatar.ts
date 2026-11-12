import { AVATAR_JPEG_QUALITY_PERCENT, AVATAR_SIZE_PX, AVATARS_BUCKET as BUCKET } from '@/lib/env_reader'
import { supabase } from '@/lib/supabase'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'

/**
 * NOS-31 · Profile photo.
 * Files live at avatars/{user_id}/{timestamp}.jpg
 */

export type PhotoSource = 'camera' | 'library'

export type PickResult = { status: 'picked'; uri: string } | { status: 'denied' } | null

export async function pickAvatar(source: PhotoSource): Promise<PickResult> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true, 
    aspect: [1, 1], 
    quality: 1,
  }

  let result: ImagePicker.ImagePickerResult
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) return { status: 'denied' }
    result = await ImagePicker.launchCameraAsync(options)
  } else {
    // The system photo picker needs no permission on iOS 14+ or Android 13+.
    result = await ImagePicker.launchImageLibraryAsync(options)
  }

  if (result.canceled || !result.assets[0]) return null
  return { status: 'picked', uri: result.assets[0].uri }
}


export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const rendered = await ImageManipulator.manipulate(uri).resize({ width: AVATAR_SIZE_PX }).renderAsync()
  const image = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: AVATAR_JPEG_QUALITY_PERCENT / 100,
    base64: true,
  })
  if (!image.base64) throw new Error('Image manipulator returned no data')

  // ArrayBuffer instead of a Blob/FormData: those upload 0 bytes in React Native.
  const bytes = Uint8Array.from(atob(image.base64), c => c.charCodeAt(0))

  const fileName = `${Date.now()}.jpg`
  const path = `${userId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    // contentType is required: the bucket only accepts image/jpeg.
    .upload(path, bytes.buffer, { contentType: 'image/jpeg', upsert: false })
  if (uploadError) {
    console.error('[uploadAvatar] upload', uploadError)
    throw uploadError
  }

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId)
  if (updateError) {
    console.error('[uploadAvatar] profile', updateError)
    await supabase.storage.from(BUCKET).remove([path])
    throw updateError
  }

  await removeFiles(userId, fileName)

  return publicUrl
}

export async function removeAvatar(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', userId)
  if (error) {
    console.error('[removeAvatar] profile', error)
    throw error
  }
  await removeFiles(userId)
}

async function removeFiles(userId: string, keep?: string): Promise<void> {
  const { data: files, error: listError } = await supabase.storage.from(BUCKET).list(userId)
  if (listError) {
    console.error('[avatar] list', listError)
    return
  }

  const paths = (files ?? []).filter(f => f.name !== keep).map(f => `${userId}/${f.name}`)
  if (paths.length === 0) return

  const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths)
  if (removeError) console.error('[avatar] remove', removeError)
}
