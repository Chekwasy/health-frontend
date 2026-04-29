// components/PostXForm.tsx
"use client";

import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';


// Define the structure of the data to be sent
interface PostXData {
    db: string[]; // Array of selected checkbox values
    totalOdd: number;
    code: string;
}

export default function PostXForm() {

    const [selectedDbs, setSelectedDbs] = useState<string[]>([]);
    const [totalOdd, setTotalOdd] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    const dbOptions = ['two2win', 'point5', 'point5pro'];

    // Handle checkbox change
    const handleDbChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = event.target;
        setSelectedDbs(prev =>
            checked ? [...prev, value] : prev.filter(db => db !== value)
        );
    };

    // Handle form submission
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setMessage(null);
        setIsError(false);

        // Basic validation
        if (selectedDbs.length === 0) {
            setMessage('Please select at least one database option.');
            setIsError(true);
            return;
        }

        const dataToSend: PostXData = {
            db: selectedDbs,
            totalOdd: parseFloat(totalOdd || '0'),
            code: code,
        };

        try {
            const response = await axios.post('/api/postx', {}, {
                headers: {
                'tok': Cookies.get('trybet_tok') || '',
                'Content-Type': 'application/json',
                saved: JSON.stringify(dataToSend),
                },
            });
            setMessage('Data successfully sent!');
            setIsError(false);
            console.log('Success:', response.data);
            // Optionally clear form fields after successful submission
            setSelectedDbs([]);
            setTotalOdd('');
            setCode('');
        } catch (error) {
            console.error('Error sending data:', error);
            setMessage('Failed to send data. Please try again.');
            setIsError(true);
        }
    };

    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-xl border border-gray-200">
            <h2 className="text-2xl font-extrabold text-red-500 mb-8 text-center">
                Enter Bet Data (MAKE UPDATE OF LAST GAME!!!!!!!!!!)
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* DB Checkboxes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Database(s):</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {dbOptions.map(option => (
                            <div key={option} className="flex items-center">
                                <input
                                    id={option}
                                    name="db"
                                    type="checkbox"
                                    value={option}
                                    checked={selectedDbs.includes(option)}
                                    onChange={handleDbChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor={option} className="ml-2 block text-sm font-medium text-gray-900 capitalize">
                                    {option.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* General Bet Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="totalOdd" className="form-label mr-3">Total Odd</label>
                        <input
                            type="number"
                            id="totalOdd"
                            className="form-input"
                            step="0.01"
                            value={totalOdd}
                            onChange={(e) => setTotalOdd(e.target.value)}
                            placeholder="e.g., 2.50"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="code" className="form-label mr-3">Bet Code</label>
                        <input
                            type="text"
                            id="code"
                            className="form-input"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="e.g., AZX12345"
                            required
                        />
                    </div>
                </div>

                {/* Submission Message */}
                {message && (
                    <div className={`p-3 rounded-md text-center text-sm font-medium ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-105"
                >
                    Submit Bet Data
                </button>
            </form>
        </div>
    </div>
    );
}