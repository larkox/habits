/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
    light: {
        // background: '#fff',
        // foreground: '#eee',
        // foregroundText: '#11181C',
        // foregroundOverdue: '#fdd',
        // foregroundOverdueText: '',
        // foregroundDone: '#dfd',
        // foregroundDoneText: '',
        // button: '#f3f3f3',
        // buttonText: '#123',
        // disabledButton: '#ccc',
        // disabledButtonText: '#123',
        // selectedTabTint: tintColorLight,
        // tabIconDefault: '#687076',
        // tabIconSelected: tintColorLight,

        /* Background */
        background: '#f7f8fa',  /* Light grayish background, easy on the eyes */

        /* Foreground */
        foreground: '#ffffff',  /* White background for cards or main sections */

        /* Foreground Text */
        foregroundText: '#333333',  /* Dark gray for text, easy to read */

        /* Foreground Overdue (when something is overdue) */
        foregroundOverdue: '#ffebeb',  /* Soft red background for overdue items */

        /* Foreground Overdue Text */
        foregroundOverdueText: '#d9534f',  /* Red text for overdue status */

        /* Foreground Done (completed habits) */
        foregroundDone: '#dff0d8',  /* Soft green background for completed habits */

        /* Foreground Done Text */
        foregroundDoneText: '#388e3c',  /* Light blue text for done tasks (lighter but still readable) */

        /* Button */
        button: '#4caf50',  /* Green for active buttons (positive action) */

        /* Button Text */
        buttonText: '#ffffff',  /* White text on buttons */

        /* Disabled Button */
        disabledButton: '#e0e0e0',  /* Light gray for disabled buttons */

        /* Disabled Button Text */
        disabledButtonText: '#9e9e9e',  /* Darker gray for disabled button text */

        /* Selected Tab Tint (for the active tab) */
        selectedTabTint: '#4caf50',  /* Green for selected tab (matching the button color) */

        /* Tab Icon Default (default state for tab icons) */
        tabIconDefault: '#9e9e9e',  /* Neutral gray for default tab icon */

        /* Tab Icon Selected */
        tabIconSelected: '#4caf50',  /* Green for selected tab icon (matches selected tab tint) */

        /* Border (for elements like cards, sections) */
        border: '#e0e0e0',  /* Light gray border to create subtle separation */

        /* Button Border */
        buttonBorder: '#388e3c',  /* Darker green for button borders, matching the button’s active shade */
    },
    dark: {
        // text: '#ECEDEE',
        // background: '#151718',
        // foreground: '#88f',
        // foregroundDone: '#dfd',
        // overdue: '#fdd',
        // button: '#ccc',
        // disabledButton: '#f3f3f3',
        // tint: tintColorDark,
        // icon: '#9BA1A6',
        // tabIconDefault: '#9BA1A6',
        // tabIconSelected: tintColorDark,

        /* Background */
        background: '#f7f8fa',  /* Light grayish background, easy on the eyes */

        /* Foreground */
        foreground: '#ffffff',  /* White background for cards or main sections */

        /* Foreground Text */
        foregroundText: '#333333',  /* Dark gray for text, easy to read */

        /* Foreground Overdue (when something is overdue) */
        foregroundOverdue: '#ffebeb',  /* Soft red background for overdue items */

        /* Foreground Overdue Text */
        foregroundOverdueText: '#d9534f',  /* Red text for overdue status */

        /* Foreground Done (completed habits) */
        foregroundDone: '#dff0d8',  /* Soft green background for completed habits */

        /* Foreground Done Text */
        foregroundDoneText: '#5bc0de',  /* Light blue text for done tasks (lighter but still readable) */

        /* Button */
        button: '#4caf50',  /* Green for active buttons (positive action) */

        /* Button Text */
        buttonText: '#ffffff',  /* White text on buttons */

        /* Disabled Button */
        disabledButton: '#cfcfcf',  /* Light gray for disabled buttons */

        /* Disabled Button Text */
        disabledButtonText: '#a1a1a1',  /* Darker gray for disabled button text */

        /* Selected Tab Tint (for the active tab) */
        selectedTabTint: '#4caf50',  /* Green for selected tab (matching the button color) */

        /* Tab Icon Default (default state for tab icons) */
        tabIconDefault: '#9e9e9e',  /* Neutral gray for default tab icon */

        /* Tab Icon Selected */
        tabIconSelected: '#4caf50',  /* Green for selected tab icon (matches selected tab tint) */

        /* Border (for elements like cards, sections) */
        border: '#e0e0e0',  /* Light gray border to create subtle separation */

        /* Button Border */
        buttonBorder: '#388e3c',  /* Darker green for button borders, matching the button’s active shade */
    },
};
