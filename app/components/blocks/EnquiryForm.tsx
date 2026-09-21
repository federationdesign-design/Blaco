import styles from './Blocks.module.css';
import type { FormModule } from '../../lib/content';

// Same fields, labels and required flags as the live Divi forms. Sending is
// wired to a Resend route handler in Phase 4.
export function EnquiryForm({ module }: { module: FormModule }) {
  return (
    <form className={styles.form} action="/api/enquiry" method="post">
      {module.title && <h2 className={styles.formTitle}>{module.title}</h2>}
      <input type="hidden" name="form" value={module.variant} />
      {module.fields.map((field) => {
        const id = `${module.variant}-${field.name}`;
        return (
          <div key={field.name} className={styles.field} data-wide={field.type === 'textarea' || undefined}>
            <label className={styles.label} htmlFor={id}>
              {field.label}
              {field.required && <span aria-hidden="true"> *</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea className={styles.input} id={id} name={field.name} required={field.required} rows={6} />
            ) : (
              <input
                className={styles.input}
                id={id}
                name={field.name}
                type={field.type}
                required={field.required}
                autoComplete={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'name'}
              />
            )}
          </div>
        );
      })}
      <button className={styles.button} type="submit">
        {module.submit}
      </button>
    </form>
  );
}
