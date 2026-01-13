import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Check,
    X as CloseIcon,
    Eye,
    FileText,
    Search,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { KYCDocument, kycService } from '../api/services';

const KYC: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const queryClient = useQueryClient();

  const { data: documents, isLoading, error } = useQuery<KYCDocument[]>({
    queryKey: ['kyc-pending'],
    queryFn: kycService.getPendingDocuments,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ documentId, status, rejectionReason }: { documentId: string; status: 'approved' | 'rejected'; rejectionReason?: string }) =>
      kycService.verifyDocument(documentId, status, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-pending'] });
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowVerifyModal(false);
      setRejectionReason('');
      setSelectedDocument(null);
    },
  });

  const handleVerify = (document: KYCDocument, status: 'approved' | 'rejected') => {
    if (status === 'rejected') {
      setSelectedDocument(document);
      setShowVerifyModal(true);
    } else {
      verifyMutation.mutate({ documentId: document.id, status });
    }
  };

  const handleRejectConfirm = () => {
    if (selectedDocument) {
      verifyMutation.mutate({ 
        documentId: selectedDocument.id, 
        status: 'rejected', 
        rejectionReason 
      });
    }
  };

  const handleViewDocument = (document: KYCDocument) => {
    window.open(document.document_url, '_blank');
  };

  const filteredDocuments = documents?.filter(doc =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.document_type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getDocumentTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      gst: 'badge-gst',
      shop_license: 'badge-shop',
      aadhaar: 'badge-aadhaar',
      pan: 'badge-pan',
      other: 'badge-other',
    };
    return <span className={`document-type-badge ${styles[type] || styles.other}`}>{type.replace('_', ' ').toUpperCase()}</span>;
  };

  if (isLoading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>KYC Verification</h1>
        </div>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>KYC Verification</h1>
        </div>
        <div className="error">Error loading KYC documents</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>KYC Verification</h1>
        <p>Review and verify seller documents</p>
      </div>

      <div className="page-actions">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="kyc-grid">
        {filteredDocuments.length === 0 ? (
          <div className="no-data">No pending KYC documents</div>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="kyc-card">
              <div className="kyc-card-header">
                <div className="kyc-user-info">
                  <h3>{doc.name || 'Unknown'}</h3>
                  <p>{doc.email || ''}</p>
                  {doc.shop_name && <p className="shop-name">{doc.shop_name}</p>}
                </div>
                {getDocumentTypeBadge(doc.document_type)}
              </div>
              
              <div className="kyc-document-preview">
                <div className="document-icon">
                  <FileText size={48} />
                </div>
                <div className="document-info">
                  <p className="document-url">{doc.document_url.split('/').pop()}</p>
                  <p className="document-date">
                    Uploaded: {new Date(doc.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="kyc-card-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => handleViewDocument(doc)}
                >
                  <Eye size={18} />
                  View Document
                </button>
                <div className="kyc-verify-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleVerify(doc, 'approved')}
                    disabled={verifyMutation.isPending}
                  >
                    <Check size={18} />
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleVerify(doc, 'rejected')}
                    disabled={verifyMutation.isPending}
                  >
                    <X size={18} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showVerifyModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Document</h2>
              <button className="modal-close" onClick={() => setShowVerifyModal(false)}>
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="reject-info">
                <p><strong>Document Type:</strong> {selectedDocument.document_type.replace('_', ' ').toUpperCase()}</p>
                <p><strong>Seller:</strong> {selectedDocument.name}</p>
                <p><strong>Email:</strong> {selectedDocument.email}</p>
              </div>
              <div className="form-group">
                <label htmlFor="rejectionReason">Rejection Reason *</label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={4}
                  required
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
                {verifyMutation.isPending ? 'Rejecting...' : 'Reject Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYC;