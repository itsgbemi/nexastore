export default function ProductCard({ product, onSelect, isSelected }) {
  return (
    <div className={`product-card ${isSelected ? 'selected' : ''}`}>
      <div className="product-image">
        <i className={`fas ${product.icon}`}></i>
      </div>
      
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-features">
          {product.features.map((feature, index) => (
            <span key={index} className="feature-tag">
              <i className="fas fa-check"></i> {feature}
            </span>
          ))}
        </div>
        
        <div className="product-price">
          ₦{product.price.toLocaleString()}
          <span className="price-ngn">NGN</span>
        </div>
        
        <button
          className="btn btn-primary btn-full"
          onClick={() => onSelect(product)}
        >
          <i className="fas fa-shopping-cart"></i>
          Buy Now
        </button>
      </div>

      <style jsx>{`
        .selected {
          border: 2px solid #22c55e;
        }
        .product-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .feature-tag {
          background: #f1f5f9;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.9rem;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .feature-tag i {
          color: #22c55e;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  )
}
