import React from 'react';
import { type ImageSourcePropType, Text } from 'react-native';

/**
 * One entry of the detailed first-time registration walkthrough.
 */
interface RegistrationStep {
  /** Badge label shown above the step title (e.g. "Step 1"). */
  step: string;
  /** Short title of the registration step. */
  title: string;
  /** Image source (local require or remote URI) rendered via {@link StepImage}. */
  source: ImageSourcePropType;
  /** Rich-text instruction body (may contain styled `<Text>` spans). */
  description: React.ReactNode;
  /** Placeholder text shown if the image cannot be resolved. */
  placeholder: string;
  /** Caption hint displayed under the image. */
  caption: string;
}

/**
 * One entry of a high-level step-by-step user manual overview, used by the
 * DLC and change-password guides (named after the `USER_MANUAL_*_STEPS`
 * arrays).
 */
interface UserManualDlcStep {
  /** Badge label shown in the blue pill (e.g. "STEP 1"). */
  step: string;
  /** Uppercase title of the overview step. */
  title: string;
  /** Plain-text summary sentence for the step. */
  desc: string;
  /** Placeholder text shown if the image cannot be resolved. */
  placeholder: string;
  /** Caption hint displayed under the image. */
  caption: string;
  /** Image source (local require or remote URI) rendered via {@link StepImage}. */
  source: ImageSourcePropType;
}

/**
 * Detailed first-time registration steps rendered inside section 6 of the
 * user manual screen.
 */
export const USER_GETTING_STARTED_STEPS: RegistrationStep[] = [
  {
    step: 'Step 1',
    title: 'Tap Register Link',
    source: require('@assets/images/manual/login.jpeg'),
    description: (
      <>
        Open the app and tap on{' '}
        <Text className="font-black text-primary">&quot;Register / Forgot Password&quot;</Text>{' '}
        Button at the bottom.
      </>
    ),
    placeholder: 'Login Screen showing Register button at bottom',
    caption: "Tap the text that says 'Register / Forgot Password'",
  },
  {
    step: 'Step 2',
    title: 'Tap Proceed to Registration',
    source: require('@assets/images/manual/reg/reg-instruction.jpg'),
    description: (
      <>
        On the Registration Guide screen, tap{' '}
        <Text className="font-black text-primary">&quot;Proceed to Registration&quot;</Text> to
        start the registration wizard.
      </>
    ),
    placeholder: 'Registration Guide screen with Proceed to Registration button',
    caption: 'Tap the Proceed to Registration button',
  },
  {
    step: 'Step 3',
    title: 'Scroll Down if Needed',
    source: require('@assets/images/manual/reg/reg-instruction-1.jpg'),
    description: (
      <>
        If the <Text className="font-black text-primary">&quot;Proceed to Registration&quot;</Text>{' '}
        button is not visible, scroll down to find it.
      </>
    ),
    placeholder: 'Registration Guide screen scrolled down to reveal Proceed to Registration button',
    caption: 'Scroll down if you cannot see the Proceed to Registration button',
  },
  {
    step: 'Step 4',
    title: 'Enter PPO Number',
    source: require('@assets/images/manual/reg/reg-1.jpeg'),
    description: (
      <>
        Enter your <Text className="font-black text-slate-900">PPO Number</Text> (printed on the
        front cover of your Pension Passbook) and tap{' '}
        <Text className="font-black text-primary">&quot;Check PPO Status&quot;</Text>
      </>
    ),
    placeholder: 'PPO Number input box screen with Check PPO Status button',
    caption: 'Type your PPO number, then tap Check PPO Status',
  },
  {
    step: 'Step 5',
    title: 'Enter DOB & Bank Account',
    source: require('@assets/images/manual/reg/reg-2.jpeg'),
    description: (
      <>
        Enter your <Text className="font-black text-slate-900">Organization</Text>,{' '}
        <Text className="font-black text-slate-900">Date of Birth</Text>, and{' '}
        <Text className="font-black text-slate-900">Bank Account Number</Text>, then tap{' '}
        <Text className="font-black text-primary">&quot;Next&quot;</Text>
      </>
    ),
    placeholder: 'Registration Form Screen with Organization, DOB, and Bank Account fields',
    caption: 'Fill in Organization, Date of Birth, and Bank account, then tap Next',
  },
  {
    step: 'Step 6',
    title: 'Enter Login Password',
    source: require('@assets/images/manual/reg/reg-3.jpeg'),
    description: (
      <>
        Enter your <Text className="font-black text-slate-900">Password</Text>, then re-enter it in{' '}
        <Text className="font-black text-slate-900">Confirm Password</Text>, then tap{' '}
        <Text className="font-black text-primary">&quot;Next&quot;</Text>
      </>
    ),
    placeholder: 'Password Form Screen',
    caption: 'Fill in Password and Confirm password, then tap Next',
  },
  {
    step: 'Step 7',
    title: 'Review & Submit',
    source: require('@assets/images/manual/reg/reg-4.jpeg'),
    description: (
      <>
        Review all your details on the confirmation screen, then tap{' '}
        <Text className="font-black text-primary">&quot;Submit&quot;</Text>.
      </>
    ),
    placeholder: 'Confirmation Screen with Submit button',
    caption: 'Check your details, then tap Submit to confirm',
  },
  {
    step: 'Step 8',
    title: 'Confirm Registration',
    source: require('@assets/images/manual/reg/reg-4.jpeg'),
    description: (
      <>
        A confirmation pop-up will appear asking if you&apos;re sure. Tap{' '}
        <Text className="font-black text-primary">&quot;Confirm&quot;</Text> to complete your
        registration, or <Text className="font-black text-slate-900">&quot;Cancel&quot;</Text> to go
        back and review your details.
      </>
    ),
    placeholder: 'Confirmation pop-up with Cancel and Confirm buttons',
    caption: 'Tap Confirm to finish registering',
  },
  {
    step: 'Step 9',
    title: 'Registration Successful',
    source: require('@assets/images/manual/reg/reg-5.jpg'),
    description: (
      <>
        A{' '}
        <Text className="font-black text-emerald-900">
          green &quot;Registration Successful&quot;
        </Text>{' '}
        screen will appear. Tap{' '}
        <Text className="font-black text-primary">&quot;Go to Login&quot;</Text> to return to the
        login screen.
      </>
    ),
    placeholder: 'Registration Successful screen with Go to Login button',
    caption: 'Tap Go to Login to return to the login screen',
  },
];

/**
 * Step-by-step guide for submitting the annual Digital Life Certificate (DLC),
 * from logging in to completing the submission. Each step's `source` is a
 * temporary existing manual image; replace with the matching screenshot image
 * when it becomes available. `placeholder` documents the screenshot needed.
 */
export const USER_MANUAL_DLC_STEPS: UserManualDlcStep[] = [
  {
    step: 'STEP 1',
    title: 'LOG IN TO YOUR ACCOUNT',
    desc: 'Open the app, enter your PPO Number and Password, then tap the Login button.',
    placeholder: 'Login screen with PPO Number and Password fields',
    caption: 'Enter your PPO Number and Password, then tap Login',
    source: require('@assets/images/manual/login.jpeg'),
  },
  {
    step: 'STEP 2',
    title: 'OPEN THE SUBMIT DLC TAB',
    desc: "At the bottom of the home screen, tap the 'Submit DLC' tab. If the tab button is not visible, scroll down until it appears, then tap it.",
    placeholder: 'Home screen with bottom tabs: Status, Submit DLC, Profile',
    caption: 'Tap the Submit DLC tab at the bottom of the screen',
    source: require('@assets/images/manual/home-screen.jpeg'),
  },
  {
    step: 'STEP 3',
    title: 'OR TAP THE SUBMIT DLC BUTTON',
    desc: "On the Verification Status screen, tap the blue 'SUBMIT DLC' button to open the Digital Life Certificate screen.",
    placeholder: 'Verification Status screen with a blue SUBMIT DLC button',
    caption: 'Tap the SUBMIT DLC button on the status screen',
    source: require('@assets/images/manual/dlc/dlc-1.jpg'),
  },
  {
    step: 'STEP 4',
    title: 'ALLOW CAMERA ACCESS',
    desc: "If asked, tap the 'Allow Camera Access' button so the app can use your camera. If the button is not shown, camera access is already granted - skip to the next step.",
    placeholder: 'Digital Life Certificate screen with Allow Camera Access button',
    caption: 'Tap the Allow Camera Access button on screen',
    source: require('@assets/images/manual/dlc/dlc-2.jpg'),
  },
  {
    step: 'STEP 5',
    title: 'TAP CAPTURE PHOTO',
    desc: "Read the instructions on the Digital Life Certificate screen, then tap the blue 'Capture Photo' button.",
    placeholder: 'Digital Life Certificate screen with Capture Photo button',
    caption: 'Tap the Capture Photo button',
    source: require('@assets/images/manual/dlc/dlc-3.jpg'),
  },
  {
    step: 'STEP 6',
    title: 'LOOK INTO THE CAMERA AND BLINK',
    desc: "Look straight into the camera, keep your face centred, and blink your eyes once. The photo is taken automatically. Follow the on-screen hints, such as 'Center your face' or 'Move closer to camera', if you need to adjust.",
    placeholder: 'Camera screen with face-detection hints and blink detection',
    caption: 'Look straight and blink your eyes once',
    source: require('@assets/images/manual/dlc/dlc-4.jpg'),
  },
  {
    step: 'STEP 7',
    title: 'WAIT FOR VERIFICATION',
    desc: 'Wait while the app processes and verifies your photo. Do not close the app.',
    placeholder: 'Loading screen with a "Please wait..." message',
    caption: 'Wait for the check to finish',
    source: require('@assets/images/manual/dlc/dlc-5.jpg'),
  },
  {
    step: 'STEP 8',
    title: 'TAKE THE SECOND PHOTO (IF REQUIRED)',
    desc: "If the app said it will capture your photo twice, review the first photo and tap 'Take Second Photo'. Then look into the camera and blink your eyes once more.",
    placeholder: 'Photo preview with a Take Second Photo button',
    caption: 'Tap Take Second Photo if the app needs a second photo',
    source: require('@assets/images/manual/dlc/dlc-7.jpg'),
  },
  {
    step: 'STEP 9',
    title: 'SUBMIT YOUR PHOTO',
    desc: "When a photo preview appears, review it and tap 'Submit Photo'. In the single-photo flow this step is skipped and the photo is submitted automatically.",
    placeholder: 'Photo preview with a Submit Photo button',
    caption: 'Review your photo, then tap Submit Photo',
    source: require('@assets/images/manual/dlc/dlc-8.jpg'),
  },
  {
    step: 'STEP 10',
    title: 'ANSWER THE QUESTIONS',
    desc: "If a Self-Declaration form appears, answer the questions. For example, tap 'Yes' or 'No' for 'Are you Re-Employed?' and for 'Are you Re-Married?' if it shows.",
    placeholder: 'Self-Declaration form with Yes / No options',
    caption: 'Tap Yes or No for each question',
    source: require('@assets/images/manual/dlc/dlc-6.jpg'),
  },
  {
    step: 'STEP 11',
    title: 'TAP SUBMIT',
    desc: "Tap the 'Submit' button on the Self-Declaration form to send your answers.",
    placeholder: 'Self-Declaration form with Submit button',
    caption: 'Tap the Submit button',
    source: require('@assets/images/manual/dlc/dlc-6.jpg'),
  },
  {
    step: 'STEP 12',
    title: 'CONFIRM THE TERMS',
    desc: "A 'Terms and Conditions' pop-up appears. Tap 'Yes' to confirm and finish submitting.",
    placeholder: 'Terms and Conditions confirmation pop-up',
    caption: 'Tap Yes on the Terms and Conditions pop-up',
    source: require('@assets/images/manual/dlc/dlc-9.jpg'),
  },
  {
    step: 'STEP 13',
    title: 'SEE YOUR RESULT',
    desc: "The result screen shows whether your Digital Life Certificate was submitted. If approved you will see a green success message. If rejected, tap 'Retake Photo'. If pending, it is awaiting official approval.",
    placeholder: 'Verification result screen showing success, rejected, or pending',
    caption: 'Check your result here',
    source: require('@assets/images/manual/dlc/dlc-10.jpg'),
  },
];

export const USER_MANUAL_CHANGE_PASSWORD_STEPS: UserManualDlcStep[] = [
  {
    step: 'STEP 1',
    title: 'LOG IN TO YOUR ACCOUNT',
    desc: 'Open the app, enter your PPO Number and Password, then tap the Submit button to log in.',
    placeholder: 'Login screen with PPO Number and Password fields',
    caption: 'Enter your PPO Number and Password, then tap Submit',
    source: require('@assets/images/manual/login.jpeg'),
  },
  {
    step: 'STEP 2',
    title: 'TAP THE DRAWER MENU ICON',
    desc: 'At the top of the home screen, tap the menu icon (three horizontal lines) to open the drawer.',
    placeholder: 'Home screen with hamburger menu icon at the top',
    caption: 'Tap the three-line menu icon at the top of the screen',
    source: require('@assets/images/manual/home-screen.jpeg'),
  },
  {
    step: 'STEP 3',
    title: 'TAP CHANGE PASSWORD',
    desc: "From the drawer menu, tap the 'Change Password' option.",
    placeholder: 'Drawer menu showing Change Password option',
    caption: "Select 'Change Password' from the menu",
    source: require('@assets/images/manual/change-password/cp-1.jpg'),
  },
  {
    step: 'STEP 4',
    title: 'ENTER YOUR OLD PASSWORD',
    desc: "In the 'Old Password' field, type your current password.",
    placeholder: 'Change Password form with Old Password field',
    caption: 'Type your current password in the Old Password field',
    source: require('@assets/images/manual/change-password/cp-2.jpg'),
  },
  {
    step: 'STEP 5',
    title: 'ENTER AND CONFIRM YOUR NEW PASSWORD',
    desc: "Type your new password in the 'New Password' field, then retype it in the 'Confirm New Password' field. Your new password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.",
    placeholder: 'Change Password form with New Password and Confirm New Password fields',
    caption: 'Enter your new password twice — once in each field',
    source: require('@assets/images/manual/change-password/cp-2-1.jpg'),
  },
  {
    step: 'STEP 6',
    title: 'TAP THE CHANGE PASSWORD BUTTON',
    desc: "Tap the 'Change Password' button at the bottom of the form. A confirmation pop-up will appear asking if you really want to update your password.",
    placeholder: 'Change Password form with Change Password button',
    caption: 'Tap the Change Password button to open the confirmation',
    source: require('@assets/images/manual/change-password/cp-2.jpg'),
  },
  {
    step: 'STEP 7',
    title: 'CONFIRM THE PASSWORD CHANGE',
    desc: "In the confirmation pop-up, tap 'Yes, Update' to finish. A green success message will appear confirming your password has been updated.",
    placeholder: 'Confirmation pop-up asking to update your password',
    caption: "Tap 'Yes, Update' to confirm and submit",
    source: require('@assets/images/manual/change-password/cp-3.jpg'),
  },
  {
    step: 'STEP 8',
    title: 'SEE THE SUCCESS MESSAGE',
    desc: "After confirming, a green 'Password Changed Successfully' message appears. Use your new password for future log ins.",
    placeholder: 'Password Changed Successfully confirmation screen',
    caption: 'Your password has been updated — use it next time you log in',
    source: require('@assets/images/manual/change-password/cp-4.jpg'),
  },
];
