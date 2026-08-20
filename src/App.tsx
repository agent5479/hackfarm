import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { routerBasename } from './lib/constants';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AccommodationPage from './pages/AccommodationPage';
import RidesPage from './pages/RidesPage';
import TrailsPage from './pages/TrailsPage';
import HorsesPage from './pages/HorsesPage';
import HorseDetailPage from './pages/HorseDetailPage';
import LearningPage from './pages/LearningPage';
import VaultingPage from './pages/VaultingPage';
import EventsPage from './pages/EventsPage';
import GiftsPage from './pages/GiftsPage';
import ContactPage from './pages/ContactPage';
import PartnersPage from './pages/PartnersPage';
import PrivacyPage from './pages/PrivacyPage';
import SitemapPage from './pages/SitemapPage';
import AboutPage from './pages/AboutPage';
import HorseSlashRedirect from './pages/HorseSlashRedirect';

export default function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about/" element={<AboutPage />} />
          <Route path="about" element={<Navigate to="/about/" replace />} />
          <Route path="accommodation/" element={<AccommodationPage />} />
          <Route path="accommodation" element={<Navigate to="/accommodation/" replace />} />
          <Route path="holistic-horse-rides/" element={<RidesPage />} />
          <Route path="holistic-horse-rides" element={<Navigate to="/holistic-horse-rides/" replace />} />
          <Route path="hack-farm-trails/" element={<TrailsPage />} />
          <Route path="hack-farm-trails" element={<Navigate to="/hack-farm-trails/" replace />} />
          <Route path="our-horses/" element={<HorsesPage />} />
          <Route path="our-horses" element={<Navigate to="/our-horses/" replace />} />
          <Route path="horse/:slug/" element={<HorseDetailPage />} />
          <Route path="horse/:slug" element={<HorseSlashRedirect />} />
          <Route path="learning-experiences/" element={<LearningPage />} />
          <Route path="learning-experiences" element={<Navigate to="/learning-experiences/" replace />} />
          <Route path="vaulting/" element={<VaultingPage />} />
          <Route path="vaulting" element={<Navigate to="/vaulting/" replace />} />
          <Route path="special-events/" element={<EventsPage />} />
          <Route path="special-events" element={<Navigate to="/special-events/" replace />} />
          <Route path="horse-riding-holiday-gift-vouchers/" element={<GiftsPage />} />
          <Route path="horse-riding-holiday-gift-vouchers" element={<Navigate to="/horse-riding-holiday-gift-vouchers/" replace />} />
          <Route path="contact/" element={<ContactPage />} />
          <Route path="contact" element={<Navigate to="/contact/" replace />} />
          <Route path="partners/" element={<PartnersPage />} />
          <Route path="partners" element={<Navigate to="/partners/" replace />} />
          <Route path="privacy-policy-2/" element={<PrivacyPage />} />
          <Route path="privacy-policy-2" element={<Navigate to="/privacy-policy-2/" replace />} />
          <Route path="sitemap/" element={<SitemapPage />} />
          <Route path="sitemap" element={<Navigate to="/sitemap/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
