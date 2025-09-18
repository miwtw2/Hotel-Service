import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

interface CustomerRequest {
  customer_name: string;
  room_number: string;
  checkout_time: string | null;
  request_date: string;
  request_type: string;
  description: string;
  status: string;
  priority: string;
  request_id: string;
  deleted_at?: string | null;
  notes?: string;
}

interface CustomerRequestHistoryProps {
  sessionToken: string;
}

export const CustomerRequestHistory: React.FC<CustomerRequestHistoryProps> = ({
  sessionToken,
}) => {
  const [customerHistory, setCustomerHistory] = useState<CustomerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [checkoutFilter, setCheckoutFilter] = useState('all'); // all, checked_out, current_guests
  const [deletedFilter, setDeletedFilter] = useState('all'); // all, active, deleted

  useEffect(() => {
    fetchCustomerHistory();
  }, []);

  const fetchCustomerHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/admin/customer-history`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch customer history');
      
      const data = await response.json();
      setCustomerHistory(data.customer_history || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter customer history based on search and filters
  const filteredHistory = customerHistory.filter((request) => {
    const matchesSearch = 
      request.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    const matchesCheckout = checkoutFilter === 'all' || 
      (checkoutFilter === 'checked_out' && request.checkout_time !== null) ||
      (checkoutFilter === 'current_guests' && request.checkout_time === null);

    const matchesDeleted = deletedFilter === 'all' ||
      (deletedFilter === 'active' && !request.deleted_at) ||
      (deletedFilter === 'deleted' && request.deleted_at);

    return matchesSearch && matchesStatus && matchesCheckout && matchesDeleted;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Current Guest';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string, deleted_at?: string | null) => {
    if (deleted_at) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string, deleted_at?: string | null) => {
    if (deleted_at) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'assigned':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Request History</h2>
          <p className="text-gray-600">Complete history of all customer requests by room</p>
        </div>
        <button
          onClick={fetchCustomerHistory}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by customer name, room, or request..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Checkout Filter */}
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <select
              value={checkoutFilter}
              onChange={(e) => setCheckoutFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Guests</option>
              <option value="current_guests">Current Guests</option>
              <option value="checked_out">Checked Out</option>
            </select>
          </div>

          {/* Deleted Filter */}
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-gray-500" />
            <select
              value={deletedFilter}
              onChange={(e) => setDeletedFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Requests</option>
              <option value="active">Active</option>
              <option value="deleted">Deleted by Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Showing {filteredHistory.length} of {customerHistory.length} requests
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading customer history...</span>
        </div>
      )}

      {/* Customer History Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Checkout Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((request) => (
                  <tr key={request.request_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-yellow-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Room {request.room_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.request_type}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {request.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(request.status, request.deleted_at)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status, request.deleted_at)}`}>
                          {request.deleted_at ? 'Deleted by Admin' : request.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(request.request_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {request.checkout_time ? (
                          <span>{formatDate(request.checkout_time)}</span>
                        ) : (
                          <span className="text-green-600 font-medium">Current Guest</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customer requests found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || checkoutFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No customer request history available'
            }
          </p>
        </div>
      )}
    </div>
  );
};