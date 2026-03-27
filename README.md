# Exonver CRM — v4

## Setup rápido
```bash
npm install
npm start   # → http://localhost:3000
```

## Configurar recordatorios automáticos por email (EmailJS)

1. Regístrate en https://emailjs.com (plan gratuito: 200 emails/mes)
2. **Crear un servicio**: Email Services → Add New Service → elige Gmail/Outlook/etc.
3. **Crear una plantilla**: Email Templates → Create New Template
   - Asunto sugerido: `⏰ Recordatorio Exonver: {{task_type}} — {{client_name}}`
   - Cuerpo sugerido:
     ```
     Hola {{to_name}},

     Tienes una tarea próxima en Exonver:

     Tipo: {{task_type}}
     Cliente: {{client_name}}
     Tarea: {{task_desc}}
     Fecha/Hora: {{due_datetime}}
     Recordatorio: {{reminder_min}} minutos antes

     — Exonver CRM
     "Donde la experiencia del cliente se transforma en éxito comercial."
     ```
4. En Exonver → **Configuración** → pega tu **Service ID**, **Template ID** y **Public Key**
5. ¡Listo! Los emails se envían automáticamente cuando llega la hora.

## Novedades v4
- Nombre: **Exonver**
- Columnas colapsables: el encabezado siempre visible, solo se ocultan las tarjetas
- EmailJS integrado: recordatorios automáticos al correo del asesor
- Marcar tareas como hechas con checkbox visual (verde con check, animación pop)
- Contador de tareas completadas vs pendientes en la ficha del cliente
- WhatsApp API para el asesor: Fase 2

## Estructura
```
src/
├── data/constants.js
├── hooks/useCRM.js         estado + motor de recordatorios automáticos
├── utils/helpers.js
├── utils/emailService.js   EmailJS integration
├── components/
│   ├── Icons.jsx
│   ├── UI.jsx              TaskCheck (nuevo checkbox premium)
│   ├── KanbanBoard.jsx     columnas colapsables mejoradas
│   ├── PipelineHistory.jsx
│   ├── TasksPanel.jsx      toggle hecha/pendiente con feedback visual
│   ├── ClientModal.jsx
│   └── Views.jsx           ClientList + ReportsView + SettingsView
└── App.jsx
```
