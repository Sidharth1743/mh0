import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'buddy_device_id';

export const getDeviceId = async () => {
    try {
        let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (!deviceId) {
            deviceId = uuidv4();
            await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
        }
        return deviceId;
    } catch (e) {
        console.error('Error managing deviceId', e);
        return 'fallback-device-id';
    }
};
