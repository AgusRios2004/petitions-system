'use client';
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { articleService } from '@/service/articleService';
import { postulationService } from '@/service/postulationService';
import toast from 'react-hot-toast';
import { IArticle, ICategory } from '@/types/common';
import { categoryService } from '@/service/categoryService';
import Link from 'next/link';

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
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const postulationId = params.id as string;

  const [articles, setArticles] = useState<IArticle[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filteredArticles, setFilteredArticles] = useState<IArticle[]>([]);

  const { data: postulationData, isLoading: isPostulationLoading } = useQuery({
    queryKey: ['postulation', postulationId],
    queryFn: () => postulationService.getPostulationById(postulationId),
    enabled: !!postulationId,
  });

  const { register, handleSubmit, control, reset } = useForm<FormValues>();

  useEffect(() => {
    if (postulationData) {
      reset({
        proposal: postulationData.data.proposal,
        cost: postulationData.data.cost,
        articles: postulationData.data.inventories.map((inv: any) => ({
          id_article: inv.id_article,
          quantity: inv.quantity,
          cost: inv.cost,
        })),
      });
    }
  }, [postulationData, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'articles' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          articleService.getAllArticles(),
          categoryService.getAllCategories(),
        ]);
        if (articlesRes.data) {
          setArticles(articlesRes.data);
          setFilteredArticles(articlesRes.data);
        }
        if (categoriesRes.data) setCategories(categoriesRes.data);
      } catch (error) {
        toast.error('Error al cargar datos maestros.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 0) {
      setFilteredArticles(articles.filter(a => a.id_category === selectedCategory));
    } else {
      setFilteredArticles(articles);
    }
  }, [selectedCategory, articles]);

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => postulationService.updatePostulation(postulationId, data),
    onSuccess: () => {
      toast.success('Postulación actualizada con éxito!');
      queryClient.invalidateQueries({ queryKey: ['postulations'] });
      queryClient.invalidateQueries({ queryKey: ['postulation', postulationId] });
      router.push('/profile?tab=postulaciones');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar la postulación');
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () => {
      const CANCELED_STATE_ID = 5; //
      return postulationService.changePostulationState(postulationId, { id_state: CANCELED_STATE_ID, id_user_update: user!.id_user });
    },
    onSuccess: () => {
      toast.success('Te has dado de baja de la postulación.');
      queryClient.invalidateQueries({ queryKey: ['postulations'] });
      queryClient.invalidateQueries({ queryKey: ['postulation', postulationId] });
      router.push('/profile?tab=postulaciones');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al darse de baja');
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    updateMutation.mutate(data);
  };

  const handleWithdraw = () => {
    if (window.confirm('¿Estás seguro de que quieres darte de baja de esta postulación? Esta acción no se puede deshacer.')) {
      withdrawMutation.mutate();
    }
  };

  if (isPostulationLoading) return <p>Cargando postulación...</p>;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-4">
          <Link href="/profile?tab=postulaciones" className="text-blue-500 hover:underline">
            &larr; Volver a Mis Postulaciones
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-4">Editar Postulación</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <Label className="font-semibold">Propuesta</Label>
            <Textarea variant='white' {...register('proposal', { required: true })} />
          </div>

          <div>
            <Label className="font-semibold">Costo total</Label>
            <Input type="number" variant='white' {...register('cost', { valueAsNumber: true })} />
          </div>

          <div>
            <Label className="font-semibold">Artículos</Label>
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
                  <Label htmlFor={`articles.${index}.quantity`} className="text-sm">Cantidad</Label>
                  <Input
                    type="number"
                    {...register(`articles.${index}.quantity`, { valueAsNumber: true })}
                    placeholder="Ej: 10"
                    variant="white"
                  />
                </div>

                <div className="flex-1">
                  <Label htmlFor={`articles.${index}.cost`} className="text-sm">Costo</Label>
                  <Input
                    type="number"
                    {...register(`articles.${index}.cost`, { valueAsNumber: true })}
                    placeholder="Ej: 2500"
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
            <Button type="button" onClick={() => append({ id_article: 0, quantity: 1, cost: 0 })} className="w-full">
              Añadir Artículo
            </Button>
          </div>

          <div className="flex gap-4 mt-6 border-t pt-4">
            <Button type="button" variant="destructive" onClick={handleWithdraw} disabled={withdrawMutation.isPending} className="w-full">
              {withdrawMutation.isPending ? 'Dando de baja...' : 'Darse de baja'}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="w-full">
              {updateMutation.isPending ? 'Guardando...' : 'Confirmar Cambios'}
            </Button>
          </div>
          <div className="flex mt-4">
            <Button type="button" variant="secondary" onClick={() => router.push('/profile?tab=postulaciones')} className="w-full">
              Volver
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
