export interface ComplaintInput {
  residentName: string;
  flatNumber: string;
  message: string;
}

export function validateComplaintInput(data: any): { isValid: boolean; error?: string; cleaned?: ComplaintInput } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid request payload' };
  }

  const residentName = String(data.residentName || '').trim();
  const flatNumber = String(data.flatNumber || '').trim();
  const message = String(data.message || '').trim();

  if (!residentName) {
    return { isValid: false, error: 'Resident name is required' };
  }
  if (!flatNumber) {
    return { isValid: false, error: 'Flat number is required (e.g., A-203)' };
  }
  if (!message || message.length < 5) {
    return { isValid: false, error: 'Complaint message must be at least 5 characters long' };
  }

  return {
    isValid: true,
    cleaned: {
      residentName,
      flatNumber,
      message,
    },
  };
}
