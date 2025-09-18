import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Calendar,
  User,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

interface ServiceRequest {
  id: string;
  request_type: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  assigned_staff_id?: string;
  staff_members?: {
    full_name: string;
    department: string;
  };
  admin_notes?: string;
}

interface GuestStatusProps {
  sessionToken: string;
  guestInfo: {
    name: string;
    roomNumber: string;
  };
}

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

export const GuestStatus: React.FC<GuestStatusProps> = ({
  sessionToken,
  guestInfo,
}) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMyRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/guest/my-requests`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setRequests(data.requests);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [sessionToken]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: <Clock className="w-4 h-4" />,
          text: 'Pending Review',
          description: 'Your request has been received and is awaiting review.'
        };
      case 'acknowledged':
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: <Eye className="w-4 h-4" />,
          text: 'Acknowledged',
          description: 'Your request has been reviewed and acknowledged by our team.'
        };
      case 'assigned':
        return {
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          icon: <User className="w-4 h-4" />,
          text: 'Staff Assigned',
          description: 'A staff member has been assigned to handle your request.'
        };
      case 'in_progress':
        return {
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          icon: <RefreshCw className="w-4 h-4" />,
          text: 'In Progress',
          description: 'Our team is currently working on your request.'
        };
      case 'completed':
        return {
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Completed',
          description: 'Your request has been completed successfully.'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Clock className="w-4 h-4" />,
          text: status,
          description: 'Status information is being updated.'
        };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return {
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Emergency'
        };
      case 'urgent':
        return {
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          icon: <AlertTriangle className="w-4 h-4" />,
          text: 'Urgent'
        };
      default:
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: <Clock className="w-4 h-4" />,
          text: 'Normal'
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRequestSummary = () => {
    const total = requests.length;
    const pending = requests.filter(r => ['pending', 'acknowledged'].includes(r.status)).length;
    const inProgress = requests.filter(r => ['assigned', 'in_progress'].includes(r.status)).length;
    const completed = requests.filter(r => r.status === 'completed').length;

    return { total, pending, inProgress, completed };
  };

  const summary = getRequestSummary();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Unable to Load Requests</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchMyRequests}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Request Status</h2>
          <p className="text-gray-600">Track the status of your service requests</p>
        </div>
        <button
          onClick={fetchMyRequests}
          disabled={isLoading}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
            </div>
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">{summary.inProgress}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{summary.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Service Requests</h3>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600">
              You haven't made any service requests yet. Use the chat or quick services to get started!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests.map((request) => {
              const statusInfo = getStatusInfo(request.status);
              const priorityInfo = getPriorityInfo(request.priority);

              return (
                <div key={request.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {request.request_type}
                      </h4>
                      <p className="text-gray-600 mb-3">{request.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(request.created_at)}</span>
                        </div>
                        {request.staff_members && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>
                              Assigned to {request.staff_members.full_name} 
                              ({request.staff_members.department})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${priorityInfo.color}`}>
                        {priorityInfo.icon}
                        <span className="ml-1">{priorityInfo.text}</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span className="ml-2">{statusInfo.text}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{statusInfo.description}</p>
                    
                    {request.admin_notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Staff Notes</span>
                        </div>
                        <p className="text-sm text-blue-800">{request.admin_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};