// Centralized scroll lock utility to avoid leaving body overflow locked accidentally.
// Uses a reference counter so multiple modals/components can coexist safely.

let lockCount = 0;
const BODY_LOCK_CLASS = 'scroll-locked';

function applyLock() {
  if (!document.body.classList.contains(BODY_LOCK_CLASS)) {
    // Store original inline overflow so we can restore precisely
    if (!document.body.dataset.prevOverflow) {
      document.body.dataset.prevOverflow = document.body.style.overflow || '';
    }
    document.body.classList.add(BODY_LOCK_CLASS);
    document.body.style.overflow = 'hidden';
    // Optionally compensate for scrollbar width to prevent layout shift
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = scrollBarWidth + 'px';
    }
  }
}

function removeLock() {
  if (lockCount === 0) return; // Nothing to do
  if (lockCount === 1) {
    document.body.classList.remove(BODY_LOCK_CLASS);
    // Restore previous inline overflow
    if (document.body.dataset.prevOverflow !== undefined) {
      document.body.style.overflow = document.body.dataset.prevOverflow;
      delete document.body.dataset.prevOverflow;
    } else {
      document.body.style.overflow = '';
    }
    document.body.style.paddingRight = '';
  }
}

export function lockScroll() {
  lockCount += 1;
  applyLock();
}

export function unlockScroll() {
  if (lockCount > 0) {
    lockCount -= 1;
    removeLock();
  }
}

export function forceUnlockAllScroll() {
  lockCount = 0;
  document.body.classList.remove(BODY_LOCK_CLASS);
  if (document.body.dataset.prevOverflow !== undefined) {
    document.body.style.overflow = document.body.dataset.prevOverflow;
    delete document.body.dataset.prevOverflow;
  } else {
    document.body.style.overflow = '';
  }
  document.body.style.paddingRight = '';
}

// (Optional) helper to query current lock count for debugging.
export function getScrollLockCount() {
  return lockCount;
}
