import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, ImagePlus, LoaderCircle, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Skeleton } from '../components/ui/skeleton';
import { zodErrorsToFieldMap } from '../hooks/useAuth';
import { getStoredToken } from '@/core/api/client';
import { ROUTES } from '@/core/constants';
import { getCategories, getCities, getConditions, getItemTypes } from '@/core/api/services/meta';
import { createPost, deletePostImage, getMyPostDetail, updatePost, type PostRecord } from '@/core/api/services/posts';
import { createPostSchema } from '@/core/validators';

interface UploadImage {
  file: File;
  preview: string;
}

interface ExistingImage {
  id: number;
  url: string;
}

interface FormState {
  category_id: string;
  title: string;
  description: string;
  item_type_id: string;
  condition_id: string;
  price: string;
  deposit: string;
  rent_per_day: string;
  city_id: string;
}

const initialFormState: FormState = {
  category_id: '',
  title: '',
  description: '',
  item_type_id: '',
  condition_id: '',
  price: '',
  deposit: '',
  rent_per_day: '',
  city_id: '',
};

export function CreateAdPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isEditMode = Boolean(id);
  const [step, setStep] = useState(1);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingPost, setLoadingPost] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Array<{ id: number; title: string }>>([]);
  const [cities, setCities] = useState<Array<{ id: number; title: string }>>([]);
  const [conditions, setConditions] = useState<Array<{ id: number; title: string }>>([]);
  const [itemTypes, setItemTypes] = useState<Array<{ id: number; title: string }>>([]);
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [images, setImages] = useState<UploadImage[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);

  useEffect(() => {
    if (!getStoredToken()) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    let active = true;

    async function loadMeta() {
      setLoadingMeta(true);
      setError(null);

      try {
        const [categoryRecords, cityRecords, conditionRecords, itemTypeRecords] = await Promise.all([
          getCategories(),
          getCities(),
          getConditions(),
          getItemTypes(),
        ]);

        if (!active) return;

        setCategories(categoryRecords.map((item) => ({ id: item.id, title: item.title })));
        setCities(cityRecords.map((item) => ({ id: item.id, title: item.title })));
        setConditions(conditionRecords.map((item) => ({ id: item.id, title: item.title })));
        setItemTypes(itemTypeRecords.map((item) => ({ id: item.id, title: item.title })));
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load ad form data.');
      } finally {
        if (active) setLoadingMeta(false);
      }
    }

    void loadMeta();

    return () => {
      active = false;
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [navigate]);

  useEffect(() => {
    let active = true;

    async function loadPost() {
      if (!id) return;

      setLoadingPost(true);
      setError(null);

      try {
        const res = await getMyPostDetail(id);
        if (!active) return;
        hydrateForm(res.data);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load listing for edit.');
      } finally {
        if (active) setLoadingPost(false);
      }
    }

    void loadPost();

    return () => {
      active = false;
    };
  }, [id]);

  const requiresRentFields = Number(formData.item_type_id || 0) === 2;
  const totalImages = existingImages.length + images.length;

  function hydrateForm(post: PostRecord) {
    setFormData({
      category_id: String(post.category?.id ?? post['category_id'] ?? ''),
      title: post.title ?? '',
      description: post.description ?? '',
      item_type_id: String(post.item_type?.id ?? post['item_type_id'] ?? ''),
      condition_id: String(post.condition?.id ?? post['condition_id'] ?? ''),
      price: post.price != null ? String(post.price) : '',
      deposit: post.deposit != null ? String(post.deposit) : '',
      rent_per_day: post.rent_per_day != null ? String(post.rent_per_day) : '',
      city_id: String(post.city?.id ?? post['city_id'] ?? ''),
    });
    setExistingImages(
      (post.post_images ?? post.images ?? []).map((image) => ({
        id: image.id,
        url: image.images,
      }))
    );
    setStep(2);
  }

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormData((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function removeImage(index: number) {
    setImages((current) => {
      const target = current[index];
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setImages((current) => {
      const availableSlots = Math.max(0, 8 - existingImages.length - current.length);
      const acceptedFiles = files.slice(0, availableSlots);
      return [
        ...current,
        ...acceptedFiles.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        })),
      ];
    });

    event.target.value = '';
  }

  async function handleDeleteExistingImage(imageId: number) {
    if (!id) return;

    try {
      await deletePostImage({ post_id: Number(id), post_image_id: imageId });
      setExistingImages((current) => current.filter((image) => image.id !== imageId));
      toast.success('Image removed.');
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'Failed to delete image.');
    }
  }

  function buildPayload() {
    return createPostSchema.safeParse({
      category_id: Number(formData.category_id),
      item_type_id: Number(formData.item_type_id),
      condition_id: Number(formData.condition_id),
      city_id: Number(formData.city_id),
      title: formData.title,
      description: formData.description,
      price: formData.price,
      deposit: formData.deposit,
      rent_per_day: formData.rent_per_day,
      images: images.map((image) => image.file),
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = buildPayload();

    if (!parsed.success) {
      setFieldErrors(zodErrorsToFieldMap(parsed.error));
      toast.error('Please fix the highlighted fields.');
      return;
    }

    const payload = new FormData();
    payload.set('category_id', String(parsed.data.category_id));
    payload.set('item_type_id', String(parsed.data.item_type_id));
    payload.set('condition_id', String(parsed.data.condition_id));
    payload.set('city_id', String(parsed.data.city_id));
    payload.set('title', parsed.data.title.trim());
    payload.set('description', parsed.data.description.trim());

    if (requiresRentFields) {
      payload.set('deposit', formData.deposit);
      payload.set('rent_per_day', formData.rent_per_day);
    } else {
      payload.set('price', formData.price);
    }

    images.forEach((image) => payload.append('images[]', image.file));

    setSubmitting(true);
    setFieldErrors({});

    try {
      const res = isEditMode && id ? await updatePost(Number(id), payload) : await createPost(payload);
      if (res.status !== 1) throw new Error(res.message || 'Failed to save listing.');

      toast.success(isEditMode ? 'Listing updated successfully.' : 'Ad submitted successfully.');
      navigate(ROUTES.MY_ADS, { replace: true });
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : 'Failed to submit ad.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 rounded-2xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">{isEditMode ? 'Edit Listing' : 'Create New Ad'}</h1>
                <p className="text-gray-600">
                  {isEditMode ? 'Update your listing details and media.' : 'Fill in the details to publish your listing.'}
                </p>
              </div>
              {isEditMode ? (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.MY_ADS)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : null}
            </div>
          </div>

          {error ? <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">{error}</div> : null}

          <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${step >= 1 ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                <span className={step >= 1 ? 'font-medium text-pink-600' : 'text-gray-500'}>Category</span>
              </div>
              <div className="mx-4 h-1 flex-1 bg-gray-200">
                <div className={`h-full transition-all ${step >= 2 ? 'bg-pink-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }} />
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${step >= 2 ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                <span className={step >= 2 ? 'font-medium text-pink-600' : 'text-gray-500'}>Details</span>
              </div>
            </div>
          </div>

          {loadingMeta || loadingPost ? (
            <div className="space-y-4 rounded-2xl bg-white p-8 shadow-lg">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-8 shadow-lg">
              {step === 1 ? (
                <>
                  <h3 className="mb-4 text-xl font-bold text-gray-900">Select Category</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        htmlFor={`category-${category.id}`}
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                          formData.category_id === String(category.id) ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                        }`}
                      >
                        <input
                          id={`category-${category.id}`}
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={formData.category_id === String(category.id)}
                          onChange={(event) => updateField('category_id', event.target.value)}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="mb-2 text-lg font-semibold text-gray-900">{category.title}</div>
                          <p className="text-sm text-gray-500">Use this category for your listing placement.</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {fieldErrors.category_id ? <p className="text-sm text-red-600">{fieldErrors.category_id}</p> : null}
                  <button
                    type="button"
                    onClick={() => formData.category_id && setStep(2)}
                    disabled={!formData.category_id}
                    className="w-full rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-3 font-semibold text-white transition-shadow hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Listing Details</h3>
                    <button type="button" onClick={() => setStep(1)} className="text-pink-600 hover:underline">
                      Back to category
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="ad-title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      id="ad-title"
                      type="text"
                      value={formData.title}
                      onChange={(event) => updateField('title', event.target.value)}
                      placeholder="e.g. Bridal Lehenga for Walima"
                      className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${fieldErrors.title ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-pink-500'}`}
                    />
                    {fieldErrors.title ? <p className="text-sm text-red-600">{fieldErrors.title}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ad-description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      id="ad-description"
                      rows={6}
                      value={formData.description}
                      onChange={(event) => updateField('description', event.target.value)}
                      placeholder="Describe size, fabric, condition, original purchase price, and what is included."
                      className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${fieldErrors.description ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-pink-500'}`}
                    />
                    {fieldErrors.description ? <p className="text-sm text-red-600">{fieldErrors.description}</p> : null}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label htmlFor="ad-type" className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        id="ad-type"
                        value={formData.item_type_id}
                        onChange={(event) => updateField('item_type_id', event.target.value)}
                        className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${fieldErrors.item_type_id ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-pink-500'}`}
                      >
                        <option value="">Select type</option>
                        {itemTypes.map((itemType) => (
                          <option key={itemType.id} value={itemType.id}>
                            {itemType.title}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.item_type_id ? <p className="text-sm text-red-600">{fieldErrors.item_type_id}</p> : null}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="ad-condition" className="block text-sm font-medium text-gray-700">Condition</label>
                      <select
                        id="ad-condition"
                        value={formData.condition_id}
                        onChange={(event) => updateField('condition_id', event.target.value)}
                        className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${fieldErrors.condition_id ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-pink-500'}`}
                      >
                        <option value="">Select condition</option>
                        {conditions.map((condition) => (
                          <option key={condition.id} value={condition.id}>
                            {condition.title}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.condition_id ? <p className="text-sm text-red-600">{fieldErrors.condition_id}</p> : null}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="ad-city" className="block text-sm font-medium text-gray-700">City</label>
                      <select
                        id="ad-city"
                        value={formData.city_id}
                        onChange={(event) => updateField('city_id', event.target.value)}
                        className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${fieldErrors.city_id ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-pink-500'}`}
                      >
                        <option value="">Select city</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.title}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.city_id ? <p className="text-sm text-red-600">{fieldErrors.city_id}</p> : null}
                    </div>
                  </div>

                  {requiresRentFields ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="ad-deposit" className="block text-sm font-medium text-gray-700">Deposit</label>
                        <input
                          id="ad-deposit"
                          type="number"
                          min="0"
                          value={formData.deposit}
                          onChange={(event) => updateField('deposit', event.target.value)}
                          className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${fieldErrors.deposit ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-pink-500'}`}
                        />
                        {fieldErrors.deposit ? <p className="text-sm text-red-600">{fieldErrors.deposit}</p> : null}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="ad-rent" className="block text-sm font-medium text-gray-700">Rent Per Day</label>
                        <input
                          id="ad-rent"
                          type="number"
                          min="0"
                          value={formData.rent_per_day}
                          onChange={(event) => updateField('rent_per_day', event.target.value)}
                          className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${fieldErrors.rent_per_day ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-pink-500'}`}
                        />
                        {fieldErrors.rent_per_day ? <p className="text-sm text-red-600">{fieldErrors.rent_per_day}</p> : null}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label htmlFor="ad-price" className="block text-sm font-medium text-gray-700">Price (PKR)</label>
                      <input
                        id="ad-price"
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={(event) => updateField('price', event.target.value)}
                        className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 ${fieldErrors.price ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-pink-500'}`}
                      />
                      {fieldErrors.price ? <p className="text-sm text-red-600">{fieldErrors.price}</p> : null}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Images</label>
                        <p className="text-sm text-gray-500">Up to 8 images. JPG, PNG, or WebP. Max 5MB each.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={totalImages >= 8}
                        className="inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ImagePlus className="h-4 w-4" />
                        Add Images
                      </button>
                    </div>

                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleImageUpload}
                    />

                    {fieldErrors.images ? <p className="text-sm text-red-600">{fieldErrors.images}</p> : null}

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {existingImages.map((image) => (
                        <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                          <ImageWithFallback src={image.url} alt="Existing upload" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => void handleDeleteExistingImage(image.id)}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {images.map((image, index) => (
                        <div key={`${image.file.name}-${index}`} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                          <img src={image.preview} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {totalImages < 8 ? (
                        <button
                          type="button"
                          onClick={() => inputRef.current?.click()}
                          className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 transition-colors hover:border-pink-400 hover:text-pink-600"
                        >
                          <Upload className="h-7 w-7" />
                          <span className="mt-2">Upload</span>
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-4 font-semibold text-white transition-shadow hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
                    {submitting ? (isEditMode ? 'Updating...' : 'Submitting...') : isEditMode ? 'Update Listing' : 'Submit Ad'}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
