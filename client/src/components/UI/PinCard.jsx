import React from 'react';

export const PinCard = ({ title, subtitle, amount, category, date, overlayPill, actionLabel, onAction, children }) => {
  return (
    <div className="pin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        {overlayPill ? (
          <span className="pin-overlay-pill">
            {overlayPill}
          </span>
        ) : category ? (
          <span className="pin-overlay-pill">
            {category}
          </span>
        ) : <div />}

        {amount !== undefined && (
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
            ₹{amount.toLocaleString()}
          </div>
        )}
      </div>

      {title && (
        <h3 className="heading-md" style={{ marginBottom: '4px' }}>
          {title}
        </h3>
      )}

      {subtitle && (
        <p className="body-sm" style={{ marginBottom: '12px' }}>
          {subtitle}
        </p>
      )}

      {children}

      {date && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--hairline-soft)' }}>
          <span className="body-sm" style={{ fontSize: '12px' }}>{new Date(date).toLocaleDateString()}</span>
          {actionLabel && (
            <button onClick={onAction} className="button-secondary" style={{ height: '32px', padding: '4px 12px', fontSize: '12px' }}>
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
