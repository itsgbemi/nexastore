export default function SuccessModal({ transactionData, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        
        <h2>Payment Successful! 🎉</h2>
        
        <p>
          Thank you for your purchase! Your payment has been processed successfully.
        </p>

        <div className="transaction-details">
          <div className="detail-row">
            <span>Reference:</span>
            <strong>{transactionData?.reference}</strong>
          </div>
          <div className="detail-row">
            <span>Product:</span>
            <span>{transactionData?.product}</span>
          </div>
          <div className="detail-row">
            <span>Amount:</span>
            <span className="price">₦{transactionData?.amount?.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span>Customer:</span>
            <span>{transactionData?.customer}</span>
          </div>
          <div className="detail-row">
            <span>Email:</span>
            <span>{transactionData?.email}</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onClose}>
          <i className="fas fa-shopping-bag"></i>
          Continue Shopping
        </button>
      </div>

      <style jsx>{`
        .transaction-details {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 15px;
          margin: 2rem 0;
          text-align: left;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .detail-row:last-child {
          margin-bottom: 0;
          border-bottom: none;
        }
        .detail-row .price {
          color: #22c55e;
          font-weight: 700;
        }
      `}</style>
    </div>
  )
}
