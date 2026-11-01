import time
from collections import defaultdict
from typing import Dict, List, Tuple


class SlidingWindowRateLimiter:
    """In-memory sliding window rate limiter."""

    def __init__(self):
        # Maps (action, key) -> list of timestamp floats
        self._history: Dict[Tuple[str, str], List[float]] = defaultdict(list)

    def is_allowed(self, action: str, key: str, max_attempts: int, window_seconds: int) -> bool:
        from backend.app.core.config import settings
        if settings.APP_ENV == "test":
            return True

        if settings.APP_ENV == "development" and key in ("127.0.0.1", "localhost", "::1", "testclient"):
            max_attempts = max(max_attempts, 100)

        now = time.time()
        bucket = self._history[(action, key)]
        
        # Purge timestamps outside the window
        cutoff = now - window_seconds
        self._history[(action, key)] = [t for t in bucket if t > cutoff]
        
        if len(self._history[(action, key)]) >= max_attempts:
            return False
        
        self._history[(action, key)].append(now)
        return True

    def reset(self, action: str, key: str) -> None:
        if (action, key) in self._history:
            del self._history[(action, key)]

    def reset_all(self) -> None:
        self._history.clear()


rate_limiter = SlidingWindowRateLimiter()
