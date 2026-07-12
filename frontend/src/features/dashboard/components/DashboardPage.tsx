import React, { useState } from 'react';
import { useI18n } from '../../../context/I18nContext';

interface UserData {
  id: string;
  title: string;
  description: string;
}

export const DashboardPage: React.FC = () => {
  const { t } = useI18n();
  const [data, setData] = useState<UserData[]>([
    { id: '1', title: 'OCR Project Proposal', description: 'Analyze engine efficiency for document parsing.' },
    { id: '2', title: 'System Architecture Diagram', description: 'React architecture layout map and models.' },
  ]);

  const [newItem, setNewItem] = useState({ title: '', description: '' });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title || !newItem.description) return;
    setData([...data, { id: Date.now().toString(), ...newItem }]);
    setNewItem({ title: '', description: '' });
  };

  const handleDeleteItem = (id: string) => {
    setData(data.filter((item) => item.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('common.dashboard')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your data securely</p>
      </div>

      {/* Add New Data Form */}
      <form onSubmit={handleAddItem} className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add Secure Entry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition-all duration-200"
        >
          Add Item
        </button>
      </form>

      {/* Grid of data cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{item.description}</p>
            </div>
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline text-left mt-auto self-start"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
