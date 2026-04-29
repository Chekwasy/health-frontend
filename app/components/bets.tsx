"use client";

import { useState, useEffect, useCallback, } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Bet, StoreState2, PlayeD } from '../tools/s_interface'; // Ensure SingleGameBet is imported
import { useDispatch, useSelector } from 'react-redux';
import { mainStateReducer } from '@/store/slices/mainslice';
import type { RootState, AppDispatch } from './../../store/store';

// Define initial empty state for a single bet within the Bet array
const initialSingleGameBet: PlayeD = {
  id: '',
  gId: '',
  gTCountry: '',
  gSubtitle: '',
  mktT: '',
  mTime: '',
  hometeam: '',
  awayteam: '',
  odd: '',
  selection: '',
  mStatus: '',
  mResult: '',
  mOutcome: '',
  mScore: '',
};

// Define initial empty state for a full Bet object
const initialBetState: Bet = {
  userID: '',
  gameID: '',
  returns: '',
  result: '',
  date: '',
  time: '',
  betamt: '',
  status: '',
  potwin: '',
  odds: '',
  bet: [initialSingleGameBet],
};

// Helper component for displaying individual game details within a bet slip
interface BetGameDetailProps {
  game: PlayeD;
}

const BetGameDetail = ({ game }: BetGameDetailProps) => {
  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Won':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Lost':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Pending':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formattedMatchTime = game.mTime
    ? `${game.mTime.substring(6, 8)}-${game.mTime.substring(4, 6)}-${game.mTime.substring(0, 4)} | ${game.mTime.substring(8, 10)}:${game.mTime.substring(10, 12)}`
    : 'N/A';

  return (
    <div className={`p-4 rounded-lg shadow-sm mb-4 transition-all duration-300 border-l-4 ${getOutcomeColor(game.mOutcome)}`}>
      <h3 className="text-lg font-bold mb-3 flex justify-between items-center text-gray-800">
        <span>{game.gTCountry} - {game.gSubtitle}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${game.mOutcome === 'Won' ? 'bg-green-500 text-white' : game.mOutcome === 'Lost' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-gray-800'}`}>
          {game.mOutcome || 'N/A'}
        </span>
      </h3>
      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
        <div className="font-medium">Teams:</div>
        <div className="text-right">{game.hometeam} vs {game.awayteam}</div>

        <div className="font-medium">Match Time:</div>
        <div className="text-right">{formattedMatchTime}</div>

        <div className="font-medium">Market Type:</div>
        <div className="text-right">{game.mktT}</div>

        <div className="font-medium">Your Selection:</div>
        <div className="text-right font-semibold">{game.selection} ({game.odd})</div>

        <div className="font-medium">Match Status:</div>
        <div className="text-right">{game.mStatus}</div>

        <div className="font-medium">Final Result:</div>
        <div className="text-right">{game.mResult || 'N/A'}</div>

        <div className="font-medium">Score:</div>
        <div className="text-right">{game.mScore || 'N/A'}</div>
      </div>
    </div>
  );
};

// Main Bets component
export default function Bets() {
  const dispatch: AppDispatch = useDispatch();
  const storeItems: StoreState2 = useSelector((state: RootState) => state.mainSlice);

  const [bets, setBets] = useState<Bet[]>([initialBetState]); // Renamed 'bet' to 'bets' for clarity
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null); // Renamed 'clickBet' to 'selectedBet', initialized to null
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // Renamed 'isOpen' to 'isDetailModalOpen'
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open'); // Renamed 'betTab' to 'activeTab'

  // Fetch open bets
  const fetchOpenBets = useCallback(async () => {
    try {
      const response = await axios.get('/api/getopenbet', {
        headers: {
          tok: Cookies.get('trybet_tok') || '',
        }
      });
      setBets(response.data.openbet.length > 0 ? response.data.openbet.reverse() : [initialBetState]);
      if (response.data.me) {
        dispatch(mainStateReducer({
          logged: storeItems.logged,
          played: storeItems.played,
          me: response.data.me,
          buttonState: storeItems.buttonState
        }));
      }
      setActiveTab('open');
    } catch (error) {
      console.error("Error fetching open bets:", error);
      setBets([initialBetState]); // Reset to initial state on error or no bets
    }
  }, [dispatch, storeItems]);

  // Fetch closed bets
  const fetchClosedBets = useCallback(async () => {
    try {
      const response = await axios.get('/api/getclosebet', {
        headers: {
          tok: Cookies.get('trybet_tok') || '',
        }
      });
      setBets(response.data.closebet.length > 0 ? response.data.closebet.reverse() : [initialBetState]);
      setActiveTab('closed');
    } catch (error) {
      console.error("Error fetching closed bets:", error);
      setBets([initialBetState]); // Reset to initial state on error or no bets
    }
  }, []);

  // Open bet detail modal
  const openBetDetails = useCallback((betItem: Bet) => {
    setSelectedBet(betItem);
    setIsDetailModalOpen(true);
  }, []);

  // Close bet detail modal
  const closeBetDetails = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedBet(null); // Clear selected bet
  }, []);

  // Initial data fetch on component mount
  useEffect(() => {
    fetchOpenBets();
  }, []);

  // Determine header background color based on bet result
  const getResultHeaderColor = useCallback((status: string, result: string) => {
    if (status === 'close') {
      return result === 'Won' ? 'bg-green-600 text-white' : 'bg-red-600 text-white';
    }
    return 'bg-yellow-400 text-gray-800';
  }, []);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString || dateString.length < 8) return 'N/A';
    return `${dateString.substring(6, 8)}-${dateString.substring(4, 6)}-${dateString.substring(0, 4)}`;
  };

  // Helper function to format time
  const formatTime = (timeString: string) => {
    if (!timeString || timeString.length < 4) return 'N/A';
    return `${timeString.substring(0, 2)}:${timeString.substring(2, 4)}`;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8 mt-16">
      {!isDetailModalOpen && (
        <div className="w-full max-w-4xl mb-8">
          <div className="bg-white rounded-xl shadow-lg p-3 flex gap-4 border-b-4 border-green-600">
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-lg font-semibold transition-all duration-300
                ${activeTab === 'open' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={fetchOpenBets}
            >
              Open Bets
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-lg font-semibold transition-all duration-300
                ${activeTab === 'closed' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={fetchClosedBets}
            >
              Closed Bets
            </button>
          </div>
        </div>
      )}

      {!isDetailModalOpen ? (
        <div className="w-full max-w-4xl space-y-6">
          {bets[0].status !== '' ? (
            bets.map((betItem: Bet) => (
              <div
                key={betItem.gameID}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
                onClick={() => openBetDetails(betItem)}
                aria-label={`View details for bet ${betItem.gameID}`}
              >
                <div className={`p-4 ${getResultHeaderColor(betItem.status, betItem.result)} flex justify-between items-center`}>
                  <h3 className="text-xl font-bold">{betItem.result === 'Won' ? 'Won' : betItem.result === 'Lost' ? 'Lost' : 'Pending'}</h3>
                  <span className="text-sm">
                    {formatDate(betItem.date)} | {formatTime(betItem.time)}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Amount Booked:</span>
                    <span className="text-lg font-bold">₦{new Intl.NumberFormat().format(parseFloat(betItem.betamt || '0'))}</span>
                  </div>
                  <div className="flex flex-col md:text-right">
                    <span className="text-sm font-medium text-gray-500">Total Odds:</span>
                    <span className="text-lg font-bold">{betItem.odds || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Potential Winnings:</span>
                    <span className="text-lg font-bold text-green-700">₦{new Intl.NumberFormat().format(parseFloat(betItem.potwin || '0'))}</span>
                  </div>
                  <div className="flex flex-col md:text-right">
                    <span className="text-sm font-medium text-gray-500">Actual Returns:</span>
                    <span className={`text-lg font-bold ${betItem.returns === '0.00' ? 'text-gray-700' : 'text-blue-700'}`}>
                      ₦{new Intl.NumberFormat().format(parseFloat(betItem.returns || '0'))}
                    </span>
                  </div>
                </div>
                {betItem.bet && betItem.bet.length > 0 && (
                  <div className="px-4 pb-4 text-sm text-gray-600">
                    <p className="font-medium text-gray-700">Games Included:</p>
                    <ul className="list-disc list-inside text-xs">
                      {betItem.bet.slice(0, 3).map((game, idx) => ( // Show first 3 games for summary
                        <li key={idx}>
                          {game.hometeam} vs {game.awayteam} ({game.mktT} - {game.selection})
                        </li>
                      ))}
                      {betItem.bet.length > 3 && (
                        <li className="font-semibold">...and {betItem.bet.length - 3} more games.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-lg">
              <p className="text-xl text-gray-600 font-semibold">No {activeTab} bets found.</p>
              <p className="text-gray-500 mt-2">Time to place some wagers!</p>
              <Link href="/" className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Go to Games
              </Link>
            </div>
          )}
        </div>
      ) : (
        // Bet Details Modal
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl transform scale-95 animate-pop-in overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-green-700">Bet Details</h2>
              <button
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={closeBetDetails}
                aria-label="Close bet details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedBet && (
              <>
                <div className={`p-4 rounded-lg mb-6 ${getResultHeaderColor(selectedBet.status, selectedBet.result)}`}>
                  <div className="flex justify-between items-center text-white">
                    <h3 className="text-xl font-bold">{selectedBet.result === 'Won' ? 'Won' : selectedBet.result === 'Lost' ? 'Lost' : 'Pending'}</h3>
                    <span className="text-sm">
                      {formatDate(selectedBet.date)} | {formatTime(selectedBet.time)}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm text-white">
                    <div className="font-medium">Amount Booked:</div>
                    <div className="text-right font-bold">₦{new Intl.NumberFormat().format(parseFloat(selectedBet.betamt || '0'))}</div>

                    <div className="font-medium">Total Odds:</div>
                    <div className="text-right font-bold">{selectedBet.odds || 'N/A'}</div>

                    <div className="font-medium">Potential Winnings:</div>
                    <div className="text-right font-bold">₦{new Intl.NumberFormat().format(parseFloat(selectedBet.potwin || '0'))}</div>

                    <div className="font-medium">Actual Returns:</div>
                    <div className="text-right font-bold">₦{new Intl.NumberFormat().format(parseFloat(selectedBet.returns || '0'))}</div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-4">Individual Games:</h3>
                <div className="space-y-4">
                  {selectedBet.bet.map((game, index) => (
                    <BetGameDetail key={index} game={game} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}