'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler, useWatch, Controller } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  proposal: string;
  cost: number;
  articles: {
    id_article: number;
    quantity: number;
    cost: number;
  }[];
};

export default function EditPostulationPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const postulationId = parseInt(params.id as string, 10);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // 1. Cargar datos de la postulación existente
  const { data: postulation, isLoading: isLoadingPostulation } = useQuery({
    queryKey: ['postulation', postulationId],
    queryFn: () => postulationService.getPostulationById(String(postulationId)),
    enabled: !!postulationId,
  });

  // 2. Cargar artículos y categorías (igual que en crear)
  const { data: articlesData, isLoading: isLoadingArticles } = useQuery({
    queryKey: ['articles'],
    queryFn: () => articleService.getAllArticles(),
    select: (data) => data.data ?? [],
  });
  const articles: IArticle[] = articlesData ?? [];

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });
  const categories: ICategory[] = categoriesData ?? [];

  const { register, handleSubmit, control, formState: { isSubmitting }, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      proposal: '',
      cost: 0,
      articles: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'articles' });

  // 3. Poblar el formulario cuando llegue la data de la postulación
  useEffect(() => {
    if (postulation) {
      const data = postulation.data || postulation;
      reset({
        proposal: data.proposal,
        cost: data.cost,
        // Mapeamos los artículos existentes de la postulación al formato del formulario
        articles: (data.inventories || (data as { postulationArticles?: { id_article?: number, article?: { id_article: number }, quantity: number, cost: number }[] }).postulationArticles)?.map((pa: { id_article?: number, article?: { id_article: number }, quantity: number, cost: number }) => ({
          id_article: pa.id_article || pa.article?.id_article || 0,
          quantity: pa.quantity,
          cost: pa.cost,
        })) || [],
      });
    }
  }, [postulation, reset]);

  // Cálculo de costo sugerido (igual que en crear)
  const watchedArticles = useWatch({ control, name: 'articles' });
  const suggestedCost = useMemo(() => {
    return watchedArticles?.reduce((sum, article) => {
      return sum + (Number(article.cost) || 0) * (Number(article.quantity) || 0);
    }, 0) || 0;
  }, [watchedArticles]);

  // Filtrado de artículos por categoría
  const filteredArticles = useMemo(() => {
    if (selectedCategory && selectedCategory !== 0) {
      return articles.filter(a => a.id_category === selectedCategory);
    }
    return articles;
  }, [selectedCategory, articles]);

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => postulationService.updatePostulation(String(postulationId), data),
    onSuccess: () => {
      toast.success('Postulación actualizada con éxito!');
      queryClient.invalidateQueries({ queryKey: ['postulation', postulationId] });
      queryClient.invalidateQueries({ queryKey: ['postulations'] });
      router.back();
    },
    onError: (error: unknown) => {
      const err = error as Error;
      toast.error(err.message || 'Error al actualizar la postulación');
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (data.cost <= 0) {
      toast.error('El costo total debe ser mayor a cero.');
      return;
    }
    updateMutation.mutate(data);
  };

  const isLoading = isLoadingPostulation || isLoadingArticles || isLoadingCategories;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!postulation) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <p>Postulación no encontrada o no tienes permisos.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Editar Postulación</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">

          {/* Propuesta */}
          <div>
            <Label className="font-semibold text-gray-300 mb-1 block">Propuesta</Label>
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
                  <Input type="number" label="Cantidad" {...register(`articles.${index}.quantity`, { valueAsNumber: true })} placeholder="Ej: 1" variant="dark" />
                </div>

                <div className="flex-1">
                  <Input type="number" label="Costo" {...register(`articles.${index}.cost`, { valueAsNumber: true })} placeholder="Ej: 2500" variant="dark" />
                </div>

                <div className="flex items-end">
                  <Button type="button" onClick={() => remove(index)} variant="destructive">Eliminar</Button>
                </div>
              </div>
            ))}

            <Button type="button" onClick={() => append({ id_article: 0, quantity: 1, cost: 0 })} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Añadir Artículo</Button>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="secondary" onClick={() => router.back()} className="w-full">Cancelar</Button>
            <Button type="submit" disabled={updateMutation.isPending || isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white">{updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}