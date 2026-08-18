import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, RotateCcw, Check, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useCustomization } from '../../context/CustomizationContext';

export const StagedConfirmationBar = () => {
  const { isDirty, isApplying, discardStagedChanges, confirmAndApplyChanges } = useCustomization();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastError, setIsToastError] = useState(false);

  const handleConfirm = async () => {
    try {
      const result = await confirmAndApplyChanges();
      if (result.success) {
        setIsToastError(false);
        setToastMessage('Changes applied & pre-sync snapshot secured in Vault!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }
    } catch (err) {
      setIsToastError(true);
      setToastMessage(err.message || 'Failed to apply changes. Reverted to previous state.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            style={{
              position: 'fixed',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              background: isToastError ? 'rgba(30, 10, 15, 0.95)' : 'rgba(6, 28, 20, 0.95)',
              border: isToastError ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid rgba(0, 255, 135, 0.5)',
              color: isToastError ? '#FECDD3' : '#00FF87',
              fontSize: '12.5px',
              fontWeight: 700,
              padding: '10px 18px',
              borderRadius: '14px',
              boxShadow: isToastError ? '0 12px 36px rgba(244, 63, 94, 0.3)' : '0 12px 36px rgba(0, 255, 135, 0.25)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isToastError ? <AlertTriangle size={15} color="#F43F5E" /> : <CheckCircle2 size={15} color="#00FF87" />}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Staged Confirmation Action Bar */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9000,
              width: '92%',
              maxWidth: '680px',
              background: 'linear-gradient(135deg, rgba(13, 17, 28, 0.96) 0%, rgba(8, 11, 17, 0.98) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(0, 255, 135, 0.4)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 255, 135, 0.2)',
              borderRadius: '20px',
              padding: '14px 20px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(0, 255, 135, 0.12)',
                  border: '1px solid rgba(0, 255, 135, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00FF87',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#F8FAFC' }}>
                    Unapplied Customization Changes
                  </h4>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      padding: '1px 7px',
                      background: 'rgba(255, 215, 0, 0.15)',
                      color: '#FFD700',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: '999px',
                    }}
                  >
                    Draft
                  </span>
                </div>
                <p style={{ margin: '3px 0 0 0', fontSize: '11.5px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={13} color="#00FF87" />
                  Auto-snapshot backup will be created in your vault before applying.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={discardStagedChanges}
                disabled={isApplying}
                className="btn-glass-secondary"
                style={{ height: '36px', padding: '0 16px', fontSize: '12.5px' }}
              >
                <RotateCcw size={13} />
                <span>Discard</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isApplying}
                className="btn-primary-mint"
                style={{ height: '36px', padding: '0 20px', fontSize: '12.5px' }}
              >
                {isApplying ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>Confirm Changes</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StagedConfirmationBar;
