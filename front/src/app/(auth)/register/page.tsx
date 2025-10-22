'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import axios from 'axios';
import { Country, Province, Department, City, Profession, TypeProvider } from '@/types/common';


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
});

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [typeProviders, setTypeProviders] = useState<TypeProvider[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default role

  // Customer specific
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');

  // Provider specific
  const [professionId, setProfessionId] = useState('');
  const [typeProviderId, setTypeProviderId] = useState('');
  const [description, setDescription] = useState('');

  // Address specific
  const [countryId, setCountryId] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [cityId, setCityId] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, typeProvRes, countryRes] = await Promise.all([
          api.get('/professions'),
          api.get('/type-providers'),
          api.get('/countries'),
        ]);
        setProfessions(profRes.data.data || []);
        setTypeProviders(typeProvRes.data.data || []);
        setCountries(countryRes.data.data || []);
        setProvinces([]); // Initialize as empty, will be fetched dynamically
        setDepartments([]); // Initialize as empty, will be fetched dynamically
        setCities([]); // Initialize as empty, will be fetched dynamically
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
        setError("No se pudieron cargar los datos para el formulario. Inténtalo de nuevo más tarde.");
      }
    };
    fetchData();
  }, []);

  // Fetch provinces when countryId changes
  useEffect(() => {
    if (countryId) {
      const fetchProvinces = async () => {
        try {
          const res = await api.get(`/provinces/${countryId}/countries`);
          setProvinces(res.data.data || []);
          setProvinceId(''); // Reset province selection
          setDepartmentId(''); // Reset department selection
          setCities([]); // Clear cities
          setDepartments([]); // Clear departments
        } catch (err) {
          console.error("Failed to fetch provinces", err);
          setProvinces([]);
        }
      };
      fetchProvinces();
    } else {
      setProvinces([]);
      setProvinceId('');
      setDepartmentId('');
      setCities([]);
      setDepartments([]);
    }
  }, [countryId]);

  // Fetch departments when provinceId changes
  useEffect(() => {
    if (provinceId) {
      const fetchDepartments = async () => {
        try {
          const res = await api.get(`/departments/${provinceId}/provinces`);
          setDepartments(res.data.data || []);
          setDepartmentId(''); // Reset department selection
          setCities([]); // Clear cities
        } catch (err) {
          console.error("Failed to fetch departments", err);
          setDepartments([]);
        }
      };
      fetchDepartments();
    } else {
      setDepartments([]);
      setDepartmentId('');
      setCities([]);
    }
  }, [provinceId]);

  // Fetch cities when departmentId changes
  useEffect(() => {
    if (departmentId) {
      const fetchCities = async () => {
        try {
          const res = await api.get(`/cities/${departmentId}/departments`);
          setCities(res.data.data || []);
          setCityId(''); // Reset city selection
        } catch (err) {
          console.error("Failed to fetch cities", err);
          setCities([]);
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setCityId('');
    }
  }, [departmentId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const userData = { name, lastname, email, password, role };
    const addressData = { street, number, floor, apartment, postal_code: postalCode, id_city: cityId };
    const customerData = { dni, phone };
    const providerData = { professionId, typeProviderId, description };

    let payload = { ...userData, address: addressData };
    if (role === 'customer') {
      payload = { ...payload, ...customerData };
    } else {
      payload = { ...payload, ...providerData };
    }

    try {

      const result = await register(payload);

      if (result.success) {
        router.push('/login?registration=success');
      } else {
        setError(result.message || 'Error al registrarse');
      }
    } catch (err: any) {
      setError(err?.message || 'Error de red. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 py-12">
      <div className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
        
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Crear una cuenta</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Únete a nuestra comunidad.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* --- ROLE SELECTOR --- */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setRole('customer')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${role === 'customer' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
              Soy Cliente
            </button>
            <button type="button" onClick={() => setRole('provider')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${role === 'provider' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'}`}>
              Soy Proveedor
            </button>
          </div>

          {/* --- USER FIELDS --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label><Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><label htmlFor="lastname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</label><Input id="lastname" type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} required /></div>
          </div>
          <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>

          {/* --- DYNAMIC FIELDS --- */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            {role === 'customer' && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Datos de Cliente</h3>
                <div><label htmlFor="dni" className="block text-sm font-medium text-gray-700 dark:text-gray-300">DNI</label><Input id="dni" type="text" value={dni} onChange={(e) => setDni(e.target.value)} required /></div>
                <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label><Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
              </div>
            )}

            {role === 'provider' && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Datos de Proveedor</h3>
                <div>
                  <label htmlFor="typeProviderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Proveedor</label>
                  <select id="typeProviderId" value={typeProviderId} onChange={(e) => setTypeProviderId(e.target.value)} required className="w-full mt-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 text-white">
                    <option value="">Selecciona un tipo...</option>
                    {typeProviders.map(tp => <option key={tp.id_type_provider} value={tp.id_type_provider}>{tp.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="professionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profesión</label>
                  <select id="professionId" value={professionId} onChange={(e) => setProfessionId(e.target.value)} required className="w-full mt-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 text-white">
                    <option value="">Selecciona una profesión...</option>
                    {professions.map(p => <option key={p.id_profession} value={p.id_profession}>{p.name}</option>)}
                  </select>
                </div>
                <div><label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 block text-sm font-medium text-gray-700 dark:text-gray-300" /></div>
              </div>
            )}
          </div>

          {/* --- ADDRESS FIELDS --- */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Dirección</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
              <div>
                <label htmlFor="countryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">País</label>
                <select id="countryId" value={countryId} onChange={(e) => setCountryId(e.target.value)} required className="w-full mt-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 text-white">
                  <option value="">Selecciona un país...</option>
                  {countries.map(c => <option key={c.id_country} value={c.id_country}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="provinceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Provincia</label>
                <select id="provinceId" value={provinceId} onChange={(e) => setProvinceId(e.target.value)} required className="w-full mt-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 text-white" disabled={!countryId}>
                  <option value="">Selecciona una provincia...</option>
                  {provinces.map(p => <option key={p.id_province} value={p.id_province}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Departamento</label>
                <select id="departmentId" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required className="w-full mt-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 text-white" disabled={!provinceId}>
                  <option value="">Selecciona un departamento...</option>
                  {departments.map(d => <option key={d.id_department} value={d.id_department}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="cityId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ciudad</label>
                <select id="cityId" value={cityId} onChange={(e) => setCityId(e.target.value)} required className="w-full mt-1 bg-gray-200 dark:bg-gray-800 rounded-md p-2 text-white" disabled={!departmentId}>
                  <option value="">Selecciona una ciudad...</option>
                  {cities.map(c => <option key={c.id_city} value={c.id_city}>{c.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2"><label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Calle</label><Input id="street" type="text" value={street} onChange={(e) => setStreet(e.target.value)} required /></div>
              <div><label htmlFor="number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número</label><Input id="number" type="text" value={number} onChange={(e) => setNumber(e.target.value)} /></div>
              <div><label htmlFor="floor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Piso (Opcional)</label><Input id="floor" type="text" value={floor} onChange={(e) => setFloor(e.target.value)} /></div>
              <div><label htmlFor="apartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Depto. (Opcional)</label><Input id="apartment" type="text" value={apartment} onChange={(e) => setApartment(e.target.value)} /></div>
              <div><label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código Postal</label><Input id="postalCode" type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} /></div>
            </div>
          </div>

          <div className="pt-1">
            <Button type="submit" variant="primary" size="md" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Registrando...' : 'Crear cuenta'}</Button>
          </div>
        </form>

        {error && <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-800 dark:bg-red-950/50 dark:text-red-300"><p>{error}</p></div>}

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes una cuenta? <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
