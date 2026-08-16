export interface DeadlineInfo {
  text: string;
  daysRemaining: number | null;
  status: 'urgent' | 'warning' | 'normal' | 'passed' | 'unavailable';
  targetDate: string | null;
}

export function calculateDeadline(hackathon: {
  registration_deadline?: string | null;
  start_date?: string | null;
}): DeadlineInfo {
  const dateStr = hackathon.registration_deadline || hackathon.start_date;
  if (!dateStr) {
    return {
      text: 'Deadline unavailable',
      daysRemaining: null,
      status: 'unavailable',
      targetDate: null
    };
  }

  const target = new Date(dateStr);
  if (isNaN(target.getTime())) {
    return {
      text: 'Deadline unavailable',
      daysRemaining: null,
      status: 'unavailable',
      targetDate: null
    };
  }

  const now = new Date();
  // Set both to start of day for accurate calendar day difference
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  
  const diffTime = startOfTarget.getTime() - startOfToday.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: 'Deadline passed',
      daysRemaining: diffDays,
      status: 'passed',
      targetDate: dateStr
    };
  } else if (diffDays === 0) {
    return {
      text: 'Deadline today',
      daysRemaining: 0,
      status: 'urgent',
      targetDate: dateStr
    };
  } else if (diffDays === 1) {
    return {
      text: 'Deadline tomorrow',
      daysRemaining: 1,
      status: 'urgent',
      targetDate: dateStr
    };
  } else if (diffDays <= 3) {
    return {
      text: `${diffDays} days remaining`,
      daysRemaining: diffDays,
      status: 'warning',
      targetDate: dateStr
    };
  } else {
    return {
      text: `${diffDays} days remaining`,
      daysRemaining: diffDays,
      status: 'normal',
      targetDate: dateStr
    };
  }
}
