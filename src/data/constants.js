export const ORIGINS       = ['Referido','Showroom','Web','Redes sociales','Llamada'];
export const PAYMENT_TYPES = ['Contado','Crédito','Leasing'];
export const TASK_TYPES    = ['Llamar','WhatsApp','Visita showroom','Enviar propuesta','Seguimiento','Otro'];

export const DEFAULT_LOSS_REASONS = [
  'Precio muy alto',
  'Compró con la competencia',
  'No calificó para crédito',
  'Cambió de opinión / ya no compra',
  'Fuera de presupuesto',
  'El vehículo no estaba disponible',
  'Sin contacto / no respondió',
  'Otro',
];

export const DEFAULT_ORIGINS = ['Referido','Showroom','Web','Redes sociales','Llamada'];
export const DEFAULT_PAYMENT_TYPES = ['Contado','Crédito','Leasing','Permuta','Financiación directa'];


export const DEFAULT_STAGES = [
  { id:'lead',        label:'Lead',             color:'#2a2f45', textColor:'#8f95a8', dot:'#8f95a8' },
  { id:'contactado',  label:'Contactado',       color:'#2a2545', textColor:'#a78bfa', dot:'#a78bfa' },
  { id:'seguimiento', label:'En seguimiento',   color:'#1f3045', textColor:'#60a5fa', dot:'#60a5fa' },
  { id:'prueba',      label:'Prueba de manejo', color:'#1a3530', textColor:'#34d399', dot:'#34d399' },
  { id:'credito',     label:'En crédito',       color:'#352d1a', textColor:'#fbbf24', dot:'#fbbf24' },
  { id:'propuesta',   label:'Propuesta',        color:'#351a2d', textColor:'#f472b6', dot:'#f472b6' },
  { id:'cerrado',     label:'Cerrado ✅',       color:'#1a3520', textColor:'#4ade80', dot:'#4ade80', fixed:true },
  { id:'perdido',     label:'Perdido ❌',       color:'#351a1a', textColor:'#f87171', dot:'#f87171', fixed:true },
];

export const ORIGIN_COLORS = {
  'Referido':       { bg:'#2a2545', text:'#a78bfa' },
  'Showroom':       { bg:'#1f3045', text:'#60a5fa' },
  'Web':            { bg:'#1a3530', text:'#34d399' },
  'Redes sociales': { bg:'#351a2d', text:'#f472b6' },
  'Llamada':        { bg:'#352d1a', text:'#fbbf24' },
};


function daysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0]; }
function hoursAgo(h){ return new Date(Date.now()-h*3600000).toISOString(); }

// Note: ownerId links each client to a user. 'u1'=admin, 'u2'=carlos, 'u3'=gerente
export const SAMPLE_CLIENTS = [
  { id:'1', ownerId:'u2', name:'Carlos Mendoza',    phone:'3001234567', email:'carlos@email.com',   vehicle:'Toyota Hilux 2024',      budget:'$120.000.000', payment:'Crédito',  origin:'Showroom',       stageId:'seguimiento', lastContact:daysAgo(1),
    pipelineHistory:[{from:null,to:'lead',date:hoursAgo(120),note:'Lead creado'},{from:'lead',to:'contactado',date:hoursAgo(96),note:'Primer contacto'},{from:'contactado',to:'seguimiento',date:hoursAgo(24),note:'Envió documentos'}],
    notes:[{id:'n1',date:daysAgo(1),text:'Interesado en financiación a 60 meses.'}],
    tasks:[{id:'t1',type:'Llamar',desc:'Confirmar cuota mensual del crédito',dueDate:daysAgo(0),dueTime:'10:00',done:false,reminderMin:30,notified:false}],
  },
  { id:'2', ownerId:'u2', name:'Valentina Torres',  phone:'3109876543', email:'vtorres@email.com',  vehicle:'Mazda CX-5 2023',        budget:'$95.000.000',  payment:'Contado',   origin:'Referido',       stageId:'prueba',      lastContact:daysAgo(0),
    pipelineHistory:[{from:null,to:'lead',date:hoursAgo(200),note:'Lead creado'},{from:'lead',to:'contactado',date:hoursAgo(160),note:'WhatsApp'},{from:'contactado',to:'seguimiento',date:hoursAgo(80),note:'Visitó showroom'},{from:'seguimiento',to:'prueba',date:hoursAgo(4),note:'Agendó prueba'}],
    notes:[{id:'n2',date:daysAgo(0),text:'Prueba completada, muy satisfecha.'}],
    tasks:[{id:'t2',type:'Enviar propuesta',desc:'Cotización final con seguro incluido',dueDate:daysAgo(0),dueTime:'15:00',done:false,reminderMin:30,notified:false}],
  },
  { id:'3', ownerId:'u3', name:'Andrés Ospina',     phone:'3204567890', email:'aospina@email.com',  vehicle:'Renault Duster 2024',    budget:'$75.000.000',  payment:'Leasing',   origin:'Web',            stageId:'propuesta',   lastContact:daysAgo(3),
    pipelineHistory:[{from:null,to:'lead',date:hoursAgo(300),note:'Lead web'},{from:'lead',to:'contactado',date:hoursAgo(250),note:'Llamada'},{from:'contactado',to:'seguimiento',date:hoursAgo(180),note:'Reunión'},{from:'seguimiento',to:'prueba',date:hoursAgo(120),note:'Prueba OK'},{from:'prueba',to:'propuesta',date:hoursAgo(72),note:'Propuesta enviada'}],
    notes:[{id:'n3',date:daysAgo(3),text:'Propuesta leasing enviada.'}], tasks:[],
  },
  { id:'4', ownerId:'u2', name:'Lucía Ramírez',     phone:'3152223333', email:'lucia@email.com',    vehicle:'Chevrolet Tracker 2024', budget:'$88.000.000',  payment:'Crédito',   origin:'Redes sociales', stageId:'lead',        lastContact:daysAgo(5),
    pipelineHistory:[{from:null,to:'lead',date:hoursAgo(130),note:'Lead Instagram'}],
    notes:[], tasks:[{id:'t3',type:'Llamar',desc:'Primer contacto, presentar oferta',dueDate:daysAgo(-1),dueTime:'09:00',done:false,reminderMin:60,notified:false}],
  },
  { id:'5', ownerId:'u3', name:'Miguel Ángel Ríos', phone:'3017778888', email:'mrios@email.com',    vehicle:'Nissan Kicks 2023',      budget:'$82.000.000',  payment:'Contado',   origin:'Llamada',        stageId:'contactado',  lastContact:daysAgo(2),
    pipelineHistory:[{from:null,to:'lead',date:hoursAgo(90),note:'Llamada entrante'},{from:'lead',to:'contactado',date:hoursAgo(48),note:'Calificación exitosa'}],
    notes:[{id:'n4',date:daysAgo(2),text:'Quiere conocer el showroom.'}], tasks:[],
  },
  { id:'6', ownerId:'u2', name:'Sofía Gutiérrez',   phone:'3135556677', email:'sofia.g@email.com',  vehicle:'Kia Sportage 2024',      budget:'$105.000.000', payment:'Crédito',   origin:'Referido',       stageId:'credito',     lastContact:daysAgo(1),
    pipelineHistory:[{from:null,to:'lead',date:hoursAgo(400),note:'Referido'},{from:'lead',to:'contactado',date:hoursAgo(360),note:'WhatsApp'},{from:'contactado',to:'seguimiento',date:hoursAgo(300),note:'Reunión'},{from:'seguimiento',to:'prueba',date:hoursAgo(200),note:'Prueba OK'},{from:'prueba',to:'propuesta',date:hoursAgo(120),note:'Propuesta aceptada'},{from:'propuesta',to:'credito',date:hoursAgo(48),note:'Docs al banco'}],
    notes:[{id:'n5',date:daysAgo(1),text:'Banco confirmó preaprobación.'}],
    tasks:[{id:'t4',type:'Seguimiento',desc:'Llamar al banco por respuesta',dueDate:daysAgo(0),dueTime:'11:30',done:false,reminderMin:30,notified:false}],
  },
  { id:'7', ownerId:'u2', name:'Jorge Hernández',   phone:'3184442211', email:'jorge.h@email.com',  vehicle:'Ford Ranger 2023',       budget:'$140.000.000', payment:'Contado',   origin:'Showroom',       stageId:'cerrado',     lastContact:daysAgo(0),
    pipelineHistory:[{from:null,to:'lead',date:hoursAgo(600),note:'Showroom'},{from:'lead',to:'contactado',date:hoursAgo(560),note:'Contacto'},{from:'contactado',to:'seguimiento',date:hoursAgo(480),note:'2da visita'},{from:'seguimiento',to:'prueba',date:hoursAgo(400),note:'Prueba'},{from:'prueba',to:'propuesta',date:hoursAgo(300),note:'Propuesta'},{from:'propuesta',to:'cerrado',date:hoursAgo(2),note:'¡Venta cerrada! 🎉'}],
    notes:[{id:'n6',date:daysAgo(0),text:'¡Entrega el lunes!'}],
    tasks:[{id:'t5',type:'Visita showroom',desc:'Entrega del vehículo',dueDate:daysAgo(-3),dueTime:'10:00',done:false,reminderMin:60,notified:false}],
  },
  { id:'8', ownerId:'u3', name:'Diana Castro',      phone:'3111009988', email:'diana.c@email.com',  vehicle:'Renault Kwid 2023',      budget:'$52.000.000',  payment:'Leasing',   origin:'Web',            stageId:'perdido',     lastContact:daysAgo(7),
    pipelineHistory:[{from:null,to:'lead',date:hoursAgo(500),note:'Web'},{from:'lead',to:'contactado',date:hoursAgo(460),note:'Email'},{from:'contactado',to:'seguimiento',date:hoursAgo(400),note:'Reunión virtual'},{from:'seguimiento',to:'perdido',date:hoursAgo(170),note:'Compró con otra concesionaria'}],
    notes:[{id:'n7',date:daysAgo(7),text:'Se fue con la competencia.'}], tasks:[],
  },
];
