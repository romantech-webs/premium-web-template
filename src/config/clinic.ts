export const clinic = {
  // === IDENTIDAD ===
  name: "FisioAtlon",
  tagline: "Clínica de Fisioterapia NeuroDeportiva en Badajoz",
  description: "FisioAtlon es una clínica especializada en fisioterapia deportiva y neurológica en Badajoz. Tratamientos personalizados con las últimas tecnologías para deportistas y pacientes neurológicos.",

  // === PALETA ===
  colors: {
    primary: "#3A9B8C",      // Teal/azul verdoso del círculo del logo
    secondary: "#1f2937",    // Gris oscuro para texto
    accent: "#E87839",       // Naranja de la figura corriendo
    neutral: "#f8fafc",      // Fondo claro
  },

  // === CONTACTO ===
  phone: "605 43 58 00",
  whatsapp: "+34605435800",
  whatsappMessage: "Hola, me gustaría solicitar información sobre vuestros servicios de fisioterapia.",
  email: "Info@clinicafisioatlon.es",

  // === UBICACIÓN ===
  address: {
    street: "Argüello Carvajal Teólogo Siglo XVII, 28A",
    city: "Badajoz",
    province: "Badajoz",
    postalCode: "06007",
    country: "España",
  },
  googleMapsUrl: "https://maps.google.com/?q=Arguello+Carvajal+Teologo+Siglo+XVII+28A+Badajoz",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3144.5!2d-6.9794!3d38.8886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDUzJzE5LjAiTiA2wrA1OCc0NS44Ilc!5e0!3m2!1ses!2ses!4v1",
  coordinates: { lat: 38.8886, lng: -6.9794 },

  // === HORARIOS ===
  schedule: [
    { days: "Lunes - Viernes", hours: "9:00 - 14:00 y 16:00 - 21:00" },
    { days: "Sábado", hours: "Cerrado" },
    { days: "Domingo", hours: "Cerrado" },
  ],

  // === REDES SOCIALES ===
  social: {
    instagram: "https://www.instagram.com/fisioatlon_dr.antoniolopez/",
    facebook: "https://www.facebook.com/fisioatlon/?locale=es_ES",
    linkedin: null as string | null,
    tiktok: null as string | null,
  },

  // === RESEÑAS GOOGLE ===
  reviews: {
    rating: 5.0,
    count: 89,
    url: "#",
    featured: [
      {
        author: "Pablo M.",
        rating: 5,
        text: "Excelente profesional. Antonio me ayudó a recuperarme de una lesión de rodilla y volver a correr en tiempo récord.",
        date: "hace 1 mes",
      },
      {
        author: "Laura S.",
        rating: 5,
        text: "Muy recomendable para cualquier deportista. Tratamiento personalizado y con las últimas tecnologías.",
        date: "hace 2 meses",
      },
      {
        author: "Javier R.",
        rating: 5,
        text: "Gran experiencia en fisioterapia neurológica. Mi padre ha mejorado muchísimo después del ictus gracias a Antonio.",
        date: "hace 3 meses",
      },
    ],
  },

  // === SERVICIOS ===
  services: [
    {
      id: "fisioterapia-deportiva",
      name: "Fisioterapia Deportiva",
      description: "Tratamiento especializado en lesiones deportivas, readaptación al ejercicio y prevención de lesiones para atletas de todos los niveles.",
      benefits: ["Recuperación de lesiones", "Mejora del rendimiento", "Prevención de recaídas"],
      icon: "Dumbbell",
    },
    {
      id: "fisioterapia-neurologica",
      name: "Fisioterapia Neurológica",
      description: "Rehabilitación especializada para pacientes con ictus, Parkinson, esclerosis múltiple y otras patologías neurológicas.",
      benefits: ["Recuperación funcional", "Mejora de la movilidad", "Autonomía personal"],
      icon: "Brain",
    },
    {
      id: "rehabilitacion-deportiva",
      name: "Rehabilitación Deportiva",
      description: "Programas completos de recuperación post-lesión y readaptación para la vuelta segura a la actividad deportiva.",
      benefits: ["Vuelta al deporte segura", "Fortalecimiento muscular", "Readaptación progresiva"],
      icon: "Activity",
    },
    {
      id: "puncion-seca",
      name: "Punción Seca",
      description: "Técnica invasiva mínima para el tratamiento de puntos gatillo miofasciales y dolor muscular crónico.",
      benefits: ["Alivio del dolor", "Liberación muscular", "Mejora de la movilidad"],
      icon: "Target",
    },
    {
      id: "electroterapia",
      name: "Electroterapia y Nuevas Tecnologías",
      description: "Tratamientos con TENS, ultrasonidos, láser terapéutico y otras tecnologías avanzadas para acelerar la recuperación.",
      benefits: ["Reducción del dolor", "Aceleración de la curación", "Tecnología de vanguardia"],
      icon: "Zap",
    },
    {
      id: "terapia-manual",
      name: "Terapia Manual",
      description: "Masaje terapéutico, movilizaciones articulares y técnicas de estiramiento para restaurar la función y aliviar el dolor.",
      benefits: ["Relajación muscular", "Mejora articular", "Alivio de tensiones"],
      icon: "Hand",
    },
    {
      id: "vendaje-neuromuscular",
      name: "Vendaje Neuromuscular",
      description: "Aplicación de kinesiotaping para facilitar la recuperación, reducir la inflamación y mejorar el rendimiento.",
      benefits: ["Soporte muscular", "Reducción de edema", "Mejora propioceptiva"],
      icon: "Ribbon",
    },
    {
      id: "readaptacion-funcional",
      name: "Readaptación Funcional",
      description: "Ejercicio terapéutico personalizado para recuperar la funcionalidad completa tras lesiones o cirugías.",
      benefits: ["Ejercicio personalizado", "Recuperación completa", "Prevención de lesiones"],
      icon: "TrendingUp",
    },
  ],

  // === PROCESO ===
  process: [
    {
      step: 1,
      title: "Contacta",
      description: "Solicita tu cita de valoración inicial por teléfono o WhatsApp",
    },
    {
      step: 2,
      title: "Evaluación",
      description: "Realizamos una valoración completa para identificar la causa de tu problema",
    },
    {
      step: 3,
      title: "Plan de Tratamiento",
      description: "Diseñamos un programa de rehabilitación personalizado según tus objetivos",
    },
    {
      step: 4,
      title: "Recuperación",
      description: "Sesiones de fisioterapia con seguimiento continuo hasta tu recuperación total",
    },
  ],

  // === POR QUÉ ELEGIRNOS ===
  whyUs: [
    {
      title: "Especialista NeuroDeportivo",
      description: "Formación especializada en fisioterapia deportiva y neurológica con años de experiencia",
      icon: "GraduationCap",
    },
    {
      title: "Tecnología Avanzada",
      description: "Equipamiento de última generación para tratamientos más efectivos y recuperaciones más rápidas",
      icon: "Cpu",
    },
    {
      title: "Atención Personalizada",
      description: "Cada paciente recibe un plan de tratamiento único adaptado a sus objetivos y necesidades",
      icon: "UserCheck",
    },
    {
      title: "Valoración 5 Estrellas",
      description: "89 pacientes nos avalan con la máxima puntuación en Google",
      icon: "Star",
    },
  ],

  // === EQUIPO ===
  team: [
    {
      name: "Antonio López",
      role: "Fisioterapeuta NeuroDeportivo",
      image: "/images/team/antonio.jpg",
      bio: "Especialista en fisioterapia deportiva y neurológica. Apasionado por ayudar a deportistas y pacientes neurológicos a recuperar su máximo potencial.",
    },
  ],

  // === GALERÍA ===
  gallery: [
    { src: "/images/gallery/1.webp", alt: "Interior de la clínica FisioAtlon - Sala de tratamiento" },
    { src: "/images/gallery/2.webp", alt: "Recepción de la clínica FisioAtlon" },
  ],

  // === FAQ ===
  faq: [
    {
      question: "¿Qué diferencia hay entre fisioterapia deportiva y neurológica?",
      answer: "La fisioterapia deportiva se centra en lesiones relacionadas con la actividad física y el deporte, mientras que la neurológica trata patologías del sistema nervioso como ictus, Parkinson o esclerosis múltiple. En FisioAtlon somos especialistas en ambas áreas.",
    },
    {
      question: "¿Cuántas sesiones necesitaré para recuperarme?",
      answer: "El número de sesiones depende de cada caso. Tras la evaluación inicial, establecemos un plan de tratamiento con objetivos claros y hacemos revisiones periódicas para valorar el progreso.",
    },
    {
      question: "¿Atendéis lesiones deportivas de cualquier nivel?",
      answer: "Sí, tratamos desde deportistas amateur hasta profesionales. Cada plan se adapta a tus objetivos, ya sea volver a correr por ocio o competir al más alto nivel.",
    },
    {
      question: "¿Qué es la punción seca y duele?",
      answer: "La punción seca es una técnica que utiliza agujas finas para desactivar puntos gatillo musculares. Puede causar una molestia momentánea, pero es muy efectiva para aliviar el dolor muscular crónico.",
    },
    {
      question: "¿Trabajáis con equipos deportivos?",
      answer: "Sí, ofrecemos servicios de fisioterapia para equipos deportivos, incluyendo prevención de lesiones, tratamiento en competición y programas de readaptación.",
    },
    {
      question: "¿Cuánto dura una sesión de fisioterapia?",
      answer: "Las sesiones tienen una duración aproximada de 45-60 minutos, dependiendo del tratamiento necesario y la evolución del paciente.",
    },
    {
      question: "¿Necesito prescripción médica para acudir?",
      answer: "No es necesaria prescripción médica. Puedes contactarnos directamente para solicitar una valoración inicial y comenzar tu tratamiento.",
    },
    {
      question: "¿Trabajáis con seguros o mutuas?",
      answer: "Trabajamos de forma privada. Te proporcionamos factura para que puedas presentarla a tu seguro si este cubre servicios de fisioterapia.",
    },
  ],

  // === SEO ===
  seo: {
    titleTemplate: "%s | FisioAtlon - Fisioterapia NeuroDeportiva Badajoz",
    defaultTitle: "FisioAtlon | Clínica de Fisioterapia NeuroDeportiva en Badajoz",
    defaultDescription: "Clínica de fisioterapia deportiva y neurológica en Badajoz. Especialistas en lesiones deportivas, rehabilitación neurológica, punción seca y nuevas tecnologías. Antonio López, fisioterapeuta.",
    keywords: [
      "fisioterapeuta Badajoz",
      "fisioterapia deportiva Badajoz",
      "fisioterapia neurológica Badajoz",
      "rehabilitación deportiva Badajoz",
      "punción seca Badajoz",
      "lesiones deportivas",
      "ictus rehabilitación",
      "Parkinson fisioterapia",
      "kinesiotaping Badajoz",
      "electroterapia Badajoz",
      "FisioAtlon",
      "Antonio López fisioterapeuta",
    ],
    ogImage: "/og-image.jpg",
  },

  // === LEGAL ===
  legal: {
    companyName: "FisioAtlon - Clínica de Fisioterapia NeuroDeportiva",
    cif: "",
    registeredAddress: "Argüello Carvajal Teólogo Siglo XVII, 28A, 06007 Badajoz",
  },
}

export type Clinic = typeof clinic
