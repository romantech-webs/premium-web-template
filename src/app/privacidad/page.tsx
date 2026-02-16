import { clinic } from "@/config/clinic"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: `Política de privacidad y protección de datos de ${clinic.name}`,
}

export default function PrivacidadPage() {
  return (
    <div className="pt-24">
      <section className="section-padding bg-neutral">
        <div className="container-narrow">
          <h1 className="text-4xl font-display font-bold text-secondary mb-6">
            Política de Privacidad
          </h1>
          <p className="text-secondary/70">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-narrow prose prose-lg max-w-none">
          <h2>1. Responsable del Tratamiento</h2>
          <ul>
            <li><strong>Identidad:</strong> {clinic.legal.companyName}</li>
            <li><strong>CIF:</strong> {clinic.legal.cif}</li>
            <li><strong>Dirección:</strong> {clinic.legal.registeredAddress}</li>
            {clinic.email && <li><strong>Email:</strong> {clinic.email}</li>}
            <li><strong>Teléfono:</strong> {clinic.phone}</li>
          </ul>

          <h2>2. Finalidad del Tratamiento</h2>
          <p>En {clinic.name} tratamos la información que nos facilitan los interesados con los siguientes fines:</p>
          <ul>
            <li>Gestionar las solicitudes de información y consultas realizadas a través del formulario de contacto.</li>
            <li>Gestionar las citas y servicios solicitados.</li>
            <li>Enviar comunicaciones comerciales sobre nuestros servicios, siempre que el usuario haya dado su consentimiento.</li>
            <li>Cumplir con las obligaciones legales que nos correspondan.</li>
          </ul>

          <h2>3. Legitimación</h2>
          <p>La base legal para el tratamiento de sus datos es:</p>
          <ul>
            <li>El consentimiento del interesado para el tratamiento de sus datos personales.</li>
            <li>La ejecución de un contrato o la aplicación de medidas precontractuales.</li>
            <li>El cumplimiento de obligaciones legales aplicables al responsable del tratamiento.</li>
            <li>El interés legítimo del responsable del tratamiento.</li>
          </ul>

          <h2>4. Conservación de los Datos</h2>
          <p>
            Los datos personales proporcionados se conservarán durante el tiempo necesario para
            cumplir con la finalidad para la que se recabaron y para determinar las posibles
            responsabilidades que se pudieran derivar de dicha finalidad y del tratamiento de los datos.
          </p>

          <h2>5. Destinatarios</h2>
          <p>
            Los datos no se comunicarán a terceros salvo obligación legal o cuando sea necesario
            para la prestación del servicio solicitado.
          </p>

          <h2>6. Derechos de los Interesados</h2>
          <p>Cualquier persona tiene derecho a:</p>
          <ul>
            <li><strong>Acceso:</strong> Solicitar información sobre sus datos personales incluidos en nuestros ficheros.</li>
            <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos.</li>
            <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos cuando, entre otros motivos, ya no sean necesarios para los fines para los que fueron recogidos.</li>
            <li><strong>Oposición:</strong> Solicitar que no se traten sus datos personales.</li>
            <li><strong>Limitación del tratamiento:</strong> Solicitar la limitación del tratamiento de sus datos.</li>
            <li><strong>Portabilidad:</strong> Recibir los datos personales en un formato estructurado, de uso común y lectura mecánica, y poder transmitirlos a otro responsable.</li>
          </ul>
          <p>
            Para ejercer estos derechos, puede dirigirse a {clinic.email || clinic.phone} adjuntando una copia de su
            DNI o documento identificativo equivalente.
          </p>
          <p>
            Si considera que el tratamiento no se ajusta a la normativa vigente, puede presentar una
            reclamación ante la autoridad de control (Agencia Española de Protección de Datos:
            {" "}<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>).
          </p>

          <h2>7. Medidas de Seguridad</h2>
          <p>
            {clinic.name} ha adoptado todas las medidas técnicas y organizativas necesarias para
            garantizar la seguridad e integridad de los datos de carácter personal que trate, así
            como para evitar su pérdida, alteración y/o acceso por parte de terceros no autorizados.
          </p>

          <h2>8. Datos de Menores</h2>
          <p>
            Nuestros servicios no están dirigidos a menores de 14 años. Si eres menor de 14 años,
            necesitarás el consentimiento de tus padres o tutores legales para el tratamiento de
            tus datos personales.
          </p>

          <h2>9. Modificaciones</h2>
          <p>
            {clinic.name} se reserva el derecho a modificar la presente política para adaptarla a
            novedades legislativas o jurisprudenciales, así como a prácticas de la industria. En
            dichos supuestos, anunciará en esta página los cambios introducidos con razonable antelación.
          </p>
        </div>
      </section>
    </div>
  )
}
