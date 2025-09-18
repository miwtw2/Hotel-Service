import { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  UserCheck,
  Settings,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { RequestsManagement } from './RequestsManagement';
import { StaffManagement } from './StaffManagement';
import { AssignmentsManagement } from './AssignmentsManagement';

interface AdminDashboardProps {
  sessionToken: string;
  userData: {
    username: string;
    fullName: string;
    role: string;
  };
  onLogout: () => void;
}

interface DashboardStats {
  total_requests: number;
  pending_requests: number;
  in_progress_requests: number;
  completed_requests: number;
  total_staff: number;
  available_staff: number;
  urgent_requests: number;
  emergency_requests: number;
}

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

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  sessionToken, 
  userData, 
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'staff' | 'assignments'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchRequests = async (status?: string) => {
    try {
      const url = status 
        ? `${API_BASE}/admin/requests?status=${status}`
        : `${API_BASE}/admin/requests`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch requests');
      
      const data = await response.json();
      setRequests(data.requests);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/staff`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch staff');
      
      const data = await response.json();
      setStaff(data.staff);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const assignRequest = async (requestId: string, staffId: string, notes?: string) => {
    try {
      const response = await fetch(`${API_BASE}/admin/requests/${requestId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: staffId,
          notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to assign request');
      
      // Refresh data
      fetchRequests();
      fetchDashboardStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`${API_BASE}/admin/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      // Refresh data
      fetchRequests();
      fetchDashboardStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRequests(),
        fetchStaff(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [sessionToken]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'acknowledged': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'assigned': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'in_progress': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {userData.fullName} ({userData.role})
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ClipboardList },
              { id: 'requests', label: 'Service Requests', icon: ClipboardList },
              { id: 'staff', label: 'Staff Management', icon: Users },
              { id: 'assignments', label: 'Assignments', icon: UserCheck },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <ClipboardList className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Requests</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.total_requests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-50 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pending_requests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Settings className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.in_progress_requests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.completed_requests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Staff</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.total_staff}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Available Staff</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.available_staff}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Urgent</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.urgent_requests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Emergency</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.emergency_requests}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Requests */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
              </div>
              <div className="p-6">
                {requests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Room {request.room_number} - {request.request_type}
                      </p>
                      <p className="text-sm text-gray-600">{request.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs will be rendered by separate components */}
        {activeTab === 'requests' && (
          <RequestsManagement 
            requests={requests}
            staff={staff}
            onAssign={assignRequest}
            onUpdateStatus={updateRequestStatus}
            onRefresh={() => fetchRequests()}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        )}

        {activeTab === 'staff' && (
          <StaffManagement 
            staff={staff}
            onRefresh={() => fetchStaff()}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsManagement 
            sessionToken={sessionToken}
            staff={staff}
          />
        )}
      </main>
    </div>
  );
};