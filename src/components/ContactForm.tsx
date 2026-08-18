import { FORM_ENDPOINT } from '../lib/constants';

interface ContactFormProps {
  type: 'contact' | 'volunteer' | 'partner' | 'ride-request';
  title?: string;
}

const FIELDS: Record<string, { name: string; label: string; type: string; required?: boolean; options?: string[] }[]> = {
  contact: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'message', label: 'How can we help?', type: 'textarea', required: true },
  ],
  volunteer: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'arrival', label: 'Est Arrival', type: 'date' },
    { name: 'departure', label: 'Est Leave', type: 'date' },
    { name: 'about', label: 'Tell us about yourself', type: 'textarea', required: true },
    { name: 'skills', label: 'Do you have any particular skills you can offer?', type: 'textarea' },
  ],
  partner: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'business', label: 'Business Name', type: 'text', required: true },
    { name: 'website', label: 'Website', type: 'url' },
    { name: 'message', label: 'Tell us about your business', type: 'textarea', required: true },
  ],
  'ride-request': [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'experience', label: 'Riding Experience', type: 'select', options: ['Beginner', 'Intermediate', 'Experienced'] },
    { name: 'ride', label: 'Preferred Ride', type: 'select', options: [
      'Hack Track', "Paton's Rock Beach Ride", 'Sunset Ride', 'Swimming with Horses',
      'The Rangi Ride', 'Ale Trail - Mussel Inn', 'Collingwood Explorer',
      'Mussel Inn Ale Trail', 'Collingwood Discovery Ride', 'Moonlight Ride', 'Multi-day Experience',
    ]},
    { name: 'dates', label: 'Preferred Dates', type: 'text', required: true },
    { name: 'riders', label: 'Number of Riders', type: 'number' },
    { name: 'message', label: 'Additional Details', type: 'textarea' },
  ],
};

export default function ContactForm({ type, title }: ContactFormProps) {
  const fields = FIELDS[type];
  const action = FORM_ENDPOINT || `https://formsubmit.co/Stay@hackfarm.co.nz`;

  return (
    <form action={action} method="POST" className="contact-form">
      {title && <h3>{title}</h3>}
      <input type="hidden" name="_subject" value={`Hack Farm ${type} form submission`} />
      <input type="hidden" name="_captcha" value="false" />
      <input type="text" name="_honey" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
      <input type="hidden" name="form_type" value={type} />

      {fields.map((field) => (
        <div key={field.name} className="field">
          <label htmlFor={`${type}-${field.name}`}>{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea id={`${type}-${field.name}`} name={field.name} required={field.required} />
          ) : field.type === 'select' ? (
            <select id={`${type}-${field.name}`} name={field.name} required={field.required}>
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              id={`${type}-${field.name}`}
              name={field.name}
              type={field.type}
              required={field.required}
            />
          )}
        </div>
      ))}

      {type === 'volunteer' && (
        <div className="field">
          <label>I can help with:</label>
          <div className="checkbox-group">
            {['Hospitality', 'Farming/Gardening', 'Guiding/Horses', 'Creative Projects'].map((opt) => (
              <label key={opt}>
                <input type="checkbox" name="help_with" value={opt} /> {opt}
              </label>
            ))}
          </div>
        </div>
      )}

      <button type="submit" className="btn btn--green">Send</button>
    </form>
  );
}
