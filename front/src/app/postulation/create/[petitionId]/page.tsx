'use client';
import React, { useMemo, useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler, useWatch } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
      queryClient.invalidateQueries({ queryKey: ['postulations', petitionId] });
      queryClient.invalidateQueries({ queryKey: ['petition', petitionId] });
      router.push(`/petition/${petitionId}`);
    },
    onError: (error: any) => {
      if (error.response && error.response.status === 409) {
        toast.error('No se puede postular 2 veces a la misma petición.');
      } else {
        toast.error(error.message || 'Error al crear la postulación');
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
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Crear Postulación</h2>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">

          {/* Propuesta */}
          <div>
            <Label className="font-semibold">Propuesta</Label>
            <Textarea
              {...register('proposal', { required: true })}
              placeholder="Escribí tu propuesta..."
              variant="white"
            />
          </div>

          {/* Costo total */}
          <div>
            <Input
              type="number"
              label="Costo total"
              {...register('cost', { valueAsNumber: true })}
              placeholder="Costo total de la propuesta"
              variant="white"
            />
            {suggestedCost > 0 && (
              <div className="mt-2 text-sm text-gray-500">
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
            <Label className="font-semibold">Categorías</Label>
            <div className="flex gap-2 mb-2 mt-1">
              <select
                onChange={(e) => setSelectedCategory(parseInt(e.target.value, 10))}
                className="p-2 border rounded w-full bg-white text-gray-900 max-h-30 overflow-y-auto"
              >
                <option value="0">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id_category} value={c.id_category}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {fields.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-2 mb-3 p-3 border border-blue-100 rounded-lg bg-blue-50/40">
                
                <div className="flex-1">
                  <Label htmlFor={`articles.${index}.id_article`} className="text-sm">Artículo</Label>
                  <select
                    {...register(`articles.${index}.id_article`, { valueAsNumber: true })}
                    className="p-2 border rounded w-full bg-white text-gray-900"
                  >
                    <option value="0" disabled>Seleccione un artículo</option>
                    {[...new Set([...filteredArticles, articles.find(a => a.id_article === item.id_article)!])].filter(Boolean).map((a) => (
                      <option key={a.id_article} value={a.id_article}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <Input
                    type="number"
                    label="Cantidad"
                    {...register(`articles.${index}.quantity`, { valueAsNumber: true })}
                    placeholder="Ej: 1"
                    variant="white"
                  />
                </div>

                <div className="flex-1">
                  <Input
                    type="number"
                    label="Costo"
                    {...register(`articles.${index}.cost`, { valueAsNumber: true })}
                    placeholder="Ej: 2500 (por unidad)"
                    variant="white"
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
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Añadir Artículo
            </Button>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres volver? Los cambios no guardados se perderán.')) {
                  router.push(`/petition/${petitionId}`);
                }
              }}
              className="w-full"
            >
              Volver
            </Button>
            <Button
              type="submit"
              disabled={postulationMutation.isPending || isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {postulationMutation.isPending ? 'Enviando...' : 'Enviar Postulación'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
