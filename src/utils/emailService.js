import emailjs from '@emailjs/browser';

let _config = null;

export function initEmailJS(config) {
  _config = config;
  if (config.publicKey) {
    emailjs.init(config.publicKey);
  }
}

export async function sendTaskReminder({ task, clientName, advisorEmail, advisorName = 'Asesor' }) {
  if (!_config?.serviceId || !_config?.templateId || !_config?.publicKey) {
    console.warn('[Exonver] EmailJS no configurado — recordatorio omitido');
    return { ok: false, reason: 'not_configured' };
  }
  if (!advisorEmail) {
    console.warn('[Exonver] Sin email del asesor configurado');
    return { ok: false, reason: 'no_email' };
  }

  try {
    const due = new Date(`${task.dueDate}T${task.dueTime||'00:00'}`);
    const dueFormatted = due.toLocaleString('es-CO', {
      weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit'
    });

    const templateParams = {
      to_email:     advisorEmail,
      to_name:      advisorName,
      task_type:    task.type,
      task_desc:    task.desc,
      client_name:  clientName,
      due_datetime: dueFormatted,
      reminder_min: task.reminderMin,
      app_name:     'Exonver',
    };

    await emailjs.send(_config.serviceId, _config.templateId, templateParams);
    return { ok: true };
  } catch (err) {
    console.error('[Exonver] Error enviando email:', err);
    return { ok: false, reason: err?.text || 'error' };
  }
}
