export enum CheckErrors {
  FETCH_CURRENT_IP_ERROR = 'Could not fetch current IP. Are you connected to the internet?',
  NOW_ACCESS_DENIED_ERROR = 'Access to Zeit API denied, double check your access token.',
  DOMAIN_NOT_FOUND_ERROR = 'Could not find domain',
  NOW_UNKNOWN_ERROR = 'Something went wrong fetching Now DNS. Please check your internet and try again shortly. If this problem persists, file an issue.',
  MISMATCH_ERROR = 'Current IP and Now DNS do not match'
}
