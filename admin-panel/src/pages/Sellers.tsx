import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Check,
    Eye,
    Search,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { sellerService, User } from '../api/services';

const Sellers: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<User | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const queryClient = useQueryClient();

  const { data: sellers, isLoading, error } = useQuery<User[]>({
    queryKey: ['sellers', filter],
    queryFn: () => sellerService.getAllSellers(filter === 'all' ? undefined : filter),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ userId, status, rejectionReason }: { userId: string; status: 'verified' | 'rejected'; rejectionReason?: string }) =>
      sellerService.verifySeller(userId, status, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowVerifyModal(false);
      setRejectionReason('');
      setSelectedSeller(null);
    },
  });

  const handleVerify = (seller: User, status: 'verified' | 'rejected') => {
    if (status === 'rejected') {
      setSelectedSeller(seller);
      setShowVerifyModal(true);
    } else {
      verifyMutation.mutate({ userId: seller.id, status });
    }
  };

  const handleRejectConfirm = () => {
    if (selectedSeller) {
      verifyMutation.mutate({ 
        userId: selectedSeller.id, 
        status: 'rejected', 
        rejectionReason 
      });
    }
  };

  const filteredSellers = sellers?.filter(seller =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.shop_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'status-badge-pending',
      verified: 'status-badge-verified',
      rejected: 'status-badge-rejected',
    };
    return <span className={`status-badge ${styles[status as keyof typeof styles]}`}>{status}</span>;
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Sellers</h1>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Sellers</h1>
        </div>
        <div className="error">Error loading sellers</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Sellers</h1>
        <p>Manage seller registrations and approvals</p>
      </div>

      <div className="page-actions">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search sellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${filter === 'verified' ? 'active' : ''}`}
            onClick={() => setFilter('verified')}
          >
            Verified
          </button>
          <button
            className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Shop Name</th>
              <th>GST No</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  No sellers found
                </td>
              </tr>
            ) : (
              filteredSellers.map((seller) => (
                <tr key={seller.id}>
                  <td className="font-medium">{seller.name}</td>
                  <td>{seller.email}</td>
                  <td>{seller.shop_name || '-'}</td>
                  <td>{seller.gst_no || 'N/A'}</td>
                  <td>{getStatusBadge(seller.status)}</td>
                  <td>{new Date(seller.created_at || '').toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      {seller.status === 'pending' && (
                        <>
                          <button
                            className="btn-icon btn-success"
                            onClick={() => handleVerify(seller, 'verified')}
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleVerify(seller, 'rejected')}
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      <button
                        className="btn-icon"
                        onClick={() => setSelectedSeller(seller)}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Verify Modal */}
      {showVerifyModal && selectedSeller && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Seller</h2>
              <button className="modal-close" onClick={() => setShowVerifyModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to reject <strong>{selectedSeller.name}</strong>?</p>
              <div className="form-group">
                <label htmlFor="rejectionReason">Rejection Reason</label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowVerifyModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleRejectConfirm}
                disabled={verifyMutation.isPending || !rejectionReason}
              >
                {verifyMutation.isPending ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seller Details Modal */}
      {selectedSeller && !showVerifyModal && (
        <div className="modal-overlay" onClick={() => setSelectedSeller(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Seller Details</h2>
              <button className="modal-close" onClick={() => setSelectedSeller(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="seller-details">
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedSeller.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedSeller.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Shop Name:</span>
                  <span className="detail-value">{selectedSeller.shop_name || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">GST Number:</span>
                  <span className="detail-value">{selectedSeller.gst_no || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{selectedSeller.address || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">{getStatusBadge(selectedSeller.status)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Registered:</span>
                  <span className="detail-value">
                    {new Date(selectedSeller.created_at || '').toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedSeller(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sellers;