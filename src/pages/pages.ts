import { ItemDetailPage } from './item-detail/item-detail';
import { PhotoPage } from './photo/photo';
import { SettingsPage } from './settings/settings';
import { TabsPage } from './tabs/tabs';
import { LoginPage } from './login/login';
import { DocumentPage } from './document/document';

// The page the user lands on after opening the app and without a session
export const FirstRunPage = LoginPage;

// The main page the user will see as they use the app over a long period of time.
// Change this if not using tabs
export const MainPage = TabsPage;

// The initial root pages for our tabs (remove if not using tabs)
export const Tab1Root = ItemDetailPage;
export const Tab2Root = PhotoPage;
export const Tab3Root = DocumentPage;
