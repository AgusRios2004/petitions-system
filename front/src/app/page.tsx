'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FiSearch, FiCheckCircle, FiUsers, FiClock, FiShield, FiTrendingUp, FiFileText } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 text-sm font-semibold mb-8 animate-fade-in">
            <FiCheckCircle size={16} />
            <span>La plataforma líder para conectar con profesionales</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
            Encuentra al <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">profesional ideal</span> para tu próximo proyecto
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Conectamos clientes con los mejores proveedores de servicios en tiempo real. Rápido, seguro y transparente.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full px-10 h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/40">
                Empezar Ahora
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full px-10 h-14 text-lg font-bold border-gray-700 bg-gray-900/50 hover:bg-gray-800">
                Iniciar Sesión
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-gray-800/60 mt-10">
            <div>
              <p className="text-3xl font-bold text-white">+10k</p>
              <p className="text-sm text-gray-500 uppercase tracking-widest">Proveedores</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">+50k</p>
              <p className="text-sm text-gray-500 uppercase tracking-widest">Proyectos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">99%</p>
              <p className="text-sm text-gray-500 uppercase tracking-widest">Satisfacción</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm text-gray-500 uppercase tracking-widest">Soporte</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gray-900/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">¿Por qué elegir nuestra plataforma?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Diseñado para ofrecerte la mejor experiencia en la búsqueda y contratación de servicios.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FiSearch size={32} className="text-blue-500" />}
              title="Búsqueda Inteligente"
              description="Encuentra exactamente lo que necesitas con nuestros filtros avanzados por categoría y ubicación."
            />
            <FeatureCard
              icon={<FiShield size={32} className="text-cyan-500" />}
              title="Seguridad Garantizada"
              description="Verificamos a cada proveedor para asegurar la calidad y honestidad en cada servicio."
            />
            <FeatureCard
              icon={<FiClock size={32} className="text-purple-500" />}
              title="Tiempo Real"
              description="Recibe notificaciones instantáneas sobre tus peticiones y postulaciones directamente en tu panel."
            />
            <FeatureCard
              icon={<FiUsers size={32} className="text-green-500" />}
              title="Comunidad Activa"
              description="Únete a miles de usuarios que ya están transformando la forma de trabajar y contratar."
            />
            <FeatureCard
              icon={<FiTrendingUp size={32} className="text-yellow-500" />}
              title="Escalabilidad"
              description="Ya sea un pequeño arreglo o un gran proyecto, tenemos al profesional adecuado para ti."
            />
            <FeatureCard
              icon={<FiFileText size={32} className="text-red-500" />}
              title="Gestión Simplificada"
              description="Todo el historial de tus trabajos y pagos en un solo lugar, sin complicaciones."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-12 md:p-20 text-center shadow-2xl">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-black/10 rounded-full" />

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">¿Listo para dar el siguiente paso?</h2>
            <p className="text-blue-100 text-xl mb-10 max-w-xl mx-auto">Crea tu cuenta hoy mismo y descubre todas las oportunidades que te esperan.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full px-12 h-14 text-lg font-black uppercase tracking-widest bg-gray-950 text-white hover:bg-black transition-all shadow-2xl shadow-black/40 border-none rounded-2xl">
                  Registrarse Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800 bg-gray-950 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-8">
            <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-[0.2em] italic">Búsqueda de Trabajo</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-lg">
              Conectando el talento con la oportunidad. Nuestra misión es empoderar a los profesionales y brindar soluciones de excelencia a clientes en todo el país.
            </p>
          </div>
          <div className="pt-8 border-t border-gray-800/60 text-center text-gray-600 text-sm">
            <p>&copy; {new Date().getFullYear()} Búsqueda de Trabajo. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-gray-800/40 border border-gray-700/50 hover:border-blue-500/50 hover:bg-gray-800/60 transition-all duration-300 group">
      <div className="mb-6 p-4 inline-block rounded-xl bg-gray-700/50 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
