import { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Clock, 
  AlertTriangle,
  Eye,
  Calendar,
  Filter,
  Users
} from 'lucide-react';

interface Assignment {
  id: string;
  request_id: string;
  staff_id: string;
  assigned_at: string;
  notes?: string;
  service_requests: {
    room_number: string;
    request_type: string;
    description: string;
    priority: string;
    status: string;
    created_at: string;
  };
  staff_members: {
    full_name: string;
    department: string;
    role: string;
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

interface AssignmentsManagementProps {
  sessionToken: string;
  staff: StaffMember[];
}

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

export const AssignmentsManagement: React.FC<AssignmentsManagementProps> = ({
  sessionToken,
  staff,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [staffFilter, setStaffFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/assignments`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch assignments');
      
      const data = await response.json();
      setAssignments(data.assignments);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [sessionToken]);

  // Filter assignments
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesStaff = staffFilter === 'all' || assignment.staff_id === staffFilter;
    const matchesStatus = statusFilter === 'all' || assignment.service_requests.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || assignment.service_requests.priority === priorityFilter;

    return matchesStaff && matchesStatus && matchesPriority;
  });

  // Group assignments by staff member
  const assignmentsByStaff = filteredAssignments.reduce((acc, assignment) => {
    const staffId = assignment.staff_id;
    if (!acc[staffId]) {
      acc[staffId] = [];
    }
    acc[staffId].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStaffWorkload = (staffId: string) => {
    const staffAssignments = assignments.filter(a => a.staff_id === staffId);
    const activeAssignments = staffAssignments.filter(a => 
      ['assigned', 'in_progress'].includes(a.service_requests.status)
    );
    return {
      total: staffAssignments.length,
      active: activeAssignments.length,
    };
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Assignments</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchAssignments}
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
        <div className="flex items-center space-x-3">
          <UserCheck className="w-8 h-8 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-900">Staff Assignments</h2>
        </div>
        <button
          onClick={fetchAssignments}
          disabled={isLoading}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center space-x-2 disabled:opacity-50"
        >
          <Eye className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Staff Filter */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Staff</option>
              {staff.map((member) => (
                <option key={member.staff_id} value={member.staff_id}>
                  {member.full_name}
                </option>
              ))}
            </select>
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
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
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
              {filteredAssignments.length} assignments
            </span>
          </div>
        </div>
      </div>

      {/* Staff Workload Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Workload Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => {
            const workload = getStaffWorkload(member.staff_id);
            const isOverloaded = workload.active > 3; // Arbitrary threshold
            
            return (
              <div key={member.staff_id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{member.full_name}</h4>
                  <span className={`w-3 h-3 rounded-full ${
                    member.is_available ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                </div>
                <p className="text-sm text-gray-600 mb-2">{member.department}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    Active: {workload.active} / Total: {workload.total}
                  </span>
                  {isOverloaded && (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assignments by Staff */}
      <div className="space-y-6">
        {Object.entries(assignmentsByStaff).map(([staffId, staffAssignments]) => {
          const staffMember = staff.find(s => s.staff_id === staffId);
          if (!staffMember) return null;

          return (
            <div key={staffId} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="w-6 h-6 text-gray-600" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {staffMember.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {staffMember.department} • {staffMember.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${
                      staffMember.is_available ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <span className="text-sm text-gray-600">
                      {staffAssignments.length} assignment{staffAssignments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {staffAssignments.map((assignment) => (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Room {assignment.service_requests.room_number} - {assignment.service_requests.request_type}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {assignment.service_requests.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(assignment.service_requests.priority)}`}>
                            {assignment.service_requests.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(assignment.service_requests.status)}`}>
                            {assignment.service_requests.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Assigned: {formatDate(assignment.assigned_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Created: {formatDate(assignment.service_requests.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {assignment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {assignment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600">
            {staffFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filter criteria'
              : 'No staff assignments have been made yet'
            }
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      )}
    </div>
  );
};