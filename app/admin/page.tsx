import Link from 'next/link';
import { database } from '@/db/database';

export default async function AdminPage() {
  const assessments = await database.getAllAssessments();

  // Helper function to format processing time from milliseconds
  const formatProcessingTime = (ms: number): string => {
    if (ms < 1000) {
      return `${ms}ms`;
    } else {
      const seconds = (ms / 1000).toFixed(1);
      return `${seconds}s`;
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment Submissions</h1>
            <p className="text-gray-600 mt-2">
              Total submissions: {assessments.length}
            </p>
          </div>
          <Link 
            href="/"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        {assessments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No submissions yet</h2>
            <p className="text-gray-500 mb-4">Assessment submissions will appear here once users complete assessments.</p>
            <Link 
              href="/assessment"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Take Assessment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{assessment.name}</h3>
                    <p className="text-gray-600">{assessment.email}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Submitted: {new Date(assessment.completedAt).toLocaleDateString()}</p>
                    <p>Time: {new Date(assessment.completedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Forestland Information</h4>
                    <p className="text-gray-900">
                      {assessment.forestlandAmount} {assessment.forestlandUnit === 'square-miles' ? 'square miles' : 'acres'}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tree Species</h4>
                    <div className="flex flex-wrap gap-1">
                      {assessment.treeSpecies.map((species, index) => (
                        <span 
                          key={index}
                          className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                        >
                          {species}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Processing Time: {formatProcessingTime(assessment.processingTime)}</span>
                    <span className="font-mono text-xs">ID: {assessment.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
