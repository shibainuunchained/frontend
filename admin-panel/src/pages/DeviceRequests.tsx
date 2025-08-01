import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Check, 
  X, 
  Smartphone,
  Clock,
  User,
  MapPin
} from 'lucide-react';
import { apiService } from '../services/apiService';
import type { DeviceRequest } from '../types';
import { formatDate, formatRelativeTime } from '../utils';

const DeviceRequests: React.FC = () => {
  const [requests, setRequests] = useState<DeviceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadDeviceRequests();
  }, []);

  const loadDeviceRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getDeviceRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load device requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      setProcessingId(userId);
      await apiService.approveDevice(userId);
      await loadDeviceRequests(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve device');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setProcessingId(userId);
      await apiService.rejectDevice(userId);
      await loadDeviceRequests(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject device');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400">{error}</p>
        <button onClick={loadDeviceRequests} className="mt-4 btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const pendingRequests = requests.filter(req => req.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Device Change Requests</h1>
          <p className="text-dark-400">Review and approve device change requests from users</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-dark-300">Pending: {pendingRequests.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-dark-300">Total: {requests.length}</span>
          </div>
        </div>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <div className="card border border-yellow-600 bg-yellow-900/10">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <div>
              <h3 className="text-yellow-400 font-semibold">Action Required</h3>
              <p className="text-yellow-300">
                {pendingRequests.length} device change request{pendingRequests.length !== 1 ? 's' : ''} pending approval
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Device Requests List */}
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="card">
              <div className="flex items-start space-x-4">
                {/* Status Indicator */}
                <div className="flex-shrink-0 pt-1">
                  {request.status === 'pending' && (
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  )}
                  {request.status === 'approved' && (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  )}
                  {request.status === 'rejected' && (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>

                {/* Request Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-primary-400" />
                      <h3 className="text-white font-semibold">{request.username}</h3>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${request.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' : ''}
                        ${request.status === 'approved' ? 'bg-green-900/30 text-green-400' : ''}
                        ${request.status === 'rejected' ? 'bg-red-900/30 text-red-400' : ''}
                      `}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-dark-400 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{formatRelativeTime(request.requestDate)}</span>
                    </div>
                  </div>

                  {/* Device Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Old Device */}
                    <div className="border border-dark-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Smartphone className="h-4 w-4 text-dark-400" />
                        <h4 className="text-dark-300 font-medium">Previous Device</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-dark-500" />
                          <span className="text-dark-400">IP:</span>
                          <span className="text-white">{request.oldDeviceInfo.ip}</span>
                        </div>
                        <div>
                          <span className="text-dark-400">Fingerprint:</span>
                          <p className="text-white font-mono text-xs break-all mt-1">
                            {request.oldDeviceInfo.fingerprint}
                          </p>
                        </div>
                        <div>
                          <span className="text-dark-400">User Agent:</span>
                          <p className="text-white text-xs truncate mt-1">
                            {request.oldDeviceInfo.userAgent}
                          </p>
                        </div>
                        <div>
                          <span className="text-dark-400">Last Used:</span>
                          <span className="text-white text-xs ml-2">
                            {formatDate(request.oldDeviceInfo.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* New Device */}
                    <div className="border border-yellow-600 bg-yellow-900/10 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Smartphone className="h-4 w-4 text-yellow-400" />
                        <h4 className="text-yellow-400 font-medium">New Device</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3 text-yellow-500" />
                          <span className="text-yellow-300">IP:</span>
                          <span className="text-white">{request.newDeviceInfo.ip}</span>
                        </div>
                        <div>
                          <span className="text-yellow-300">Fingerprint:</span>
                          <p className="text-white font-mono text-xs break-all mt-1">
                            {request.newDeviceInfo.fingerprint}
                          </p>
                        </div>
                        <div>
                          <span className="text-yellow-300">User Agent:</span>
                          <p className="text-white text-xs truncate mt-1">
                            {request.newDeviceInfo.userAgent}
                          </p>
                        </div>
                        <div>
                          <span className="text-yellow-300">Detected:</span>
                          <span className="text-white text-xs ml-2">
                            {formatDate(request.newDeviceInfo.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleApprove(request.userId)}
                        disabled={processingId === request.userId}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        <span>
                          {processingId === request.userId ? 'Approving...' : 'Approve'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleReject(request.userId)}
                        disabled={processingId === request.userId}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>
                          {processingId === request.userId ? 'Rejecting...' : 'Reject'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Shield className="h-16 w-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">No Device Requests</h3>
          <p className="text-dark-400">All users are using verified devices</p>
        </div>
      )}
    </div>
  );
};

export default DeviceRequests;