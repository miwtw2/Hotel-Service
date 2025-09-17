import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Trash2,
  AlertTriangle
} from 'lucide-react';
import type { ServiceRequest } from '../App';

interface RequestHistoryProps {
  requests: ServiceRequest[];
  setRequests: React.Dispatch<React.SetStateAction<ServiceRequest[]>>;
}

export const RequestHistory: React.FC<RequestHistoryProps> = ({ requests, setRequests }) => {
  const updateRequestStatus = (id: string, status: 'pending' | 'in-progress' | 'completed') => {
    setRequests(prev => prev.map(request => 
      request.id === id ? { ...request, status } : request
    ));
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(request => request.id !== id));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-orange-50 border-orange-200 text-orange-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    // Sort by priority first (emergency > urgent > normal)
    const priorityOrder = { emergency: 3, urgent: 2, normal: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    // Then by timestamp (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No requests yet</h3>
        <p className="text-gray-500">Your service requests will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Request History</h2>
        <span className="text-sm text-gray-600">{requests.length} total requests</span>
      </div>

      <div className="space-y-3">
        {sortedRequests.map((request) => (
          <div
            key={request.id}
            className={`border rounded-xl p-4 transition-all duration-200 ${getStatusColor(request.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{request.type}</h3>
                  {getPriorityIcon(request.priority)}
                  {request.priority !== 'normal' && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      request.priority === 'emergency' 
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {request.priority}
                    </span>
                  )}
                </div>
                <p className="text-sm mb-2">{request.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span>
                    {request.timestamp.toLocaleDateString()} at{' '}
                    {request.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(request.status)}
                    <span className="capitalize">{request.status.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {request.status !== 'completed' && (
                  <div className="flex gap-1">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => updateRequestStatus(request.id, 'in-progress')}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Start
                      </button>
                    )}
                    <button
                      onClick={() => updateRequestStatus(request.id, 'completed')}
                      className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Complete
                    </button>
                  </div>
                )}
                <button
                  onClick={() => deleteRequest(request.id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Delete request"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="font-medium text-gray-800 mb-2">Status Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <span><strong>Pending:</strong> Request received, awaiting assignment</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader className="w-4 h-4 text-blue-600" />
            <span><strong>In Progress:</strong> Staff is working on your request</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span><strong>Completed:</strong> Request has been fulfilled</span>
          </div>
        </div>
      </div>
    </div>
  );
};