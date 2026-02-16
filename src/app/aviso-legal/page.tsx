import { clinic } from "@/config/clinic"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aviso Legal",
  description: `Aviso legal y condiciones de uso del sitio web de ${clinic.name}`,
}

export default function AvisoLegalPage() {
  return (
    <div className="pt-24">
      <section className="section-padding bg-neutral">
        <div className="container-narrow">
          <h1 className="text-4xl font-display font-bold text-secondary mb-6">
            Aviso Legal
          </h1>
          <p className="text-secondary/70">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-narrow prose prose-lg max-w-none">
          <h2>1. Datos Identificativos</h2>
          <p>
            En cumplimiento del deber de información recogido en el artículo 10 de la Ley 34/2002,
            de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico,
            a continuación se reflejan los siguientes datos:
          </p>
          <ul>
            <li><strong>Titular:</strong> {clinic.legal.companyName}</li>
            <li><strong>CIF:</strong> {clinic.legal.cif}</li>
            <li><strong>Domicilio:</strong> {clinic.legal.registeredAddress}</li>
            {clinic.email && <li><strong>Email:</strong> {clinic.email}</li>}
            <li><strong>Teléfono:</strong> {clinic.phone}</li>
          </ul>

          <h2>2. Objeto</h2>
          <p>
            El presente aviso legal regula el uso y utilización del sitio web, del que es titular
            {" "}{clinic.legal.companyName}.
          </p>
          <p>
            La navegación por el sitio web de {clinic.name} atribuye la condición de usuario del
            mismo e implica la aceptación plena y sin reservas de todas y cada una de las
            disposiciones incluidas en este Aviso Legal.
          </p>

          <h2>3. Propiedad Intelectual e Industrial</h2>
          <p>
            El sitio web, incluyendo a título enunciativo pero no limitativo su programación,
            edición, compilación y demás elementos necesarios para su funcionamiento, los diseños,
            logotipos, texto y/o gráficos son propiedad del titular o, en su caso, dispone de
            licencia o autorización expresa por parte de los autores.
          </p>
          <p>
            Todos los contenidos del sitio web se encuentran debidamente protegidos por la
            normativa de propiedad intelectual e industrial.
          </p>
          <p>
            Independientemente de la finalidad para la que fueran destinados, la reproducción total
            o parcial, uso, explotación, distribución y comercialización, requiere en todo caso de
            la autorización escrita previa por parte del titular.
          </p>

          <h2>4. Condiciones de Acceso y Uso</h2>
          <p>
            El acceso al sitio web es gratuito salvo en lo relativo al coste de la conexión a través
            de la red de telecomunicaciones suministrada por el proveedor de acceso contratado por
            los usuarios.
          </p>
          <p>El usuario se compromete a:</p>
          <ul>
            <li>
              Hacer un uso adecuado y lícito del sitio web, de conformidad con la legislación
              aplicable, el presente Aviso Legal, y demás condiciones, reglamentos e instrucciones
              que en su caso pudieran ser de aplicación.
            </li>
            <li>
              No realizar ninguna acción que cause o pueda causar daños o alteraciones en los
              contenidos del sitio web o dificulte el buen funcionamiento del mismo.
            </li>
            <li>
              No utilizar el sitio web para transmitir, almacenar, divulgar, promover o distribuir
              datos o contenidos que sean portadores de virus o cualquier otro código informático
              con capacidad para dañar o alterar los contenidos del sitio web.
            </li>
          </ul>

          <h2>5. Exclusión de Garantías y Responsabilidad</h2>
          <p>
            El titular no se hace responsable, en ningún caso, de los daños y perjuicios de
            cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones
            en los contenidos, falta de disponibilidad del sitio web o la transmisión de virus o
            programas maliciosos en los contenidos, a pesar de haber adoptado todas las medidas
            tecnológicas necesarias para evitarlo.
          </p>

          <h2>6. Modificaciones</h2>
          <p>
            El titular se reserva el derecho de efectuar sin previo aviso las modificaciones que
            considere oportunas en su sitio web, pudiendo cambiar, suprimir o añadir tanto los
            contenidos y servicios que se presten a través de la misma como la forma en la que
            éstos aparezcan presentados o localizados en su sitio web.
          </p>

          <h2>7. Enlaces</h2>
          <p>
            En el caso de que en el sitio web se dispusiesen enlaces o hipervínculos hacía otros
            sitios de Internet, el titular no ejercerá ningún tipo de control sobre dichos sitios
            y contenidos. En ningún caso asumirá responsabilidad alguna por los contenidos de
            algún enlace perteneciente a un sitio web ajeno.
          </p>

          <h2>8. Legislación Aplicable y Jurisdicción</h2>
          <p>
            La relación entre el titular y el usuario se regirá por la normativa española vigente
            y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de
            {" "}{clinic.address.city}, salvo que la Ley aplicable disponga otra cosa.
          </p>
        </div>
      </section>
    </div>
  )
}
