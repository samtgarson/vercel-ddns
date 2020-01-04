export enum Errors {
  FETCH_CURRENT_IP_ERROR = 'Could not fetch current IP. Are you connected to the internet?',
  NOW_ACCESS_DENIED_ERROR = 'Access to Now API denied, double check your access token.',
  DOMAIN_NOT_FOUND_ERROR = 'Could not find domain',
  NOW_UNKNOWN_ERROR = 'Something went wrong talking to the Now API. Please check your internet and try again shortly. If this problem persists, file an issue.',
  MISMATCH_ERROR = 'Current IP and Now DNS do not match',
  NOW_CREATE_ERROR = 'Something went wrong creating your new DNS record. Please try again or file an issue.',
  NOW_DELETE_ERROR = 'Something went wrong deleting your old DNS record. Please try again or file an issue.',
}
