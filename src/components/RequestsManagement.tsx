import { useState } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Edit,
  Eye,
  UserPlus,
  History,
  Trash2
} from 'lucide-react';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

interface ServiceRequest {
  id: string;
  room_number: string;
  request_type: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  assigned_staff_id?: string;
  staff_members?: {
    staff_id: string;
    full_name: string;
    department: string;
  };
}

interface StaffMember {
  id: string;
  staff_id: string;
  full_name: string;
  department: string;
  role: string;
  is_available: boolean;
}

interface RequestsManagementProps {
  requests: ServiceRequest[];
  staff: StaffMember[];
  onAssign: (requestId: string, staffId: string, notes?: string) => void;
  onUpdateStatus: (requestId: string, status: string, notes?: string) => void;
  onUpdatePriority: (requestId: string, priority: string, notes?: string) => void;
  onRefresh: () => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  sessionToken: string;
}

interface AssignmentModalData {
  requestId: string;
  currentStaffId?: string;
}

export const RequestsManagement: React.FC<RequestsManagementProps> = ({
  requests,
  staff,
  onAssign,
  onUpdateStatus,
  onUpdatePriority,
  onRefresh,
  getPriorityColor,
  getStatusColor,
  sessionToken,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState<AssignmentModalData | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<{ requestId: string; currentStatus: string } | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [priorityUpdateData, setPriorityUpdateData] = useState<{ requestId: string; currentPriority: string } | null>(null);
  const [newPriority, setNewPriority] = useState('');
  const [priorityNotes, setPriorityNotes] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyRequestId, setHistoryRequestId] = useState<string | null>(null);
  const [requestHistory, setRequestHistory] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null);

  // Filter requests based on search and filters
  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAssignClick = (requestId: string, currentStaffId?: string) => {
    setAssignmentData({ requestId, currentStaffId });
    setSelectedStaffId(currentStaffId || '');
    setAssignmentNotes('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!assignmentData || !selectedStaffId) return;

    await onAssign(assignmentData.requestId, selectedStaffId, assignmentNotes);
    setShowAssignModal(false);
    setAssignmentData(null);
  };

  const handleStatusClick = (requestId: string, currentStatus: string) => {
    setStatusUpdateData({ requestId, currentStatus });
    setNewStatus(currentStatus);
    setStatusNotes('');
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async () => {
    if (!statusUpdateData) return;

    await onUpdateStatus(statusUpdateData.requestId, newStatus, statusNotes);
    setShowStatusModal(false);
    setStatusUpdateData(null);
  };

  const handlePriorityClick = (requestId: string, currentPriority: string) => {
    setPriorityUpdateData({ requestId, currentPriority });
    setNewPriority(currentPriority);
    setPriorityNotes('');
    setShowPriorityModal(true);
  };

  const handlePrioritySubmit = async () => {
    if (!priorityUpdateData) return;

    await onUpdatePriority(priorityUpdateData.requestId, newPriority, priorityNotes);
    setShowPriorityModal(false);
    setPriorityUpdateData(null);
  };

  const handleHistoryClick = async (requestId: string) => {
    setHistoryRequestId(requestId);
    setShowHistoryModal(true);
    
    try {
      const response = await fetch(`${API_BASE}/admin/requests/${requestId}/history`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data = await response.json();
      setRequestHistory(data.history || []);
    } catch (err: any) {
      console.error('Error fetching history:', err.message);
      setRequestHistory([]);
    }
  };

  const handleDeleteClick = (requestId: string, status: string) => {
    if (status !== 'cancelled') {
      alert('Only cancelled requests can be deleted.');
      return;
    }
    setDeleteRequestId(requestId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRequestId) return;

    try {
      const response = await fetch(`${API_BASE}/admin/requests/${deleteRequestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Request deleted successfully');
        onRefresh();
      } else {
        const errorData = await response.json();
        alert(`Error deleting request: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Error deleting request. Please try again.');
    }

    setShowDeleteModal(false);
    setDeleteRequestId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Service Requests</h2>
        <button
          onClick={onRefresh}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Priority</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center text-gray-600">
            <span className="text-sm font-medium">
              {filteredRequests.length} of {requests.length} requests
            </span>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Assigned Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Room {request.room_number} - {request.request_type}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {request.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handlePriorityClick(request.id, request.priority)}
                      className={`px-2 py-1 text-xs font-medium rounded-full border hover:opacity-80 ${getPriorityColor(request.priority)}`}
                    >
                      {request.priority}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusClick(request.id, request.status)}
                      className={`px-2 py-1 text-xs font-medium rounded-full border hover:opacity-80 ${getStatusColor(request.status)}`}
                    >
                      {request.status.replace('_', ' ')}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.staff_members ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {request.staff_members.full_name}
                        </div>
                        <div className="text-gray-500">
                          {request.staff_members.department}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleAssignClick(request.id, request.assigned_staff_id)}
                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                      title="Assign Staff"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStatusClick(request.id, request.status)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Update Status"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleHistoryClick(request.id)}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                      title="View History"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    {request.status === 'cancelled' && (
                      <button
                        onClick={() => handleDeleteClick(request.id, request.status)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && assignmentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Assign Staff Member
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Staff Member
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select a staff member</option>
                  {staff.filter(s => s.is_available).map((member) => (
                    <option key={member.staff_id} value={member.staff_id}>
                      {member.full_name} - {member.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Notes (Optional)
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Add any special instructions..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                disabled={!selectedStaffId}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && statusUpdateData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Update Request Status
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Add status update notes..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Priority Update Modal */}
      {showPriorityModal && priorityUpdateData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Update Request Priority
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Notes (Optional)
                </label>
                <textarea
                  value={priorityNotes}
                  onChange={(e) => setPriorityNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Add priority update notes..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPriorityModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePrioritySubmit}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Update Priority
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyRequestId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Request History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {requestHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No history available</h3>
                  <p className="text-gray-600">No actions have been recorded for this request yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requestHistory.map((entry, index) => (
                    <div key={entry.id || index} className="border-l-4 border-gray-200 pl-4 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              entry.action === 'created' ? 'bg-blue-100 text-blue-800' :
                              entry.action === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                              entry.action === 'status_changed' ? (
                                entry.details?.includes('cancelled') ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                              ) :
                              entry.action === 'priority_changed' ? 'bg-orange-100 text-orange-800' :
                              entry.action === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {entry.action.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                              by {entry.user_type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mt-1">{entry.details}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteRequestId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Cancelled Request
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to permanently delete this cancelled request? 
              This action cannot be undone. Chat history will be preserved.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};