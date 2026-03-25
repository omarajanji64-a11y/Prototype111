import { useEffect, useState } from "react";

export function useDashboardBootstrap(duration = 1000) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => window.clearTimeout(timeoutId);
  }, [duration]);

  return { isLoading };
}

