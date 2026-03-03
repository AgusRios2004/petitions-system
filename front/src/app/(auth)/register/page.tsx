'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import apiClient from '@/service/apiClient';
import { Country, Province, Department, City, Profession, TypeProvider } from '@/types/common';


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
          apiClient.get('/professions'),
          apiClient.get('/type-providers'),
          apiClient.get('/countries'),
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
          const res = await apiClient.get(`/provinces/${countryId}/countries`);
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
          const res = await apiClient.get(`/departments/${provinceId}/provinces`);
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
          const res = await apiClient.get(`/cities/${departmentId}/departments`);
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

    // Validación manual para los Selects (ya que no usan 'required' nativo)
    if (role === 'provider') {
      if (!typeProviderId) { setError("Debes seleccionar un tipo de proveedor."); setIsSubmitting(false); return; }
      if (!professionId) { setError("Debes seleccionar una profesión."); setIsSubmitting(false); return; }
    }

    if (!countryId) { setError("Debes seleccionar un país."); setIsSubmitting(false); return; }
    if (!provinceId) { setError("Debes seleccionar una provincia."); setIsSubmitting(false); return; }
    if (!departmentId) { setError("Debes seleccionar un departamento."); setIsSubmitting(false); return; }
    if (!cityId) { setError("Debes seleccionar una ciudad."); setIsSubmitting(false); return; }

    const userData = { name, lastname, email, password, role };
    const addressData = { street, number, floor, apartment, postal_code: postalCode, id_city: Number(cityId) };
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
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Error de red. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 py-12">
      <div className="w-full max-w-2xl mx-4 bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-800">

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-100">Crear una cuenta</h1>
          <p className="mt-1 text-sm text-gray-400">Únete a nuestra comunidad.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* --- ROLE SELECTOR --- */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setRole('customer')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${role === 'customer' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>
              Soy Cliente
            </button>
            <button type="button" onClick={() => setRole('provider')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${role === 'provider' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>
              Soy Proveedor
            </button>
          </div>

          {/* --- USER FIELDS --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div><Input id="name" label="Nombre" type="text" value={name} onChange={(e) => setName(e.target.value)} variant="dark" required /></div>
            <div><Input id="lastname" label="Apellido" type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} variant="dark" required /></div>
          </div>
          <div><Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} variant="dark" required /></div>
          <div><Input id="password" label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} variant="dark" required /></div>

          {/* --- DYNAMIC FIELDS --- */}
          <div className="pt-4 border-t border-gray-700">
            {role === 'customer' && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-100">Datos de Cliente</h3>
                <div><Input id="dni" label="DNI" type="text" value={dni} onChange={(e) => setDni(e.target.value)} variant="dark" required /></div>
                <div><Input id="phone" label="Teléfono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} variant="dark" required /></div>
              </div>
            )}

            {role === 'provider' && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-100">Datos de Proveedor</h3>
                <div>
                  <Select
                    id="typeProviderId"
                    label="Tipo de Proveedor"
                    options={typeProviders.map(tp => ({ value: tp.id_type_provider, label: tp.name }))}
                    value={typeProviderId ? Number(typeProviderId) : null}
                    onChange={(val) => setTypeProviderId(val ? String(val) : '')}
                    placeholder="Selecciona un tipo..."
                    variant="dark"
                  />
                </div>
                <div>
                  <Select
                    id="professionId"
                    label="Profesión"
                    options={professions.map(p => ({ value: p.id_profession, label: p.name }))}
                    value={professionId ? Number(professionId) : null}
                    onChange={(val) => setProfessionId(val ? String(val) : '')}
                    placeholder="Selecciona una profesión..."
                    variant="dark"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="mb-1 block text-gray-300">Descripción</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    variant="dark"
                  />
                </div>
              </div>
            )}
          </div>

          {/* --- ADDRESS FIELDS --- */}
          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-lg font-medium text-gray-100">Dirección</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
              <div>
                <Select
                  id="countryId"
                  label="País"
                  options={countries.map(c => ({ value: c.id_country, label: c.name }))}
                  value={countryId ? Number(countryId) : null}
                  onChange={(val) => setCountryId(val ? String(val) : '')}
                  placeholder="Selecciona un país..."
                  variant="dark"
                />
              </div>
              <div>
                <Select
                  id="provinceId"
                  label="Provincia"
                  options={provinces.map(p => ({ value: p.id_province, label: p.name }))}
                  value={provinceId ? Number(provinceId) : null}
                  onChange={(val) => setProvinceId(val ? String(val) : '')}
                  placeholder="Selecciona una provincia..."
                  disabled={!countryId}
                  variant="dark"
                />
              </div>
              <div>
                <Select
                  id="departmentId"
                  label="Departamento"
                  options={departments.map(d => ({ value: d.id_department, label: d.name }))}
                  value={departmentId ? Number(departmentId) : null}
                  onChange={(val) => setDepartmentId(val ? String(val) : '')}
                  placeholder="Selecciona un departamento..."
                  disabled={!provinceId}
                  variant="dark"
                />
              </div>
              <div>
                <Select
                  id="cityId"
                  label="Ciudad"
                  options={cities.map(c => ({ value: c.id_city, label: c.name }))}
                  value={cityId ? Number(cityId) : null}
                  onChange={(val) => setCityId(val ? String(val) : '')}
                  placeholder="Selecciona una ciudad..."
                  disabled={!departmentId}
                  variant="dark"
                />
              </div>
              <div className="sm:col-span-2"><Input id="street" label="Calle" type="text" value={street} onChange={(e) => setStreet(e.target.value)} variant="dark" required /></div>
              <div><Input id="number" label="Número" type="text" value={number} onChange={(e) => setNumber(e.target.value)} variant="dark" /></div>
              <div><Input id="floor" label="Piso (Opcional)" type="text" value={floor} onChange={(e) => setFloor(e.target.value)} variant="dark" /></div>
              <div><Input id="apartment" label="Depto. (Opcional)" type="text" value={apartment} onChange={(e) => setApartment(e.target.value)} variant="dark" /></div>
              <div><Input id="postalCode" label="Código Postal" type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} variant="dark" /></div>
            </div>
          </div>

          <div className="pt-1">
            <Button type="submit" variant="primary" size="md" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Registrando...' : 'Crear cuenta'}</Button>
          </div>
        </form>

        {error && <div className="mt-4 p-3 bg-red-950/50 border border-red-800 rounded-lg text-red-300"><p>{error}</p></div>}

        <p className="mt-6 text-center text-sm text-gray-400">
          ¿Ya tienes una cuenta? <Link href="/login" className="font-medium text-blue-400 hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
