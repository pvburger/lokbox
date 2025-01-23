# lokbox

_Password Manager_

## Summary

Lokbox is a free password management application for mobile devices, implemented in React-Native using TypeScript. Lokbox is distinguished by:

- Fully local implementation; no internet connection required
- User password hashing with salt, utilizing bcryptJS
- Robust encryption key derivation using PBKDF2 algorithm
- Random number generation and encryption via react-native-quick-crypto library
- Encrypted storage in ACID-compliant SQLite database

## Implemented Features

Lokbox is under development. Currently implemented features include:

- User account creation
- Adding/removing entries from database
- Viewing summary of all database entries
- Android compatibility
- Login status indicator

## Upcoming Features

Features which will be implemented in the near-term include:

- Downloading data to csv file (zipped and password-protected with AES-256) to a shared resource on device (i.e., Downloads folder)
- Search for single database entry
- Password generator to create cryptographically-secure passwords for the user, given a set of constraints (i.e., character pools)

## Future Goals

Features I'd like to incorporate further down the line include:

- iOS compatibility; currently lacking an iOS device for development
- Deployment on Google Play and The App Store

## Install

The instructions below reflect the Android workflow, as this is currently the only supported platform. To run the application, you will need to have Android Studio running an Android emulator, and you will need to run a custom development build. To load the application, clone the git repo and from the terminal (in the project directory):

1. Switch to the 'dev' branch  
   `~/.../lokbox$ git checkout dev`
2. Install dependencies  
   `~/.../lokbox$ npm install`
3. Create a prebuild  
   `~/.../lokbox$ npx expo prebuild --clean`
4. Update gradle  
   `~/.../lokbox$ cd android`  
   `~/.../lokbox/android$ ./gradlew clean`  
   `~/.../lokbox/android$ cd ..`
5. Run the build in the emulator  
   `~/.../lokbox$ npx expo prebuild && npx expo run:android`

## License

Lokbox is licensed under MIT
