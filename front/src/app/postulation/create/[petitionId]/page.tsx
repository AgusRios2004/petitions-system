'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler, useWatch, Controller } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { articleService } from '@/service/articleService';
import { postulationService } from '@/service/postulationService';
import { categoryService } from '@/service/categoryService';
import toast from 'react-hot-toast';
import { IArticle, ICategory } from '@/types/common';

type FormValues = {
  id_petition: number;
  proposal: string;
  cost: number;
  articles: {
    id_article: number;
    quantity: number;
    cost: number;
  }[];
};

export default function CreatePostulationPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const petitionId = parseInt(params.petitionId as string, 10);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // --- MEJORA 1: Usar useQuery para la carga de datos ---
  const { data: articlesData, isLoading: isLoadingArticles } = useQuery({
    queryKey: ['articles'],
    queryFn: () => articleService.getAllArticles(),
    select: (data) => data.data ?? [], // Extraemos y aseguramos que sea un array
  });
  const articles = articlesData ?? []; // Para evitar undefined

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });
  const categories = categoriesData ?? []; // Para evitar undefined

  const { register, handleSubmit, control, formState: { isSubmitting }, setValue } = useForm<FormValues>({
    defaultValues: {
      id_petition: petitionId,
      proposal: '',
      cost: 0,
      articles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'articles' });

  // --- MEJORA 3: Cálculo automático del costo total ---
  const watchedArticles = useWatch({ control, name: 'articles' });

  const suggestedCost = useMemo(() => {
    return watchedArticles.reduce((sum, article) => {
      return sum + (Number(article.cost) || 0) * (Number(article.quantity) || 0);
    }, 0);
  }, [watchedArticles]);

  // --- MEJORA 2: Usar useMemo para el estado derivado (filtrado) ---
  const filteredArticles = useMemo(() => {
    if (selectedCategory && selectedCategory !== 0) {
      return articles.filter(a => a.id_category === selectedCategory);
    }
    return articles;
  }, [selectedCategory, articles]);

  const isDataLoading = isLoadingArticles || isLoadingCategories;

  const postulationMutation = useMutation({
    mutationFn: postulationService.createPostulation,
    onSuccess: () => {
      toast.success('Postulación enviada con éxito!');
      // Invalida las queries para que los datos se refresquen en la app
      queryClient.invalidateQueries({ queryKey: ['postulations', petitionId] });
      queryClient.invalidateQueries({ queryKey: ['petition', petitionId] });
      if (user?.provider?.id_provider) {
        queryClient.invalidateQueries({ queryKey: ['openPetitions', user.provider.id_provider] });
      }
      router.push(`/profile?tab=oportunidades`); // Redirigir a la página de oportunidades del perfil
    },
    onError: (error: unknown) => {
      const err = error as { response?: { status?: number }, message?: string };
      if (err.response && err.response.status === 409) {
        toast.error('No se puede postular 2 veces a la misma petición.');
      } else {
        toast.error(err.message || 'Error al crear la postulación');
      }
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (!user?.provider?.id_provider) {
      toast.error('Solo los proveedores pueden postularse.');
      return;
    }

    if (data.cost <= 0) {
      toast.error('El costo total debe ser mayor a cero.');
      return;
    }

    postulationMutation.mutate({
      ...data,
      id_provider: user.provider.id_provider,
    });
  };

  if (isDataLoading) {
    return <div className="container mx-auto p-6 text-center">Cargando datos del formulario...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Crear Postulación</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">

          {/* Propuesta */}
          <div>
            <Label className="font-semibold text-gray-200 mb-2 block">Propuesta</Label>
            <Textarea
              {...register('proposal', { required: true })}
              placeholder="Escribí tu propuesta..."
              variant="dark"
            />
          </div>

          {/* Costo total */}
          <div>
            <Input
              type="number"
              label="Costo total"
              {...register('cost', { valueAsNumber: true })}
              placeholder="Costo total de la propuesta"
              variant="dark"
            />
            {suggestedCost > 0 && (
              <div className="mt-2 text-sm text-gray-400">
                Costo sugerido por artículos: <strong>${suggestedCost.toLocaleString('es-AR')}</strong>
                <button
                  type="button"
                  className="ml-2 text-blue-600 hover:underline font-semibold"
                  onClick={() => setValue('cost', suggestedCost, { shouldValidate: true })}
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>

          {/* Artículos */}
          <div>
            <div className="mb-4">
              <Select
                label="Filtrar artículos por Categoría"
                options={[
                  { value: 0, label: 'Todas las categorías' },
                  ...categories.map((c) => ({ value: c.id_category, label: c.name }))
                ]}
                value={selectedCategory || 0}
                onChange={(val) => setSelectedCategory(Number(val))}
                variant="dark"
              />
            </div>

            {fields.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-2 mb-3 p-3 border border-gray-600 rounded-lg bg-gray-700/50">

                <div className="flex-1">
                  <Controller
                    control={control}
                    name={`articles.${index}.id_article`}
                    render={({ field }) => (
                      <Select
                        label="Artículo"
                        id={`articles.${index}.id_article`}
                        options={[...new Set([...filteredArticles, articles.find(a => a.id_article === item.id_article)!])].filter(Boolean).map((a) => ({ value: a.id_article, label: a.name || 'Artículo sin nombre' }))}
                        value={field.value}
                        onChange={field.onChange}
                        variant="dark"
                        placeholder="Seleccione un artículo"
                      />
                    )}
                  />
                </div>

                <div className="flex-1">
                  <Input
                    type="number"
                    label="Cantidad"
                    {...register(`articles.${index}.quantity`, { valueAsNumber: true })}
                    placeholder="Ej: 1"
                    variant="dark"
                  />
                </div>

                <div className="flex-1">
                  <Input
                    type="number"
                    label="Costo"
                    {...register(`articles.${index}.cost`, { valueAsNumber: true })}
                    placeholder="Ej: 2500 (por unidad)"
                    variant="dark"
                  />
                </div>

                <div className="flex items-end">
                  <Button type="button" onClick={() => remove(index)} variant="destructive">
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              onClick={() => append({ id_article: 0, quantity: 1, cost: 0 })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Añadir Artículo
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700/50 mt-8">
            <div className="flex bg-gray-900 px-2 py-2 rounded-2xl border border-gray-700/50 gap-2 flex-1">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres volver? Los cambios no guardados se perderán.')) {
                    router.back();
                  }
                }}
                className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-xs uppercase tracking-widest border-none"
              >
                Volver
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/profile')}
                className="flex-1 h-12 rounded-xl text-gray-400 hover:text-white font-bold transition-all text-xs uppercase tracking-widest"
              >
                Dashboard
              </Button>
            </div>

            <Button
              type="submit"
              disabled={postulationMutation.isPending || isSubmitting}
              className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-900/40 border-none"
            >
              {postulationMutation.isPending ? 'Enviando...' : 'Enviar Postulación'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
