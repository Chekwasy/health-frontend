"use client"
import Nav from '@/app/components/nav';
import Sub from '@/app/components/sub';
import { Provider } from 'react-redux';
import store from '@/store/store';

export default function Home() {
  return (
    <div className="bg-cover bg-gray-200 text-sm text-gray-900 bg-center h-screen w-screen"
      >
      <Provider store={store}>
        <Nav/>
        <Sub/>
      </Provider>
      <div className="text-center text-gray-400 p-2">
        &copy; 2025 Chekwasy Businesses. All rights reserved.
      </div>
    </div>
  );
}
