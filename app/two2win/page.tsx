"use client"
import Nav from '@/app/components/nav';
import Two2Win from '@/app/components/two2win';
import { Provider } from 'react-redux';
import store from '@/store/store';

export default function Home() {
  return (
    <div className="bg-cover bg-white text-sm text-gray-900 bg-center h-screen w-screen"
      >
      <Provider store={store}>
        <Nav/>
        <Two2Win/>
      </Provider>
      <div className="text-center text-gray-400 p-2">
        &copy; 2025 Chekwasy Businesses. All rights reserved.
      </div>
    </div>
  );
}
