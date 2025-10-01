'use client';

import { useState } from 'react';
import Link from 'next/link';
import { assessUser } from '@/app/actions/assessment';

type AssessmentState = 'idle' | 'loading' | 'success' | 'error';

type AssessmentResult = {
  name: string;
  email: string;
  forestlandAmount: number;
  forestlandUnit: string;
  treeSpecies: string[];
  completedAt: string;
  processingTime: number;
};

export default function AvailabilityPage() {
  const [state, setState] = useState<AssessmentState>('idle');
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    // Client-side validation for tree species
    const selectedSpecies = formData.getAll('treeSpecies');
    if (selectedSpecies.length === 0) {
      setError('Please select at least one tree species');
      setState('error');
      return;
    }

    setState('loading');
    setError(null);
    
    try {
      const response = await assessUser(formData);
      
      if (response.success && response.data) {
        setResult(response.data);
        setState('success');
      } else {
        setError(response.error || 'Assessment failed');
        setState('error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setState('error');
    }
  };

  const resetForm = () => {
    setState('idle');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center relative">
      <Link 
        href="/"
        className="absolute top-4 left-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
      >
        <svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>
      
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6">
        {state === 'idle' && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            handleSubmit(formData);
          }} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="forestlandAmount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount of Forestland
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  id="forestlandAmount"
                  name="forestlandAmount"
                  required
                  min="0"
                  step="0.01"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
                <select
                  name="forestlandUnit"
                  defaultValue="square-miles"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="acres">Acres</option>
                  <option value="square-miles">Square Miles</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tree Species (Select one or more)
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                {[
                  'Douglas Fir',
                  'Southern Yellow Pine',
                  'White Pine',
                  'Red Oak',
                  'White Oak',
                  'Maple',
                  'Poplar',
                  'Spruce',
                  'Hemlock',
                  'Cedar',
                  'Walnut',
                  'Cherry'
                ].map((species) => (
                  <label key={species} className="flex items-center">
                    <input
                      type="checkbox"
                      name="treeSpecies"
                      value={species}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{species}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Please select at least one species</p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-400 text-white py-2 px-4 rounded-md hover:bg-green-500 transition-colors duration-200"
            >
              Run Assessment
            </button>
          </form>
        )}

        {state === 'loading' && (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-lg font-medium text-gray-700">Processing your assessment...</p>
            <p className="text-sm text-gray-500">This may take a few seconds</p>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-100 border border-red-400 text-red-700 rounded-md p-4">
              <h3 className="font-semibold mb-2">Assessment Failed</h3>
              <p>{error}</p>
            </div>
            <button
              onClick={resetForm}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {state === 'success' && result && (
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 rounded-md p-4">
              <h3 className="font-semibold mb-3">Assessment Complete!</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {result.name}</p>
                <p><strong>Email:</strong> {result.email}</p>
                <p><strong>Forestland:</strong> {result.forestlandAmount} {result.forestlandUnit === 'square-miles' ? 'sq miles' : 'acres'}</p>
                <div>
                  <strong>Tree Species:</strong>
                  <ul className="mt-1 ml-4 list-disc text-sm">
                    {result.treeSpecies.map((species, index) => (
                      <li key={index}>{species}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Completed: {new Date(result.completedAt).toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  Processing time: {result.processingTime}
                </p>
              </div>
            </div>
            
            <button
              onClick={resetForm}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              New Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}