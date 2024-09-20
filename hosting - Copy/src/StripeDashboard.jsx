// import React, { useState } from 'react';
// import { useConnectJSContext } from './hooks/EmbeddedComponentProvider';
// import { EmbeddedComponentWrapper } from './EmbeddedComponentWrapper';
// import FinancialDashboard from './components/FinancialDashboard';
// import DashboardList from './components/DashboardList';
// import { Menu, ChevronLeft, ChevronRight, Settings, Moon, Sun, DollarSign, CreditCard, Activity } from 'lucide-react';

// const StripeDashboard = () => {
//   const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
//   const [darkMode, setDarkMode] = useState(false);
//   const [activeView, setActiveView] = useState('overview');
//   const { connectInstance } = useConnectJSContext();

//   const toggleDarkMode = () => setDarkMode(!darkMode);
//   const toggleLeftPanel = () => setIsLeftPanelOpen(!isLeftPanelOpen);

//   const menuItems = [
//     { id: 'overview', label: 'Overview', icon: <Activity /> },
//     { id: 'financials', label: 'Financials', icon: <DollarSign /> },
//     { id: 'payouts', label: 'Payouts', icon: <CreditCard /> },
//   ];

//   return (
//     <EmbeddedComponentWrapper demoOnboarding={false}>
//       <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
//         {/* Header */}
//         <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold">Stripe Connect Dashboard</h1>
//           <div className="flex items-center space-x-4">
//             <button onClick={toggleDarkMode}>
//               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//             </button>
//             <Settings size={20} />
//           </div>
//         </header>

//         {/* Main Content */}
//         <div className="flex-1 flex overflow-hidden">
//           {/* Left Panel */}
//           <div className={`bg-white dark:bg-gray-800 transition-all duration-300 ${isLeftPanelOpen ? 'w-64' : 'w-0'}`}>
//             {isLeftPanelOpen && (
//               <nav className="p-4">
//                 <ul>
//                   {menuItems.map((item) => (
//                     <li key={item.id}>
//                       <button
//                         onClick={() => setActiveView(item.id)}
//                         className={`flex items-center w-full p-2 rounded ${
//                           activeView === item.id ? 'bg-blue-100 dark:bg-blue-900' : ''
//                         }`}
//                       >
//                         {item.icon}
//                         <span className="ml-2">{item.label}</span>
//                       </button>
//                     </li>
//                   ))}
//                 </ul>
//               </nav>
//             )}
//           </div>

//           {/* Main Dashboard */}
//           <div className="flex-1 p-6 bg-gray-100 dark:bg-gray-900 overflow-auto">
//             {activeView === 'overview' && (
//               <div>
//                 <h2 className="text-2xl font-bold mb-4">Account Overview</h2>
//                 <DashboardList
//                   title="Quick Actions"
//                   items={[
//                     'Update account information',
//                     'View latest transactions',
//                     'Manage payout schedule',
//                   ]}
//                 />
//               </div>
//             )}
//             {activeView === 'financials' && <FinancialDashboard />}
//             {activeView === 'payouts' && (
//               <div>
//                 <h2 className="text-2xl font-bold mb-4">Payout Management</h2>
//                 {/* Add payout management UI here */}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Left Panel Toggle Button */}
//         <button
//           onClick={toggleLeftPanel}
//           className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-r-full p-2 shadow-md"
//         >
//           {isLeftPanelOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
//         </button>
//       </div>
//     </EmbeddedComponentWrapper>
//   );
// };

// export default StripeDashboard;

// StripeDashboard.jsx

import React from 'react';
import { useStripeConnectAndBalance } from '@hooks/auth/useStripeConnectAndBalance';
import FinancialDashboard from '@components/FinancialDashboard';
import { useAuth } from '@context/AuthContext'; // Adjust import path

const StripeDashboard = () => {
  const { user } = useAuth(); // Get the authenticated user
  const connectedAccountId = user?.stripeConnectedAccountId;

  const { stripeConnectInstance, loading, error } = useStripeConnectAndBalance(connectedAccountId);

  if (loading) {
    return <div>Loading Stripe Dashboard...</div>;
  }

  if (error) {
    return <div>Error loading Stripe Dashboard: {error}</div>;
  }

  return (
    <div>
      <h1>Stripe Financial Dashboard</h1>
      <FinancialDashboard stripeConnectInstance={stripeConnectInstance} />
    </div>
  );
};

export default StripeDashboard;
