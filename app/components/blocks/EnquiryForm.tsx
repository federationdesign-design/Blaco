'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import styles from './Blocks.module.css';
import { CONTACT } from '../../lib/site';
import { HONEYPOT, fieldName, validateEnquiry, type EnquiryErrors, type EnquiryValues } from '../../lib/enquiry';
import type { FormModule } from '../../lib/content';

// Same fields, labels and required flags as the live Divi forms. Sends to
// /api/enquiry (Resend). Without JavaScript the browser posts the form and the
// route redirects back with ?enquiry=sent or ?enquiry=error.

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function EnquiryForm({ module }: { module: FormModule }) {
  const page = usePathname();
  const uid = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Result of a no-JavaScript post, passed back in the query string.
  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get('enquiry');
    if (result === 'sent') setStatus('sent');
    if (result === 'error') setStatus('error');
  }, []);

  useEffect(() => {
    if (status === 'sent' || status === 'error') statusRef.current?.focus();
  }, [status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    const found = validateEnquiry(data as Partial<EnquiryValues>, module.variant);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: EnquiryErrors };
      if (res.ok && body.ok) {
        setStatus('sent');
        return;
      }
      if (body.errors) setErrors(body.errors);
      setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div id="enquiry" className={styles.formStatus} data-state="sent" role="status" tabIndex={-1} ref={statusRef}>
        {module.title && <h2 className={styles.formTitle}>{module.title}</h2>}
        <p>{module.success}</p>
      </div>
    );
  }

  return (
    <form
      id="enquiry"
      ref={formRef}
      className={styles.form}
      action="/api/enquiry"
      method="post"
      noValidate
      onSubmit={onSubmit}
    >
      {module.title && <h2 className={styles.formTitle}>{module.title}</h2>}
      <input type="hidden" name="form" value={module.variant} />
      <input type="hidden" name="page" value={page} />
      <input type="hidden" name="title" value={module.title} />

      {status === 'error' && (
        <div className={styles.formStatus} data-state="error" role="alert" tabIndex={-1} ref={statusRef}>
          <p>
            Sorry, your message could not be sent. Please check the form and try again, or call us on{' '}
            <a href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>.
          </p>
        </div>
      )}

      {module.fields.map((field) => {
        const name = fieldName(field);
        const id = `${uid}-${name}`;
        const error = errors[name];
        const describedBy = error ? `${id}-error` : undefined;
        return (
          <div key={name} className={styles.field} data-wide={field.type === 'textarea' || undefined}>
            <label className={styles.label} htmlFor={id}>
              {field.label}
              {field.required && <span aria-hidden="true"> *</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                className={styles.input}
                id={id}
                name={name}
                required={field.required}
                rows={6}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
              />
            ) : (
              <input
                className={styles.input}
                id={id}
                name={name}
                type={field.type}
                required={field.required}
                autoComplete={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'name'}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
              />
            )}
            {error && (
              <p className={styles.fieldError} id={`${id}-error`}>
                {error}
              </p>
            )}
          </div>
        );
      })}

      {/* Honeypot: hidden from people and assistive technology. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor={`${uid}-${HONEYPOT}`}>Leave this field empty</label>
        <input id={`${uid}-${HONEYPOT}`} name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button className={styles.button} type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : module.submit}
      </button>
    </form>
  );
}
