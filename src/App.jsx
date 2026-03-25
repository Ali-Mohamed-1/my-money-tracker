import { Home, PlusCircle, List } from './components/icons';
import HomeScreen from './screens/HomeScreen';
import AddScreen from './screens/AddScreen';
import HistoryScreen from './screens/HistoryScreen';
import SourceDetailsScreen from './screens/SourceDetailsScreen';
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
  const [selectedSourceId, setSelectedSourceId] = useState(null);

  // If a source is selected, show its detail screen (overlay over home)
  if (selectedSourceId) {
    return (
      <>
        <SourceDetailsScreen
          sourceId={selectedSourceId}
          onBack={() => setSelectedSourceId(null)}
        />
      </>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':    return <HomeScreen onSourceClick={setSelectedSourceId} />;
      case 'add':     return <AddScreen onSuccess={() => setActiveTab('home')} />;
      case 'history': return <HistoryScreen />;
      default:        return <HomeScreen onSourceClick={setSelectedSourceId} />;
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
