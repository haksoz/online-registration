/**
 * Client-side bilgileri toplar (browser'da çalışır)
 */
export interface ClientInfo {
  screenResolution: string
  language: string
  timezone: string
  formStartedAt: string | null
  formCompletedAt: string | null
  stepsCompleted: StepCompletion[]
  errorsEncountered: ErrorInfo[]
}

export interface StepCompletion {
  step: number
  stepName: string
  completedAt: string
}

export interface ErrorInfo {
  step: number
  error: string
  occurredAt: string
}

/**
 * Tarayıcı ve sistem bilgilerini toplar
 */
export function collectClientInfo(): Partial<ClientInfo> {
  if (typeof window === 'undefined') {
    return {}
  }
  
  return {
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || 'unknown',
    timezone: getTimezone()
  }
}

/**
 * Kullanıcının timezone'unu alır
 */
function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    return 'unknown'
  }
}

/**
 * Form tracking bilgilerini hazırlar
 */
export function prepareLogData(
  formStartedAt: string | null,
  stepsCompleted: StepCompletion[],
  errorsEncountered: ErrorInfo[]
): Partial<ClientInfo> {
  return {
    ...collectClientInfo(),
    formStartedAt,
    formCompletedAt: new Date().toISOString(),
    stepsCompleted,
    errorsEncountered
  }
}

/**
 * Registration log'unu API'ye gönderir
 */
export async function sendRegistrationLog(
  registrationId: number,
  logData: Partial<ClientInfo>
): Promise<boolean> {
  try {
    const response = await fetch(`/api/registrations/${registrationId}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logData)
    })
    
    return response.ok
  } catch (error) {
    console.error('Error sending registration log:', error)
    return false
  }
}
