<img src = "./assets/readme/rm_logo_lb.png">

# lokbox password manager

<br />

## Summary

Lokbox is a free password management application for mobile devices, implemented in React Native using TypeScript. Lokbox is distinguished by:

- Fully local implementation; no internet connection required
- Primary password hashing (incorporating a random salt), utilizing bcrypt.js
- Robust 32-byte encryption key derivation using PBKDF2
- Random number generation and encryption (AES-256) via react-native-quick-crypto library
- Encrypted storage in a sandboxed, local, ACID-compliant SQLite database
- Backup and restore functionality via zipped and encrypted CSV file  
  <br />

## Implemented Features

Lokbox is under active development. Implemented features include:

- User account creation
- Functionality to add, remove, and update database entries
- Special 'admin' menu
- Password generator to create cryptographically secure passwords and PINs for the user, based on a set of customizable constraints (i.e., character pools)
- Ability to view all database entries, either as ciphertext or as plaintext
- Login status indicator
- Option to download data to and update data from a CSV file (zipped and password-protected with AES-256)
- Android compatibility  
  <br />

## Upcoming Features

Features which will be implemented in the near term include:

- Search for single database entry
- Improvements in UI  
  <br />

## Future Goals

Long term goals include:

- iOS compatibility
- Deployment on Google Play and the App Store  
- Ongoing security improvements  
- Comprehensive security testing and auditing  
  <br />

## Install

The instructions below reflect the Android workflow, as this is currently the only supported platform. To run the application, you will need to have Android Studio running an Android emulator, and you will need to run a custom development build. Alternatively, one can build an APK file using the eas build tool, and sideload it to their Android device.

To load the application, clone the git repository, then run the following commands in the terminal (in the project directory):

1. Install dependencies  
   `~/.../lokbox$ npm install`
2. Create a prebuild  
   `~/.../lokbox$ npx expo prebuild --clean`
3. Update gradle  
   `~/.../lokbox$ cd android`  
   `~/.../lokbox/android$ ./gradlew clean`  
   `~/.../lokbox/android$ cd ..`
4. Option A: Run the build in the emulator  
   `~/.../lokbox$ npx expo prebuild && npx expo run:android`  
   ** OR **  
   Option B: Build an APK, and sideload it onto your Android device  
   `~/.../lokbox$ npx expo prebuild && eas build --local --platform android --profile preview`  
   <br />

## Instructions - Basic

#### Login Screen

From the login screen, the user can elect to 'login' or to 'register' a new account. Both options are self-explanatory. After creating a new account, the user will be logged out and must log in again to access their account. One may notice that logging in or registering can take several seconds. This is because the bcrypt, used to create and confirm password hashes, is a computationally-expensive algorithm intended to deter brute-force attacks. Bcrypt hashing is used during registration, login, and data export.

#### Main Menu - Data or Tools

From the main menu, the user has two options: 'data' and 'tools.' The 'data' menu organizes basic database functionality and includes components allowing users to 'check' their data, 'add' new data entries, 'remove' data entries, and 'update' data entries. The 'tools' menu complements the database functionality and includes standalone components to generate passwords/PINs ('passgen' and 'pingen', respectively), for exporting and importing data ('backup' and 'restore'), and 'color' to change the preferred background color.

#### check

The 'check' component can be used to quickly scan all of a user's data. While personal data is encrypted within the database, user information is displayed in plaintext on the 'check' screen. The user also has the option to see how the information is stored within the database using the Plaintext/Ciphertext toggle icons at the bottom of the screen.

#### add

The 'add' component is used to add additional entries to the database. All fields are optional except for 'organization.' Think of an 'organization' more like an 'entity,' rather than a 'corporation.' For example, if one wants to store their login credentials for their PC, one might make the 'organization' entry 'Dell Laptop' or something similar. All organization entries must be unique, so if one has several accounts with the same organization, they will have to be distinguished in some manner (i.e., Google-1, Google-2, etc.). The '!' button will automatically generate a cryptographically-secure random password (or PIN) if the user chooses to use it. The default settings for the password and PIN generators can be set in the 'passgen' and 'pingen' tools, respectively.

#### remove

The 'remove' component displays a list of all the 'organization' entries within a user's account. By selecting the bubble button adjacent to the 'organization' name, one can mark an entry for deletion. Once the user clicks 'delete,' selected entries are permanently deleted and cannot be restored.

#### update

Similar to the 'remove' component, the 'update' component displays a list of 'organization' entries from the user's account. Clicking on an organization name will bring the user to the 'add' component for that entry. Once loaded, the TextInput boxes will alternate displaying the prompt for the given TextInput, and the corresponding value for that category within the database. If there is no data for a given field within the database, the prompt will simply toggle on and off. To change any information, simply click in the corresponding TextInput, and update the data. A note of caution: if one clicks in a field that has (pre-existing) stored information and makes any sort of edit, even as simple as entering a space and then deleting it, the database data will be updated to the new value once the user clicks 'update.' If a field is empty because the user started entering a word and then erased it, the corresponding database entry will be set to null after clicking 'update.'

#### passgen

The 'passgen' tool is a standalone password generator. The user can adjust the _TOTAL CHARACTERS_ slider to adjust the size of the desired password (1-25), click the button adjacent to each type of character in _INCLUDED CHARACTER SETS_ to determine which characters are allowable in the password, and even set which special characters will be included in the _ALLOWABLE SPECIAL CHARACTERS_ section. To save these settings as the default, click 'save' after making your selections. The saved settings are used by the 'add' and 'update' components when automatically generating passwords. Click 'voilà' to generate a new password.

#### pingen

The 'pingen' tool is a standalone PIN generator. The user can adjust the _TOTAL DIGITS_ slider to adjust the size of the desired PIN (1-25). The 'voilà' and 'save' buttons function in the same manner as in the 'passgen' tool.

#### export

The 'export' tool allows the user to safely copy their data to an encrypted (AES-256), zipped CSV file. After clicking 'export', the user will be prompted for their login password. This is the password that will be used to password protect the exported file. Once the user successfully provides their password, the ZIP file is created in their Downloads folder. For more information, see 'Importing and Exporting' below.

#### import

The 'import' tool allows the user to add (or import) data to their account from an encrypted, zipped CSV file. After clicking 'import,' the user will be prompted to pick a relevant ZIP file from their Downloads directory. Next, the user will be prompted to enter the password for the ZIP file. If the CSV file is formatted correctly, data will then be applied to the user's lokbox database. For more information, see 'Importing and Exporting' below.

#### color

The 'color' tool is used to modify the background color for the lokbox application. Each user can select their own, bespoke color. After clicking 'color', the user can manipulate the color triangle until they've arrived at the perfect color. To ensure that the color persists to future sessions, make sure to click 'save' before returning to the main menu.  
<br />

## Instructions - Advanced

#### Importing and Exporting: Batch processing (single) user data

Users may find it easier to enter large amounts of data into the database by editing a CSV file on their PC instead of adding entries, individually, through the lokbox interface.

To get started, use the 'export' tool in the 'tools' menu to generate a password-protected, zipped CSV file. The user will be prompted to enter their login password. A ZIP file will be created in the Downloads folder of the user's Android device; copy this file to your computer. Bear in mind that, while the file is password-protected using the AES-256 algorithm, the encryption is not as robust as the encryption within the database itself, which uses the user password and PBKDF2 to derive a much more secure key to encrypt the data. Use caution when transferring the file; physically transferring the file between the Android device and the PC using a USB or microSD device is likely the most secure approach.

Once on the PC, extract the CSV from the ZIP archive using the user's login password. Use your favorite spreadsheet software to edit the CSV file. First, delete any pre-existing information from the CSV, but DO NOT edit or remove the column headers. Next, add new entries to the CSV. Be sure that each entry has a unique, non-blank 'data_org' (the 'organization' entry), otherwise file upload will fail. The 'data_created' and 'data_modified' columns are irrelevant; these will be populated by lokbox on upload. Save the CSV file (with a .csv extension). Next, zip the CSV file into a new ZIP archive. The ZIP archive MUST have the same name as the CSV file (with a .zip extension instead of .csv), and MUST be password-protected. The password does not have to be the same as the user's login password. Transfer this file back to the Android device, observing the same precautions as earlier. The file should be copied to the device's Downloads directory.

Finally, in the 'tools' menu, select 'import'. Select the relevant ZIP file from the Downloads directory. Next, enter the password used to encrypt the ZIP file on the PC. Assuming the aforementioned protocol was followed, new information from the CSV file should be applied to the user's lokbox database. This approach will append new data to the user's local lokbox database, leaving existing data intact.

#### Backup and Restore: Batch processing using the Admin Menu

The 'import' and 'export' tools allow individual users to add data to or copy data from their respective accounts. The Android device administrator ('admin'; i.e., the owner) also has the ability to create a backup copy of the entire database, and to restore from that backup copy. In order to do so, one must enable the 'admin' menu.

To get started, create an 'admin' account (i.e., using 'admin' as the login name) just as you would a standard account. Make sure to store the credentials for this account safely. Next, login to the 'admin' account. The user will be redirected to a special 'admin' menu.

Within the 'admin' menu, the 'users' tool can be used to remove selected users (and their data) from the database. 

The 'delete' button can be used to clear the entire lokbox database on the device. Unless one has a .backup file to restore from, all data will be lost. Use with extreme caution. Note that the 'admin' account is deleted as well.

Clicking the 'backup' button will create a .backup file in the user's Downloads folder. The backup file is a mirror of the information within the database itself. That is to say, any sensitive information remains encrypted and cannot be seen in plaintext by the administrator.

To restore information from a backup file, click the 'restore' button. After doing so, the user will be prompted to select a .backup file from the Downloads directory. Again, use this tool with extreme caution! The 'restore' option replaces the entire lokbox database on the device with the contents of the .backup file; it does NOT simply append new data. Note that this process intentionally deletes the 'admin' account from the device; it will need to be re-established before the 'admin' menu can be accessed again.  
<br />

## Buttons and Icons

<table>
<tr>
<td><img src = "./assets/readme/rm_led_red.png"></td>
<td style="vertical-align: middle;">Login status: no users logged in</td>
</tr>
<tr>
<td><img src = "./assets/readme/rm_led_green.png"></td>
<td style="vertical-align: middle;">Login status: user logged in</td>
</tr>
<tr>
<td><img src = "./assets/readme/rm_icon_exit.png"></td>
<td style="vertical-align: middle;">Logout button</td>
</tr>
<tr>
<td><img src = "./assets/readme/rm_icon_menu.png"></td>
<td style="vertical-align: middle;">Main Menu button</td>
</tr>
<tr>
<td><img src = "./assets/readme/rm_icon_open.png"></td>
<td style="vertical-align: middle;">Plaintext button</td>
</tr>
<tr>
<td><img src = "./assets/readme/rm_icon_close.png"></td>
<td style="vertical-align: middle;">Ciphertext button</td>
</tr>
</table>  
<br />

## Useful Tips

- Users can set default constraints for password and PIN generation within the 'passgen' and 'pingen' tools. These settings will be used by the 'add' component if the users elects to automatically generate a PIN or password.

- There is a login status indicator in the lower right corner of the screen. If it is illuminated in green, the user is logged in, while red indicates no one is currently logged in. Security precautions have been implemented so that in the event that the application becomes inactive, the current user is automatically logged out. Similarly, on file selection screens (i.e, when selecting a file to restore data), a timeout mechanism automatically logs out the user after 10 seconds if a file hasn't been selected.

- After successfully restoring data from a .backup file through the 'admin' menu, the 'admin' user account is automatically deleted. This is so the administrator can establish a new 'admin' account (post restoration) without having to know the password for the 'admin' account in the .backup file.  
  <br />  

## Disclaimer    

Lokbox is under active development and is currently in the 'Alpha' stage. The software is provided "AS IS", without warranty of any kind. Lokbox should not be relied upon to safeguard sensitive and/or valuable data. While efforts have been made to ensure security, Lokbox has not been comprehensively tested or audited. Users assume all risk and liability arising from their use of this software, as outlined in the MIT License. The developers shall not be held liable for any damages or data loss resulting from the use of this software.  

## License

This project is licensed under the terms of the MIT license.
