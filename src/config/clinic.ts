export const clinic = {
  // === IDENTIDAD ===
  name: "Centro Estética CyM",
  logo: "/images/logo.jpg" as string | null,
  tagline: "Tu Centro de Belleza en Puertollano",
  description: "Centro Estética CyM es un centro de belleza integral en Puertollano especializado en micropigmentación, microblading, depilación láser y tratamientos faciales. Profesionales cualificados para realzar tu belleza natural.",

  // === PALETA (Elegante/Spa) ===
  colors: {
    primary: "#C9A86C",      // Dorado elegante
    secondary: "#2D2D2D",    // Gris sofisticado
    accent: "#D4A574",       // Rosa champán
    neutral: "#FAF8F5",      // Crema cálido
  },

  // === CONTACTO ===
  phone: "629 61 04 71",
  whatsapp: "+34629610471",
  whatsappMessage: "Hola, me gustaría solicitar información sobre vuestros tratamientos de estética.",
  email: "info@esteticacym.es",

  // === UBICACIÓN ===
  address: {
    street: "C. Numancia, 40",
    city: "Puertollano",
    province: "Ciudad Real",
    postalCode: "13500",
    country: "España",
  },
  googleMapsUrl: "https://maps.google.com/?q=C.+Numancia+40+Puertollano",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3144.5!2d-4.1078!3d38.6872!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6d1f1a8a8a8a8a%3A0x0!2sC.+Numancia%2C+40%2C+13500+Puertollano!5e0!3m2!1ses!2ses!4v1",
  coordinates: { lat: 38.6872, lng: -4.1078 },

  // === HORARIOS ===
  schedule: [
    { days: "Lunes - Viernes", hours: "10:00 - 20:00" },
    { days: "Sábado", hours: "Cerrado" },
    { days: "Domingo", hours: "Cerrado" },
  ],

  // === REDES SOCIALES ===
  social: {
    instagram: "https://www.instagram.com/centrodeesteticacym/",
    facebook: "https://www.facebook.com/centrodeesteticacym/",
    linkedin: null as string | null,
    tiktok: null as string | null,
  },

  // === RESEÑAS GOOGLE ===
  reviews: {
    rating: 4.7,
    count: 190,
    url: "#",
    featured: [
      {
        author: "Eva León",
        rating: 5,
        text: "Increíble trabajo de micropigmentación. El resultado es muy natural y el trato inmejorable. Sin duda volveré para más tratamientos.",
        date: "hace 2 semanas",
      },
      {
        author: "Javier Padilla",
        rating: 5,
        text: "Excelente profesionalidad en todos los tratamientos. Las instalaciones son muy modernas y el ambiente muy relajante.",
        date: "hace 1 mes",
      },
      {
        author: "Melanie Ponce",
        rating: 5,
        text: "Me encantó el resultado del microblading. Quedé muy satisfecha con el trabajo realizado. Muy recomendable.",
        date: "hace 1 mes",
      },
      {
        author: "María Teresa Salguero",
        rating: 5,
        text: "El mejor centro de estética de Puertollano. Tratamientos de calidad y atención personalizada. Volveré seguro.",
        date: "hace 2 meses",
      },
    ],
  },

  // === SERVICIOS ===
  services: [
    {
      id: "micropigmentacion",
      name: "Micropigmentación",
      description: "Técnica avanzada de maquillaje semipermanente para cejas, labios y ojos. Resultados naturales y duraderos que realzan tu belleza.",
      benefits: ["Resultados naturales", "Larga duración", "Mínimo mantenimiento"],
      icon: "Sparkles",
    },
    {
      id: "microblading",
      name: "Microblading de Cejas",
      description: "Técnica pelo a pelo para cejas perfectamente definidas. Efecto hiperrealista que simula el vello natural.",
      benefits: ["Efecto pelo a pelo", "Cejas definidas", "Aspecto natural"],
      icon: "Feather",
    },
    {
      id: "depilacion-laser",
      name: "Depilación Láser",
      description: "Eliminación definitiva del vello con tecnología láser de última generación. Tratamientos seguros y efectivos.",
      benefits: ["Resultados permanentes", "Sin dolor", "Piel suave"],
      icon: "Zap",
    },
    {
      id: "tratamientos-faciales",
      name: "Tratamientos Faciales",
      description: "Cuidados personalizados para cada tipo de piel. Hidratación profunda, antiedad y luminosidad para un rostro radiante.",
      benefits: ["Piel rejuvenecida", "Hidratación profunda", "Luminosidad"],
      icon: "Flower2",
    },
    {
      id: "tratamientos-corporales",
      name: "Tratamientos Corporales",
      description: "Tratamientos reductores, reafirmantes y anticelulíticos. Moldea tu silueta con las técnicas más avanzadas.",
      benefits: ["Reduce centímetros", "Reafirma la piel", "Elimina celulitis"],
      icon: "Heart",
    },
    {
      id: "manicura-pedicura",
      name: "Manicura y Pedicura",
      description: "Cuidado completo de manos y pies con esmaltes de alta calidad. Uñas perfectas con diseños personalizados.",
      benefits: ["Uñas perfectas", "Manos cuidadas", "Diseños exclusivos"],
      icon: "Hand",
    },
    {
      id: "extensiones-pestanas",
      name: "Extensiones de Pestañas",
      description: "Mirada impactante con extensiones de pestañas pelo a pelo. Efecto natural o dramático según tu preferencia.",
      benefits: ["Mirada intensa", "Efecto natural", "Sin máscara"],
      icon: "Eye",
    },
    {
      id: "maquillaje-profesional",
      name: "Maquillaje Profesional",
      description: "Maquillaje para eventos especiales, novias y sesiones fotográficas. Realza tu belleza para cada ocasión.",
      benefits: ["Look personalizado", "Alta duración", "Acabado profesional"],
      icon: "Palette",
    },
  ],

  // === PROCESO ===
  process: [
    {
      step: 1,
      title: "Contacta",
      description: "Solicita tu cita de consulta inicial por teléfono o WhatsApp",
    },
    {
      step: 2,
      title: "Consulta",
      description: "Analizamos tus necesidades y diseñamos el tratamiento ideal para ti",
    },
    {
      step: 3,
      title: "Tratamiento",
      description: "Realizamos el tratamiento con las técnicas más avanzadas y productos de calidad",
    },
    {
      step: 4,
      title: "Resultados",
      description: "Disfruta de resultados espectaculares y un seguimiento personalizado",
    },
  ],

  // === POR QUÉ ELEGIRNOS ===
  whyUs: [
    {
      title: "Especialistas en Micropigmentación",
      description: "Técnicas avanzadas de micropigmentación y microblading con resultados naturales y duraderos",
      icon: "Award",
    },
    {
      title: "Tecnología de Vanguardia",
      description: "Equipos de última generación para tratamientos más efectivos y seguros",
      icon: "Cpu",
    },
    {
      title: "Atención Personalizada",
      description: "Cada clienta recibe un tratamiento único adaptado a sus necesidades y deseos",
      icon: "UserCheck",
    },
    {
      title: "Valoración 4.7 Estrellas",
      description: "190 clientas satisfechas nos avalan con excelentes valoraciones en Google",
      icon: "Star",
    },
  ],

  // === EQUIPO ===
  team: [
    {
      name: "Centro Estética CyM",
      role: "Especialistas en Micropigmentación",
      image: "/images/team/placeholder.jpg",
      bio: "Profesionales apasionadas por la belleza y el cuidado personal. Con años de experiencia en micropigmentación, microblading y tratamientos estéticos, nos dedicamos a realzar la belleza natural de cada clienta.",
    },
  ],

  // === GALERÍA ===
  gallery: [
    { src: "/images/gallery/local-fuera.webp", alt: "Fachada del Centro Estética CyM" },
    { src: "/images/gallery/local-dentro.webp", alt: "Interior del centro - Recepción" },
    { src: "/images/gallery/clinica-dentro1.webp", alt: "Sala de tratamientos" },
  ],

  // === FAQ ===
  faq: [
    {
      question: "¿Cuánto dura la micropigmentación?",
      answer: "La micropigmentación puede durar entre 1 y 3 años dependiendo del tipo de piel, cuidados posteriores y la zona tratada. Ofrecemos retoques para mantener el resultado óptimo.",
    },
    {
      question: "¿Es doloroso el microblading de cejas?",
      answer: "El procedimiento es prácticamente indoloro gracias a la aplicación de crema anestésica tópica. La mayoría de clientas describen la sensación como un ligero cosquilleo.",
    },
    {
      question: "¿Cuántas sesiones necesito para la depilación láser?",
      answer: "Generalmente se necesitan entre 6 y 8 sesiones espaciadas cada 4-6 semanas para obtener resultados óptimos. El número exacto depende del tipo de piel y vello.",
    },
    {
      question: "¿Qué cuidados necesito después de un tratamiento facial?",
      answer: "Recomendamos evitar el sol directo, usar protección solar SPF50 y seguir la rutina de cuidados que te indicamos según tu tipo de piel.",
    },
    {
      question: "¿Ofrecéis tratamientos para novias?",
      answer: "Sí, tenemos packs especiales para novias que incluyen tratamientos faciales, maquillaje de prueba y el día de la boda, manicura y más.",
    },
    {
      question: "¿Las extensiones de pestañas dañan mis pestañas naturales?",
      answer: "No, cuando se aplican correctamente por profesionales cualificados, las extensiones no dañan las pestañas naturales. Usamos adhesivos de alta calidad y técnicas seguras.",
    },
    {
      question: "¿Cuánto dura una sesión de tratamiento facial?",
      answer: "Dependiendo del tratamiento, las sesiones duran entre 45 y 90 minutos. Incluimos tiempo para la consulta inicial y recomendaciones personalizadas.",
    },
    {
      question: "¿Necesito cita previa?",
      answer: "Sí, recomendamos siempre reservar cita previa para garantizar la disponibilidad y poder dedicarte el tiempo que mereces. Puedes reservar por teléfono o WhatsApp.",
    },
  ],

  // === SEO ===
  seo: {
    titleTemplate: "%s | Centro Estética CyM - Belleza en Puertollano",
    defaultTitle: "Centro Estética CyM | Tu Centro de Belleza en Puertollano",
    defaultDescription: "Centro de estética en Puertollano especializado en micropigmentación, microblading, depilación láser y tratamientos faciales. Profesionales cualificados. Cita previa: 629 61 04 71.",
    keywords: [
      "centro estética Puertollano",
      "micropigmentación Puertollano",
      "microblading cejas Puertollano",
      "depilación láser Puertollano",
      "tratamientos faciales Puertollano",
      "extensiones pestañas Puertollano",
      "maquillaje profesional",
      "manicura pedicura",
      "tratamientos corporales",
      "belleza Puertollano",
      "Centro Estética CyM",
      "estética Ciudad Real",
    ],
    ogImage: "/og-image.jpg",
  },

  // === LEGAL ===
  legal: {
    companyName: "Centro Estética CyM",
    cif: "",
    registeredAddress: "C. Numancia, 40, 13500 Puertollano, Ciudad Real",
  },

  // === UI COPY (driven by clinic type) ===
  heroHeadline: ["Tu Centro de", "Belleza", "en Puertollano"],
  heroDescription: "Realza tu belleza natural con tratamientos de micropigmentación, microblading y estética avanzada. Profesionales cualificadas y tecnología de vanguardia.",
  specialty: "Micropigmentación",
  ctaLabel: "Realza tu Belleza",
  ctaHeadline: "¿Lista para brillar?",
  ctaDescription: "Da el primer paso hacia tu mejor versión. Pide tu cita ahora y nuestro equipo te asesorará de forma personalizada.",
  statsLabel: "Clientas",
  schemaType: "BeautySalon",
  sectionCopy: {
    servicesLabel: "Nuestros Servicios",
    servicesTitle: "Tratamientos especializados",
    servicesDescription: "Técnicas avanzadas de estética y belleza para realzar tu imagen y cuidar de ti.",
    processLabel: "Cómo Trabajamos",
    processTitle: "Tu camino hacia la belleza en 4 pasos",
    processDescription: "Un proceso simple y transparente diseñado para tu comodidad.",
    whyUsLabel: "Por Qué Elegirnos",
    whyUsTitle: "Tu belleza, nuestra pasión",
    whyUsDescription: "Combinamos experiencia, las mejores técnicas y un trato personalizado para realzar tu belleza natural.",
    reviewsLabel: "Opiniones",
    reviewsTitle: "Lo que dicen nuestras clientas",
    galleryLabel: "Instalaciones",
    galleryTitle: "Conoce nuestro centro",
    galleryDescription: "Un espacio diseñado para tu bienestar y relajación",
    faqLabel: "FAQ",
    faqTitle: "Preguntas frecuentes",
    faqDescription: "Resolvemos las dudas más comunes de nuestras clientas.",
    locationLabel: "Ubicación",
    locationTitle: "Cómo llegar",
    teamLabel: "Nuestro Equipo",
    teamTitle: "Profesionales especializadas",
    teamDescription: "Experiencia y pasión al servicio de tu belleza",
  },
}

export type Clinic = typeof clinic
