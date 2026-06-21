export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function isRateLimitedError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes('temporarily rate-limited') ||
    message.includes('rate-limited upstream') ||
    message.includes('too many requests') ||
    (message.includes('429') &&
      (message.includes('retry') ||
        message.includes('rate limit') ||
        message.includes('rate-limited')))
  );
}

export function isQuotaExceededError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  if (isRateLimitedError(error)) {
    return false;
  }

  return (
    message.includes('429') ||
    message.includes('resource_exhausted') ||
    message.includes('quota exceeded') ||
    message.includes('insufficient_quota')
  );
}

export function isRetryableProviderError(error: unknown) {
  return isRateLimitedError(error) || isQuotaExceededError(error);
}

export function getQuotaRetryDelayMs(error: unknown) {
  const message = getErrorMessage(error);
  const retryAfterHeader = message.match(/retry after[^0-9]*(\d+)/i);
  const retryInSeconds = message.match(/retry in ([\d.]+)s/i);
  const retryAfterSecondsRaw = message.match(/retry_after_seconds[^0-9]*([\d.]+)/i);

  if (retryAfterSecondsRaw) {
    return Math.ceil(Number(retryAfterSecondsRaw[1]) * 1000);
  }

  if (retryAfterHeader) {
    return Number(retryAfterHeader[1]) * 1000;
  }

  if (retryInSeconds) {
    return Math.ceil(Number(retryInSeconds[1]) * 1000);
  }

  return 0;
}

export function classifyProviderError(error: unknown) {
  if (isRateLimitedError(error)) {
    return 'rate_limited' as const;
  }

  if (isQuotaExceededError(error)) {
    return 'quota_exceeded' as const;
  }

  return 'error' as const;
}
