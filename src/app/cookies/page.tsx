import { clinic } from "@/config/clinic"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: `Información sobre el uso de cookies en el sitio web de ${clinic.name}`,
}

export default function CookiesPage() {
  return (
    <div className="pt-24">
      <section className="section-padding bg-neutral">
        <div className="container-narrow">
          <h1 className="text-4xl font-display font-bold text-secondary mb-6">
            Política de Cookies
          </h1>
          <p className="text-secondary/70">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-narrow prose prose-lg max-w-none">
          <h2>1. ¿Qué son las Cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador,
            tablet, smartphone) cuando visita un sitio web. Las cookies permiten que el sitio web
            recuerde sus acciones y preferencias durante un período de tiempo, para que no tenga que
            volver a introducirlas cada vez que visite el sitio o navegue de una página a otra.
          </p>

          <h2>2. ¿Qué Tipos de Cookies Utilizamos?</h2>

          <h3>Cookies Técnicas (Necesarias)</h3>
          <p>
            Son aquellas que permiten al usuario la navegación a través de una página web, plataforma
            o aplicación y la utilización de las diferentes opciones o servicios que en ella existan.
          </p>

          <h3>Cookies de Análisis</h3>
          <p>
            Son aquellas que permiten al responsable de las mismas el seguimiento y análisis del
            comportamiento de los usuarios de los sitios web a los que están vinculadas. La
            información recogida mediante este tipo de cookies se utiliza en la medición de la
            actividad de los sitios web, aplicación o plataforma y para la elaboración de perfiles
            de navegación de los usuarios.
          </p>

          <h3>Cookies de Preferencias o Personalización</h3>
          <p>
            Son aquellas que permiten recordar información para que el usuario acceda al servicio
            con determinadas características que pueden diferenciar su experiencia de la de otros
            usuarios.
          </p>

          <h2>3. Listado de Cookies Utilizadas</h2>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Proveedor</th>
                <th>Finalidad</th>
                <th>Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>_ga</td>
                <td>Google Analytics</td>
                <td>Se usa para distinguir a los usuarios</td>
                <td>2 años</td>
              </tr>
              <tr>
                <td>_gid</td>
                <td>Google Analytics</td>
                <td>Se usa para distinguir a los usuarios</td>
                <td>24 horas</td>
              </tr>
              <tr>
                <td>_gat</td>
                <td>Google Analytics</td>
                <td>Se usa para limitar el porcentaje de solicitudes</td>
                <td>1 minuto</td>
              </tr>
            </tbody>
          </table>

          <h2>4. ¿Cómo Gestionar las Cookies?</h2>
          <p>
            Puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la
            configuración de las opciones del navegador instalado en su ordenador.
          </p>
          <ul>
            <li>
              <a href="https://support.google.com/chrome/answer/95647?hl=es" target="_blank" rel="noopener noreferrer">
                Google Chrome
              </a>
            </li>
            <li>
              <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
                Safari
              </a>
            </li>
            <li>
              <a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">
                Microsoft Edge
              </a>
            </li>
          </ul>

          <h2>5. Consentimiento</h2>
          <p>
            Al navegar y continuar en nuestro sitio web, estará consintiendo el uso de las cookies
            en las condiciones contenidas en la presente política de cookies, sin perjuicio de las
            medidas de desactivación y eliminación de las mismas que pueda adoptar.
          </p>

          <h2>6. Cambios en la Política de Cookies</h2>
          <p>
            Es posible que actualicemos la Política de Cookies de nuestro sitio web. Por ello, le
            recomendamos revisar esta política cada vez que acceda a nuestro sitio web con el
            objetivo de estar adecuadamente informado sobre cómo y para qué usamos las cookies.
          </p>

          <h2>7. Contacto</h2>
          <p>
            Si tiene alguna duda sobre esta Política de Cookies, puede contactar con nosotros en:
          </p>
          <ul>
            {clinic.email && <li><strong>Email:</strong> {clinic.email}</li>}
            <li><strong>Teléfono:</strong> {clinic.phone}</li>
            <li><strong>Dirección:</strong> {clinic.address.street}, {clinic.address.postalCode} {clinic.address.city}</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
