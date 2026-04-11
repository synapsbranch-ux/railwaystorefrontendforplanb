import { 
    GridLayout, 
    ButtonsConfig,
    ButtonsStrategy, 
    KS_DEFAULT_BTN_CLOSE, 
    KS_DEFAULT_BTN_DELETE, 
    KS_DEFAULT_BTN_DOWNLOAD, 
    KS_DEFAULT_BTN_EXTURL, 
    KS_DEFAULT_BTN_FULL_SCREEN, 
    PlainGalleryConfig, 
    PlainGalleryStrategy, 
    Size,
    BreakConfig
} from '@ks89/angular-modal-gallery';

// Button Configuration
export let ButtonsConfiguration: ButtonsConfig = {
    visible: true,
    strategy: ButtonsStrategy.CUSTOM,
    buttons: [
      KS_DEFAULT_BTN_FULL_SCREEN,
      KS_DEFAULT_BTN_DELETE,
      KS_DEFAULT_BTN_EXTURL,
      KS_DEFAULT_BTN_DOWNLOAD,
      KS_DEFAULT_BTN_CLOSE
    ]
};

// Gallery Configuration
// Define the Size and BreakConfig objects
const size: Size = { width: '100%', height: 'auto' }; // Replace with actual values if needed

const breakConfig: BreakConfig = {
    length: 10, // Example value; adjust based on layout requirements
    wrap: true  // Example value; adjust based on your needs
};

// Create the configuration
export let PlainGalleryConfiguration: PlainGalleryConfig = {
    strategy: PlainGalleryStrategy.CUSTOM,
    layout: new GridLayout(size, breakConfig)
};
