/**
 * Object.keys(Countly):  [
  'Bulk',                'features',
  'init',                'group_features',
  'check_consent',       'check_any_consent',
  'add_consent',         'remove_consent',
  'begin_session',       'session_duration',
  'end_session',         'change_id',
  'add_event',           'start_event',
  'end_event',           'user_details',
  'userData',            'report_conversion',
  'report_feedback',     'track_errors',
  'log_error',           'add_log',
  'fetch_remote_config',
  'get_remote_config',
  'stop_time',           'start_time',
  'track_view',          'track_pageview',
  'report_trace',        'report_app_start',
  'request'
]
 */
declare module 'countly-sdk-nodejs' {
  interface Countly {
    init(
      // app_key - mandatory, app key for your app created in Countly
      app_key: string,
      // url - your Countly server url (default: "https://cloud.count.ly"), you must use your own server URL here
      url: string,
      // storage_path - where SDK would store data, including id, queues, etc (default: "../data/")
      storage_path: string,
      // require_consent - pass true if you are implementing GDPR compatible consent management. It would prevent running any functionality without proper consent (default: false)
      require_consent: true,
      // app_version - (optional) the version of your app or website
      app_version?: string,
      // country_code - (optional) country code for your visitor
      country_code?: string,
      // city - (optional) name of the city of your visitor
      city?: string,
      // ip_address - (optional) ip address of your visitor
      ip_address?: string,
      // debug - output debug info into console (default: false)
          debug?: boolean,
      // interval - set an interval how often to check if there is any data to report and report it (default: 500 ms)
      interval?: number,
      // fail_timeout - set time in seconds to wait after failed connection to server (default: 60 seconds)
      fail_timeout?: number,
      // session_update - how often in seconds should session be extended (default: 60 seconds)
      session_update?: number,
      // max_events - maximum amount of events to send in one batch (default: 10)
      max_events?: number,
      // force_post - force using post method for all requests (default: false)
      force_post?: boolean,
      // remote_config - Enable automatic remote config fetching, provide callback function to be notified when fetching done (default: false)
      remote_config?: boolean,
      // http_options - function to get http options by reference and overwrite them, before running each request
      http_options?: (args: unknown) => unknown,
      // max_logs - maximum amount of breadcrumbs to store for crash logs (default: 100)
      max_logs?: number,
      // metrics - provide for this user/device, or else will try to collect what's possible
      metrics?: unknown,
      // device_id - to identify a visitor, will be auto generated if not provided
      device_id?: string,

      // @see https://support.count.ly/hc/en-us/articles/360037442892-NodeJS-SDK#sdk-internal-limits
      max_key_length?: number, // default = 500,
      max_value_size?: number, // default = 12,
      max_segmentation_values?: number, // default = 23,
      max_breadcrumb_count?: number, // default = 80,
      max_stack_trace_lines_per_thread?: number, // default = 50,
      max_stack_trace_line_length?: number, // default = 300,
    ): void;
    Bulk: unknown
    features: unknown
    group_features: unknown
    check_consent: unknown
    check_any_consent: unknown
    add_consent: unknown
    remove_consent: unknown
    begin_session: unknown
    session_duration: unknown
    end_session: unknown
    change_id: unknown
    add_event: unknown
    start_event: unknown
    end_event: unknown
    user_details: unknown
    userData: unknown
    report_conversion: unknown
    report_feedback: unknown
    track_errors: unknown
    log_error: unknown
    add_log: unknown
    fetch_remote_config: unknown
    get_remote_config: unknown
    stop_time: unknown
    start_time: unknown
    track_view: unknown
    track_pageview: unknown
    report_trace: unknown
    report_app_start: unknown
    request: unknown
    setLoggingEnabled(toggle: boolean): void
  }
  export default Countly

  export function enableLogging(): void;
  export function enableParameterTamperingProtection(salt: string): void;
  export function start(): void;
  export function sendEvent({ eventName, eventCount, eventSum }: EventData): void;
  export function recordView(view: string): void;
  export function isInitialized(): Promise<boolean>;
}
