import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export async function fisResmiCek(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
  });

  if (result.canceled || !result.assets[0]) return null;

  // Compress image
  const compressed = await manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.7, format: SaveFormat.JPEG }
  );

  return compressed.uri;
}

export async function galeridenSec(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
  });

  if (result.canceled || !result.assets[0]) return null;

  const compressed = await manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.7, format: SaveFormat.JPEG }
  );

  return compressed.uri;
}
