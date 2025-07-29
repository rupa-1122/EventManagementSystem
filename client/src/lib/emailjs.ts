import emailjs from '@emailjs/browser';

// Initialize EmailJS with the provided public key
emailjs.init("_5E3TBTSxOfgNVIWG");

export interface RegistrationEmailData {
  eventName: string;
  studentName: string;
  rollNumber: string;
  email: string;
  phone: string;
  branch: string;
  year: string;
  categories: string;
  registrationTime: string;
}

export const sendRegistrationEmail = async (data: RegistrationEmailData): Promise<void> => {
  const templateParams = {
  eventName: data.eventName,
  studentName: data.studentName,
  rollNumber: data.rollNumber,
  email: data.email,
  phone: data.phone,
  branch: data.branch,
  year: data.year,
  categories: data.categories,
  registrationTime: data.registrationTime,
};


  try {
    await emailjs.send('service_fkb2flr', 'template_bn5g7lg', templateParams);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};
