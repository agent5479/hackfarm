import { useState, type FormEvent } from 'react';
import { CONTACT, FORMS_ENDPOINT } from '../lib/constants';

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
      'Hack Track', "Paton's Rock Beach Ride", 'Sunrise Ride', 'Swimming with Horses',
      'The Rangi Ride', 'Ale Trail - Mussel Inn', 'Collingwood Explorer',
      'Mussel Inn Ale Trail', 'Collingwood Discovery Ride', 'Moonlight Ride', 'Multi-day Experience',
    ]},
    { name: 'dates', label: 'Preferred Dates', type: 'text', required: true },
    { name: 'riders', label: 'Number of Riders', type: 'number' },
    { name: 'message', label: 'Additional Details', type: 'textarea' },
  ],
};

function formDataToPayload(type: string, data: FormData): Record<string, string> {
  const payload: Record<string, string> = {
    form_type: type,
    subject: `Hack Farm ${type} form submission`,
  };

  for (const [key, value] of data.entries()) {
    if (key === 'subject' || key === 'form_type') continue;
    const text = String(value).trim();
    if (!text) continue;
    if (key === 'help_with' && payload.help_with) {
      payload.help_with = `${payload.help_with}, ${text}`;
    } else {
      payload[key] = text;
    }
  }

  return payload;
}

function buildMailto(type: string, payload: Record<string, string>): string {
  const lines = Object.entries(payload)
    .filter(([key]) => key !== 'botcheck' && key !== 'subject')
    .map(([key, value]) => `${key}: ${value}`);
  const subject = encodeURIComponent(payload.subject || `Hack Farm ${type} form submission`);
  const body = encodeURIComponent(lines.join('\n'));
  return `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
}

export default function ContactForm({ type, title }: ContactFormProps) {
  const fields = FIELDS[type];
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = formDataToPayload(type, new FormData(form));

    if (!FORMS_ENDPOINT) {
      window.location.href = buildMailto(type, payload);
      return;
    }

    setStatus('sending');
    setError('');

    try {
      const response = await fetch(FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Unable to send message.');
      }
      form.reset();
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unable to send message.');
    }
  }

  if (status === 'sent') {
    return (
      <p className="form-success" role="status">
        Thanks — your message has been sent. We&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      {title && <h3>{title}</h3>}
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} aria-hidden="true" />

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

      {status === 'error' && (
        <p className="form-error" role="alert">
          {error} You can also email us directly at{' '}
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
        </p>
      )}

      <button type="submit" className="btn btn--green" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send'}
      </button>
    </form>
  );
}
