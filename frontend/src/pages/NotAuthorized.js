import React from 'react';

function NotAuthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Not Authorized</h2>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </div>
    </div>
  );
}

export default NotAuthorized;
