import * as Linking from 'expo-linking';

export const openPhoneNumber = (phoneNumber: string) => {
  const filterPhoneNo = phoneNumber.replace(/[-\s]/g, '');
  Linking.openURL(`tel:${filterPhoneNo}`);
};

export const openEmailAddress = (email: string) => {
  Linking.openURL(`mailto:${email}`);
};

export const openPlayStoreLink = (url: string) => {
  Linking.openURL(url);
};
