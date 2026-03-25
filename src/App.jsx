import { Home, PlusCircle, List } from './components/icons';
import HomeScreen from './screens/HomeScreen';
import AddScreen from './screens/AddScreen';
import HistoryScreen from './screens/HistoryScreen';
import BottomNav from './components/BottomNav';
import { useState } from 'react';
import './index.css';

const TABS = [
  { id: 'home',    labelAr: 'الرئيسية', Icon: Home },
  { id: 'add',     labelAr: 'إضافة',    Icon: PlusCircle },
  { id: 'history', labelAr: 'السجل',    Icon: List },
];

function AppShell() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':    return <HomeScreen />;
      case 'add':     return <AddScreen onSuccess={() => setActiveTab('home')} />;
      case 'history': return <HistoryScreen />;
      default:        return <HomeScreen />;
    }
  };

  return (
    <>
      {renderScreen()}
      <BottomNav tabs={TABS} active={activeTab} onChange={setActiveTab} />
    </>
  );
}

export default function App() {
  return <AppShell />;
}
