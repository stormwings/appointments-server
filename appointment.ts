export enum AppointmentStatus {
  PROPOSED = 'proposed',
  PENDING = 'pending',
  BOOKED = 'booked',
  ARRIVED = 'arrived',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  NOSHOW = 'noshow',
  ENTERED_IN_ERROR = 'entered-in-error',
  CHECKED_IN = 'checked-in',
  WAITLIST = 'waitlist',
}

export enum ParticipantRequired {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
  INFORMATION_ONLY = 'information-only',
}

export enum ParticipantStatus {
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  TENTATIVE = 'tentative',
  NEEDS_ACTION = 'needs-action',
}

export interface Reference<T = string> {
  reference?: string;
  type?: T;
  display?: string;
}

export interface AppointmentParticipant {
  actor?: Reference<
    | 'Patient'
    | 'Practitioner'
    | 'PractitionerRole'
    | 'RelatedPerson'
    | 'Device'
    | 'HealthcareService'
    | 'Location'
  >;
  required?: ParticipantRequired;
  status: ParticipantStatus;
}

export interface Meta {
  versionId?: string;
  lastUpdated?: string;
}

export interface Appointment {
  id?: string;
  resourceType: 'Appointment';
  meta?: Meta;
  status: AppointmentStatus;
  description?: string;
  start?: string;
  end?: string;
  minutesDuration?: number;
  comment?: string;
  participant: AppointmentParticipant[];
}

export function validateAppointment(appointment: Appointment): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!appointment.resourceType || appointment.resourceType !== 'Appointment') {
    errors.push('resourceType must be "Appointment"');
  }

  if (!appointment.status) {
    errors.push('status is required');
  }

  if (!appointment.participant || appointment.participant.length === 0) {
    errors.push('At least one participant is required');
  } else {
    appointment.participant.forEach((p, index) => {
      if (!p.status) {
        errors.push(`Participant ${index} must have a status`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

const VALID_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.PROPOSED]: [
    AppointmentStatus.PENDING,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.ENTERED_IN_ERROR,
  ],
  [AppointmentStatus.PENDING]: [
    AppointmentStatus.BOOKED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.ENTERED_IN_ERROR,
  ],
  [AppointmentStatus.BOOKED]: [
    AppointmentStatus.ARRIVED,
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NOSHOW,
    AppointmentStatus.ENTERED_IN_ERROR,
  ],
  [AppointmentStatus.ARRIVED]: [
    AppointmentStatus.FULFILLED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NOSHOW,
    AppointmentStatus.ENTERED_IN_ERROR,
  ],
  [AppointmentStatus.CHECKED_IN]: [
    AppointmentStatus.FULFILLED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NOSHOW,
    AppointmentStatus.ENTERED_IN_ERROR,
  ],
  [AppointmentStatus.WAITLIST]: [
    AppointmentStatus.PENDING,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.ENTERED_IN_ERROR,
  ],
  [AppointmentStatus.FULFILLED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.NOSHOW]: [],
  [AppointmentStatus.ENTERED_IN_ERROR]: [],
};

export function isValidStatusTransition(
  from: AppointmentStatus,
  to: AppointmentStatus,
): boolean {
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) || false;
}

export function canCancelAppointment(status: AppointmentStatus): boolean {
  return ![
    AppointmentStatus.FULFILLED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NOSHOW,
    AppointmentStatus.ENTERED_IN_ERROR,
  ].includes(status);
}
